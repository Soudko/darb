import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../../server/app';
import { call } from './helper';

const saved = { ...process.env };
afterEach(() => { process.env = { ...saved }; });

describe('GET /api/health', () => {
  it('says not_set_up with no AI', async () => {
    // Clear every AI setting, so a real key in the workspace (Replit Secrets) cannot change the result.
    for (const k of ['AI_BASE_URL', 'AI_API_KEY', 'OPENAI_API_KEY', 'AI_INTEGRATIONS_OPENAI_BASE_URL', 'AI_INTEGRATIONS_OPENAI_API_KEY']) {
      delete process.env[k];
    }
    const res = await call(createApp(), 'GET', '/api/health');
    expect(res.body).toEqual({ ok: true, ai: 'not_set_up' });
  });
  it('never contains the key or the address', async () => {
    process.env.AI_BASE_URL = 'http://secret-host.example/v1';
    process.env.AI_API_KEY = 'test-secret-value';
    process.env.AI_MODEL = 'my-model';
    const res = await call(createApp(), 'GET', '/api/health');
    expect(res.body).toEqual({ ok: true, ai: 'ready', model: 'my-model' });
    expect(res.text).not.toContain('test-secret-value');
    expect(res.text).not.toContain('secret-host');
  });
  it('a placeholder key counts as not set up, even with an address', async () => {
    process.env.AI_BASE_URL = 'https://example.test/v1';
    process.env.AI_API_KEY = 'PASTE_KEY_HERE';
    const res = await call(createApp(), 'GET', '/api/health');
    expect(res.body).toEqual({ ok: true, ai: 'not_set_up' });
  });
});
