import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../../server/app';
import { call } from './helper';
import { loadPlaces, workOutStatus } from '../../server/places';

const f = (available: string) => ({ available, source: 's', date: '2026-11-14' });

describe('status', () => {
  it('full when entrances, parking, lifts, toilets are all yes', () => {
    const facilities: any = { entrances: f('yes'), parking: f('yes'), lifts: f('yes'), toilets: f('yes') };
    expect(workOutStatus({ facilities })).toBe('full');
  });
  it('partial when at least one is yes', () => {
    expect(workOutStatus({ facilities: { entrances: f('yes') as any, toilets: f('unknown') as any } })).toBe('partial');
  });
  it('unknown otherwise', () => {
    expect(workOutStatus({ facilities: { entrances: f('no') as any } })).toBe('unknown');
    expect(workOutStatus({ facilities: {} })).toBe('unknown');
  });
});

describe('loading', () => {
  it('skips an invalid place and keeps the good one', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'darb-')), 'p.json');
    const good = { id: 'a', name_ar: 'أ', name_en: 'A', type: 'mall', lat: 1, lng: 2, photo: '', facilities: {}, points: [] };
    fs.writeFileSync(file, JSON.stringify({ places: [good, { id: 'bad' }] }));
    const out = loadPlaces(file);
    expect(out.map((p) => p.id)).toEqual(['a']);
    expect(out[0].status).toBe('unknown');
  });
});

describe('GET /api/places', () => {
  it('returns places with a status', async () => {
    const res = await call(createApp(), 'GET', '/api/places');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.places)).toBe(true);
    expect(res.body.places[0]).toMatchObject({ id: 'sample-place', status: 'partial', is_sample: true });
  });
  it('unknown /api route is a 404 not_found', async () => {
    const res = await call(createApp(), 'GET', '/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });
});
