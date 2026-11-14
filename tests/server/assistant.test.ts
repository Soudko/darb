import { beforeEach, describe, expect, it, vi } from 'vitest';

const ai = vi.hoisted(() => ({ status: 'ready', askJson: vi.fn() }));
const store = vi.hoisted(() => ({ places: [] as any[] }));

vi.mock('../../server/ai', () => ({
  aiStatus: () => (ai.status === 'ready' ? { status: 'ready', model: 'test-model' } : { status: 'not_set_up' }),
  askJson: ai.askJson,
}));
vi.mock('../../server/places', () => ({ getPlaces: () => store.places }));

import { createApp } from '../../server/app';
import { call } from './helper';

const fac = (available: string, extra = {}) => ({ available, source: 's', date: '2026-11-14', ...extra });
const mk = (id: string, sample = false) => ({
  id, name_ar: id, name_en: id, type: 'mall', lat: 1, lng: 2, photo: '', is_sample: sample || undefined,
  status: 'partial', facilities: { parking: fac('yes', { count: 5 }), toilets: fac('unknown') },
  points: [{ id: `${id}-door`, kind: 'entrance', name_ar: 'x', name_en: 'Door', lat: 1, lng: 2, accessible: true, quiet: false }],
});
const body = (over = {}) => ({ question: 'Where can I park?', needs: ['mobility'], lang: 'en', device_id: 'dev1', ...over });
const answer = (places: any[], over = {}) => ({ unknown_place: false, reply_ar: 'ر', reply_en: 'r', places, ...over });
const post = (b: unknown, app = createApp()) => call(app, 'POST', '/api/assistant', b);

beforeEach(() => {
  ai.status = 'ready';
  ai.askJson.mockReset();
  store.places = [mk('real-1')];
});

describe('validation', () => {
  it('400 bad_request for an empty or wrong question', async () => {
    for (const q of ['', '   ', 42, undefined]) {
      const res = await post(body({ question: q }));
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('bad_request');
    }
  });
  it('400 too_long over 500 characters', async () => {
    const res = await post(body({ question: 'a'.repeat(501) }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('too_long');
  });
  it('503 ai_not_set_up', async () => {
    ai.status = 'off';
    const res = await post(body());
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('ai_not_set_up');
  });
});

describe('flow', () => {
  it('medical returns kind medical and makes no second AI call', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: true });
    const res = await post(body());
    expect(res.body).toEqual({ kind: 'medical' });
    expect(ai.askJson).toHaveBeenCalledTimes(1);
  });
  it('unknown_place gives no_data', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(answer([], { unknown_place: true }));
    const res = await post(body());
    expect(res.body).toEqual({ kind: 'no_data' });
  });
  it('no places at all gives no_data without the AI', async () => {
    store.places = [];
    ai.askJson.mockResolvedValueOnce({ medical: false });
    const res = await post(body());
    expect(res.body).toEqual({ kind: 'no_data' });
    expect(ai.askJson).toHaveBeenCalledTimes(1);
  });
  it('good answer passes, with the model name', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(
      answer([{ place_id: 'real-1', why_ar: 'ا', why_en: 'Parking: yes, 5', facts: ['parking', 'real-1-door'] }]));
    const res = await post(body());
    expect(res.body.kind).toBe('answer');
    expect(res.body.model).toBe('test-model');
    expect(res.body.places[0].facts).toEqual(['parking', 'real-1-door']);
  });
  it('drops an invented place_id', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(
      answer([{ place_id: 'made-up', why_ar: 'ا', why_en: 'x', facts: ['parking'] },
              { place_id: 'real-1', why_ar: 'ا', why_en: 'x', facts: ['parking'] }]));
    const res = await post(body());
    expect(res.body.places.map((p: any) => p.place_id)).toEqual(['real-1']);
  });
  it('drops invalid facts and a pick left with none', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(
      answer([{ place_id: 'real-1', why_ar: 'ا', why_en: 'x', facts: ['parking', 'toilets', 'lifts', 'nonsense', 'other-door'] }]));
    const res = await post(body());
    expect(res.body.places[0].facts).toEqual(['parking']); // toilets unknown, lifts missing
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(
      answer([{ place_id: 'real-1', why_ar: 'ا', why_en: 'x', facts: ['lifts'] }]));
    const res2 = await post(body());
    expect(res2.status).toBe(502); // every pick dropped: the reply may name it, so nothing is shown
    expect(res2.body.error.code).toBe('ai_no_answer');
  });
  it('a reply that says "safe" is never shown', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce({
      unknown_place: false, reply_ar: 'هذا المكان آمن', reply_en: 'This place is safe', places: [] });
    const res = await post(body());
    expect(res.status).toBe(502);
  });
  it('accepts "true" as a string for medical and unknown_place', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: 'true' });
    expect((await post(body())).body.kind).toBe('medical');
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce({ unknown_place: 'true' });
    expect((await post(body())).body.kind).toBe('no_data');
  });
  it('adds the short-sentence rule for cognitive needs only', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(answer([]));
    await post({ ...body(), needs: ['cognitive'] });
    expect(ai.askJson.mock.calls.at(-1)![0].system).toMatch(/under 10 words/);
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(answer([]));
    await post({ ...body(), needs: ['mobility'] });
    expect(ai.askJson.mock.calls.at(-1)![0].system).not.toMatch(/under 10 words/);
  });
  it('garbled AI output is a 502 ai_no_answer', async () => {
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce({ hello: 1 });
    const res = await post(body());
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('ai_no_answer');
  });
});

describe('which places the AI sees', () => {
  const seen = () => JSON.parse(ai.askJson.mock.calls[1][0].user).places.map((p: any) => p.id);
  it('uses only the sample when there is no real place', async () => {
    store.places = [mk('sample-place', true)];
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(answer([]));
    await post(body());
    expect(seen()).toEqual(['sample-place']);
  });
  it('uses real places only when both exist', async () => {
    store.places = [mk('sample-place', true), mk('real-1')];
    ai.askJson.mockResolvedValueOnce({ medical: false }).mockResolvedValueOnce(answer([]));
    await post(body());
    expect(seen()).toEqual(['real-1']);
  });
});

describe('rate limit', () => {
  it('429 after 60 calls from one device', async () => {
    ai.askJson.mockResolvedValue({ medical: true });
    const app = createApp();
    for (let i = 0; i < 60; i++) expect((await post(body(), app)).status).toBe(200);
    const res = await post(body(), app);
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('rate_limited');
  });
});
