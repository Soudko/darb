import { Router } from 'express';
import express from 'express';
import crypto from 'node:crypto';
import { CATEGORY_KEYS, PHOTO_KINDS, QUESTION_KEYS } from '../shared/types';
import type {
  Answer, CategoryKey, CommunityInfo, Facility, FacilityKey, PhotoKind, PlaceType, PlaceView, QuestionKey, Verification, YesNoUnknown,
} from '../shared/types';
import { db } from './db';
import { HttpError } from './errors';
import { workOutStatus } from './places';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMITS = 5; // per address per hour
const MAX_REPORTS = 20;
const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 1_500_000;
const BOUNDS = { latMin: 28.4, latMax: 30.2, lngMin: 46.4, lngMax: 48.7 }; // Kuwait and its coast

const TYPE_OF: Record<CategoryKey, PlaceType> = {
  mall: 'mall', restaurant: 'restaurant', hospital: 'service', government: 'service',
  education: 'other', park: 'park', entertainment: 'other', other: 'other',
};
const FACILITY_OF: Record<FacilityKey, QuestionKey> = {
  entrances: 'wheelchair_entrance', parking: 'accessible_parking', lifts: 'elevator', toilets: 'accessible_toilets', seating: 'seating',
};

const clean = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

function imageType(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

const newId = (prefix: string) => `${prefix}-${crypto.randomBytes(6).toString('hex')}`;

interface Row {
  id: string; name: string; category: CategoryKey; governorate: string; area: string; address: string; description: string;
  lat: number; lng: number; answers: Partial<Record<QuestionKey, Answer>>; answers_note: string; status: Verification; created_at: Date;
}

function toView(r: Row, photos: { id: string; kind: PhotoKind }[]): PlaceView {
  const date = r.created_at.toISOString().slice(0, 10);
  const facilities: Partial<Record<FacilityKey, Facility>> = {};
  for (const [fk, qk] of Object.entries(FACILITY_OF) as [FacilityKey, QuestionKey][]) {
    const a = (r.answers?.[qk] ?? 'unknown') as YesNoUnknown;
    facilities[fk] = { available: a, source: 'Community submission, not verified', date };
  }
  const community: CommunityInfo = {
    verification: r.status, category: r.category, governorate: r.governorate, area: r.area, address: r.address,
    description: r.description, answers: r.answers ?? {}, answers_note: r.answers_note,
    photos: photos.map((p) => ({ id: p.id, kind: p.kind, url: `/api/community/photos/${p.id}` })), created_at: r.created_at.toISOString(),
  };
  const place = {
    id: r.id, name_ar: r.name, name_en: r.name, type: TYPE_OF[r.category] ?? 'other', lat: r.lat, lng: r.lng,
    photo: '', facilities, points: [],
  };
  // An unreviewed place never counts as fully accessible, however it was answered.
  const status = workOutStatus(place);
  return { ...place, status: status === 'full' ? 'partial' : status, community };
}

// Every community place that has not been rejected. Never throws: if the database is down, the verified places still work.
export async function listCommunityPlaces(): Promise<PlaceView[]> {
  try {
    const rows = (await db().query<Row>(`SELECT * FROM community_places WHERE status <> 'rejected' ORDER BY created_at DESC LIMIT 500`)).rows;
    if (!rows.length) return [];
    const photos = (await db().query<{ id: string; place_id: string; kind: PhotoKind }>(
      `SELECT id, place_id, kind FROM community_photos WHERE place_id = ANY($1) ORDER BY created_at`, [rows.map((r) => r.id)],
    )).rows;
    return rows.map((r) => toView(r, photos.filter((p) => p.place_id === r.id)));
  } catch (e) {
    console.error('community: could not read places');
    return [];
  }
}

function adminOnly(req: express.Request) {
  const token = process.env.ADMIN_TOKEN || '';
  if (!token) throw new HttpError(503, 'unavailable', 'Moderation is not set up.');
  const given = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given), b = Buffer.from(token);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new HttpError(403, 'forbidden', 'Not allowed.');
}

export function communityRouter(): Router {
  const router = Router();
  const big = express.json({ limit: '12mb' }); // photos: only on POST /places, and only after the rate limit
  const small = express.json({ limit: '10kb' });
  const hits = new Map<string, number[]>();
  const over = (key: string, max: number) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  };

  router.get('/places', async (_req, res) => res.json({ places: await listCommunityPlaces() }));

  router.get('/photos/:id', async (req, res, next) => {
    try {
      const r = await db().query(`SELECT mime, data FROM community_photos p JOIN community_places c ON c.id = p.place_id WHERE p.id = $1 AND c.status <> 'rejected'`, [req.params.id]);
      if (!r.rows[0]) throw new HttpError(404, 'not_found', 'Not found.');
      res.set({ 'Content-Type': r.rows[0].mime, 'Cache-Control': 'public, max-age=600', 'X-Content-Type-Options': 'nosniff' });
      res.send(r.rows[0].data);
    } catch (e) { next(e); }
  });

  // The rate limit runs before the large body is read, so a flood of 12 MB uploads is turned away cheaply.
  const submitLimit: express.RequestHandler = (req, _res, next) =>
    next(over(`sub:${req.ip}`, MAX_SUBMITS) ? new HttpError(429, 'rate_limited', 'Too many submissions. Please try again later.') : undefined);

  router.post('/places', submitLimit, big, async (req, res, next) => {
    try {
      const b = req.body ?? {};
      const name = clean(b.name, 120);
      if (!name) throw new HttpError(400, 'bad_request', 'The place name is required.');
      if (!CATEGORY_KEYS.includes(b.category)) throw new HttpError(400, 'bad_request', 'The place category is required.');
      const lat = Number(b.lat), lng = Number(b.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < BOUNDS.latMin || lat > BOUNDS.latMax || lng < BOUNDS.lngMin || lng > BOUNDS.lngMax) {
        throw new HttpError(400, 'bad_request', 'The location must be inside Kuwait.');
      }
      const answers: Partial<Record<QuestionKey, Answer>> = {};
      for (const k of QUESTION_KEYS) {
        const v = b.answers?.[k];
        if (v === 'yes' || v === 'no' || v === 'unknown') answers[k] = v;
      }
      const rawPhotos: unknown[] = Array.isArray(b.photos) ? b.photos : [];
      if (rawPhotos.length > MAX_PHOTOS) throw new HttpError(400, 'bad_request', `At most ${MAX_PHOTOS} photos.`);
      const photos: { kind: PhotoKind; mime: string; data: Buffer }[] = [];
      for (const p of rawPhotos as any[]) {
        const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof p?.data_url === 'string' ? p.data_url : '');
        if (!m) throw new HttpError(400, 'bad_request', 'Photos must be JPEG, PNG or WebP.');
        const data = Buffer.from(m[1], 'base64');
        if (data.length > MAX_PHOTO_BYTES) throw new HttpError(400, 'too_long', 'A photo is too large (1.5 MB at most).');
        const mime = imageType(data);
        if (!mime) throw new HttpError(400, 'bad_request', 'Photos must be JPEG, PNG or WebP.');
        photos.push({ kind: PHOTO_KINDS.includes(p.kind) ? p.kind : 'other', mime, data });
      }

      const id = newId('c');
      const client = await db().connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `INSERT INTO community_places (id, name, category, governorate, area, address, description, lat, lng, answers, answers_note, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'unverified')`,
          [id, name, b.category, clean(b.governorate, 60), clean(b.area, 80), clean(b.address, 200), clean(b.description, 600),
            lat, lng, JSON.stringify(answers), clean(b.answers_note, 600)],
        );
        for (const p of photos) {
          await client.query(`INSERT INTO community_photos (id, place_id, kind, mime, data) VALUES ($1,$2,$3,$4,$5)`, [newId('p'), id, p.kind, p.mime, p.data]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
      const place = (await listCommunityPlaces()).find((p) => p.id === id);
      res.status(201).json({ place });
    } catch (e) { next(e); }
  });

  router.post('/places/:id/report', small, async (req, res, next) => {
    try {
      if (over(`rep:${req.ip}`, MAX_REPORTS)) throw new HttpError(429, 'rate_limited', 'Too many reports. Please try again later.');
      const message = clean(req.body?.message, 500);
      if (!message) throw new HttpError(400, 'bad_request', 'Please describe what is wrong.');
      const r = await db().query(`INSERT INTO community_reports (id, place_id, message) SELECT $1, id, $3 FROM community_places WHERE id = $2 RETURNING id`, [newId('r'), req.params.id, message]);
      if (!r.rows[0]) throw new HttpError(404, 'not_found', 'Not found.');
      res.status(201).json({ ok: true });
    } catch (e) { next(e); }
  });

  // Moderation: only with the admin token kept in Secrets.
  router.get('/reports', async (req, res, next) => {
    try {
      adminOnly(req);
      res.json({ reports: (await db().query(`SELECT id, place_id, message, created_at FROM community_reports ORDER BY created_at DESC LIMIT 200`)).rows });
    } catch (e) { next(e); }
  });
  router.patch('/places/:id/status', small, async (req, res, next) => {
    try {
      adminOnly(req);
      const status = req.body?.status;
      if (!['pending', 'unverified', 'verified', 'rejected'].includes(status)) throw new HttpError(400, 'bad_request', 'Unknown status.');
      const r = await db().query(`UPDATE community_places SET status = $1 WHERE id = $2 RETURNING id`, [status, req.params.id]);
      if (!r.rows[0]) throw new HttpError(404, 'not_found', 'Not found.');
      res.json({ ok: true });
    } catch (e) { next(e); }
  });

  return router;
}
