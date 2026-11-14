import { Router } from 'express';
import { FACILITY_KEYS, NEEDS } from '../shared/types';
import type { AssistantPlacePick, AssistantResponse, Lang, Need, PlaceView } from '../shared/types';
import { aiStatus, askJson } from './ai';
import { HttpError } from './errors';
import { getPlaces } from './places';

const WINDOW_MS = 10 * 60 * 1000;
const PER_DEVICE = 60;
const PER_IP = 300; // high enough for several judges behind one proxy address

const MEDICAL_SYSTEM =
  'You are a filter. Decide whether the user text asks for medical advice, medication, treatment or a diagnosis. ' +
  'Asking where to find an accessible place is NOT medical. Reply ONLY with JSON: {"medical": true} or {"medical": false}.';

const ANSWER_SYSTEM = `You are Darb's accessibility assistant for Kuwait. Darb helps people with disabilities find places they can use.
Rules:
- Use ONLY the place records given in the user message. Use no general knowledge about any place. Do not guess.
- Pick up to three places that best fit the question and the user's needs.
- For each pick give why_ar and why_en: one or two short sentences that name only facts found in that place's record (for example "Accessible parking: yes, 120 spaces").
- In facts[] list the facility keys (entrances, parking, lifts, toilets, seating) or the point ids that back the reason.
- If nothing fits, say so plainly in reply_ar and reply_en and return places [].
- If the question mentions any named venue (a hospital, mall, restaurant, park or other place) whose name does not match a record's name_ar or name_en, set unknown_place to true and places to [].
- Never give medical advice. Never use the words "safe" or «آمن»: Darb guides, it does not promise safety.
- Write for the needs: cognitive -> short, simple sentences; hearing -> do not rely on sound; visual -> describe in words, never "look for the colour"; elderly -> plain and calm.
Reply ONLY with JSON: {"unknown_place":bool,"reply_ar":string,"reply_en":string,"places":[{"place_id":string,"why_ar":string,"why_en":string,"facts":[string]}]}`;

// Short records for the AI: only what it needs, with each place's id.
function toRecord(p: PlaceView) {
  const facilities: Record<string, unknown> = {};
  for (const k of FACILITY_KEYS) {
    const f = p.facilities[k];
    if (f) facilities[k] = { available: f.available, count: f.count, note_en: f.note_en };
  }
  return {
    id: p.id, name_ar: p.name_ar, name_en: p.name_en, type: p.type, status: p.status, facilities,
    points: p.points.map((q) => ({ id: q.id, kind: q.kind, name_en: q.name_en, accessible: q.accessible, quiet: q.quiet })),
  };
}

const COGNITIVE_RULE =
  '\nThe user has cognitive needs: every sentence under 10 words, one idea per sentence, everyday words.';
const UNSAFE_WORDS = /\bsafe(ly|ty)?\b|آمن/i;
const isTrue = (v: unknown) => v === true || v === 'true';

function cap(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

const noAnswer = () => new HttpError(502, 'ai_no_answer', 'The assistant could not answer right now.');

// Check the AI's JSON before the screens ever see it.
function checkAnswer(raw: Record<string, unknown>, places: PlaceView[]): AssistantResponse {
  if (isTrue(raw.unknown_place)) return { kind: 'no_data' };
  const reply_ar = cap(raw.reply_ar, 600);
  const reply_en = cap(raw.reply_en, 600);
  if (!reply_ar || !reply_en || !Array.isArray(raw.places)) throw noAnswer();

  const picks: AssistantPlacePick[] = [];
  for (const item of raw.places as any[]) {
    if (picks.length >= 3) break;
    const place = places.find((p) => p.id === item?.place_id);
    const why_ar = cap(item?.why_ar, 300);
    const why_en = cap(item?.why_en, 300);
    if (!place || !why_ar || !why_en || !Array.isArray(item.facts)) continue;
    const facts = (item.facts as unknown[]).filter((f): f is string => {
      if (typeof f !== 'string') return false;
      if ((FACILITY_KEYS as string[]).includes(f)) {
        const a = place.facilities[f as (typeof FACILITY_KEYS)[number]]?.available;
        return a === 'yes' || a === 'no';
      }
      return place.points.some((q) => q.id === f);
    });
    if (!facts.length) continue;
    picks.push({ place_id: place.id, why_ar, why_en, facts: [...new Set(facts)] });
  }
  // The model picked places but none survived the check: its reply may name them, so show nothing.
  if ((raw.places as unknown[]).length > 0 && picks.length === 0) throw noAnswer();
  const texts = [reply_ar, reply_en, ...picks.flatMap((p) => [p.why_ar, p.why_en])];
  if (texts.some((x) => UNSAFE_WORDS.test(x))) throw noAnswer();
  return { kind: 'answer', reply_ar, reply_en, places: picks, model: aiStatus().model ?? '' };
}

function parseBody(body: any): { question: string; needs: Need[]; lang: Lang; device: string } {
  const q = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!q) throw new HttpError(400, 'bad_request', 'Please write a question.');
  if (q.length > 500) throw new HttpError(400, 'too_long', 'The question is too long (500 characters at most).');
  if (body.needs !== undefined && !Array.isArray(body.needs)) throw new HttpError(400, 'bad_request', 'needs must be a list.');
  const needs = ((body.needs ?? []) as unknown[]).filter((n): n is Need => NEEDS.includes(n as Need));
  const lang: Lang = body.lang === 'en' ? 'en' : 'ar';
  const device = body.device_id === undefined ? '' : body.device_id;
  if (typeof device !== 'string' || device.length > 100) throw new HttpError(400, 'bad_request', 'device_id is not valid.');
  return { question: q, needs, lang, device };
}

export function assistantRouter(): Router {
  const router = Router();
  const hits = new Map<string, number[]>(); // key -> times of recent calls

  function overLimit(key: string, max: number, now: number): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  }

  router.post('/', async (req, res, next) => {
    try {
      const { question, needs, lang, device } = parseBody(req.body);
      const now = Date.now();
      const limited = overLimit(`ip:${req.ip}`, PER_IP, now) || (device !== '' && overLimit(`dev:${device}`, PER_DEVICE, now));
      if (limited) throw new HttpError(429, 'rate_limited', 'Too many questions. Please wait a few minutes.');
      if (aiStatus().status !== 'ready') throw new HttpError(503, 'ai_not_set_up', 'The assistant is not set up yet.');

      const check = await askJson({ system: MEDICAL_SYSTEM, user: question });
      if (isTrue(check.medical)) return void res.json({ kind: 'medical' } satisfies AssistantResponse);

      const all = getPlaces();
      const real = all.filter((p) => !p.is_sample);
      const places = real.length ? real : all;
      if (!places.length) return void res.json({ kind: 'no_data' } satisfies AssistantResponse);

      const user = JSON.stringify({ places: places.map(toRecord), needs, language: lang, question });
      const system = needs.includes('cognitive') ? ANSWER_SYSTEM + COGNITIVE_RULE : ANSWER_SYSTEM;
      const raw = await askJson({ system, user });
      res.json(checkAnswer(raw, places));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
