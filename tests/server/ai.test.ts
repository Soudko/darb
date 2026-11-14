import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aiStatus, askJson, DEFAULT_MODEL } from '../../server/ai';

const saved = { ...process.env };
const KEYS = ['AI_BASE_URL', 'AI_API_KEY', 'OPENAI_API_KEY', 'AI_MODEL', 'AI_INTEGRATIONS_OPENAI_BASE_URL', 'AI_INTEGRATIONS_OPENAI_API_KEY'];
beforeEach(() => { for (const k of KEYS) delete process.env[k]; });
afterEach(() => { process.env = { ...saved }; vi.unstubAllGlobals(); });

const reply = (status: number, content = '{"ok":true}') =>
  vi.fn().mockResolvedValue({ ok: status < 300, status, json: async () => ({ choices: [{ message: { content } }] }) });

describe('which AI the server uses', () => {
  it('OPENAI_API_KEY alone switches on OpenAI with the default model', async () => {
    process.env.OPENAI_API_KEY = 'test-key-1';
    expect(aiStatus()).toEqual({ status: 'ready', model: DEFAULT_MODEL });
    const f = reply(200);
    vi.stubGlobal('fetch', f);
    await askJson({ system: 's', user: 'u' });
    expect(f.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions');
    expect(f.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key-1');
  });
  it('the old placeholder AI_API_KEY does not block a real OPENAI_API_KEY', () => {
    process.env.AI_API_KEY = 'PASTE_KEY_HERE';
    process.env.OPENAI_API_KEY = 'test-key-2';
    expect(aiStatus().status).toBe('ready');
  });
  it('only a placeholder: not set up', () => {
    process.env.AI_API_KEY = 'PASTE_KEY_HERE';
    expect(aiStatus().status).toBe('not_set_up');
  });
  it('AI_MODEL overrides the model', () => {
    process.env.OPENAI_API_KEY = 'k';
    process.env.AI_MODEL = 'gpt-6.1-terra';
    expect(aiStatus().model).toBe('gpt-6.1-terra');
  });
  it('LM Studio on the Mac needs an address and no key', () => {
    process.env.AI_BASE_URL = 'http://localhost:1234/v1';
    expect(aiStatus().status).toBe('ready');
  });
  it('never sends the OpenAI key to another server', async () => {
    process.env.AI_BASE_URL = 'http://localhost:1234/v1';
    process.env.OPENAI_API_KEY = 'openai-secret';
    const f = reply(200);
    vi.stubGlobal('fetch', f);
    await askJson({ system: 's', user: 'u' });
    expect(f.mock.calls[0][0]).toBe('http://localhost:1234/v1/chat/completions');
    expect(f.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
  it('sends the conversation between the rules and the new question', async () => {
    process.env.OPENAI_API_KEY = 'k';
    const f = reply(200);
    vi.stubGlobal('fetch', f);
    await askJson({ system: 's', user: 'u', history: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] });
    const sent = JSON.parse(f.mock.calls[0][1].body);
    expect(sent.messages.map((m: any) => m.role)).toEqual(['system', 'user', 'assistant', 'user']);
    expect(Object.keys(sent)).toEqual(['model', 'messages']);
  });
});

describe('provider errors are named, not retried', () => {
  for (const [status, code] of [[401, 'ai_auth_failed'], [403, 'ai_auth_failed'], [429, 'ai_quota'], [404, 'ai_model']] as const) {
    it(`${status} gives ${code} after one call`, async () => {
      process.env.OPENAI_API_KEY = 'k';
      const f = reply(status);
      vi.stubGlobal('fetch', f);
      await expect(askJson({ system: 's', user: 'u' })).rejects.toMatchObject({ code });
      expect(f).toHaveBeenCalledTimes(1);
    });
  }
  it('a 500 is retried once, then ai_no_answer', async () => {
    process.env.OPENAI_API_KEY = 'k';
    const f = reply(500);
    vi.stubGlobal('fetch', f);
    await expect(askJson({ system: 's', user: 'u' })).rejects.toMatchObject({ code: 'ai_no_answer' });
    expect(f).toHaveBeenCalledTimes(2);
  });
});
