import { HttpError } from './errors';

// The one shared AI helper: any OpenAI-compatible server (OpenAI, LM Studio, Replit AI Integrations, ...).
interface AiConfig { base: string; key: string; model: string }

export const OPENAI_BASE = 'https://api.openai.com/v1';
// OpenAI's low-cost everyday model (checked on developers.openai.com on 14 Nov 2026). AI_MODEL overrides it.
export const DEFAULT_MODEL = 'gpt-6-luna';

// A placeholder key (for example PASTE_KEY_HERE) means the real key is not added yet.
const isPlaceholder = (k: string) => /paste|placeholder|your[_-]?key|changeme/i.test(k);
const realKey = (k: string | undefined) => {
  const v = (k || '').trim();
  return v && !isPlaceholder(v) ? v : '';
};

// Where the settings come from, first match wins:
// 1. AI_BASE_URL set to another server: that server, with AI_API_KEY only (LM Studio needs no key).
// 2. A real AI_API_KEY or OPENAI_API_KEY: OpenAI itself.
// 3. Replit AI Integrations (AI_INTEGRATIONS_OPENAI_BASE_URL and _API_KEY).
function config(): AiConfig {
  const env = process.env;
  const model = (env.AI_MODEL || '').trim() || DEFAULT_MODEL;
  const ownBase = (env.AI_BASE_URL || '').trim().replace(/\/+$/, '');
  if (ownBase && ownBase !== OPENAI_BASE) {
    // Another server (LM Studio, ...): only AI_API_KEY goes there, never the OpenAI key.
    const key = realKey(env.AI_API_KEY);
    const placeholder = !!env.AI_API_KEY && isPlaceholder(env.AI_API_KEY);
    return { base: placeholder ? '' : ownBase, key, model };
  }
  const ownKey = realKey(env.AI_API_KEY) || realKey(env.OPENAI_API_KEY);
  if (ownKey) return { base: OPENAI_BASE, key: ownKey, model };
  if (ownBase) return { base: '', key: '', model }; // OpenAI's address but only a placeholder key
  const replitBase = (env.AI_INTEGRATIONS_OPENAI_BASE_URL || '').trim().replace(/\/+$/, '');
  const replitKey = realKey(env.AI_INTEGRATIONS_OPENAI_API_KEY);
  return { base: replitBase && replitKey ? replitBase : '', key: replitKey, model };
}

export function aiStatus(): { status: 'ready' | 'not_set_up'; model?: string } {
  const c = config();
  return c.base ? { status: 'ready', model: c.model } : { status: 'not_set_up' };
}

// Take the JSON object out of a reply, even with words or ```json fences around it.
export function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface AskArgs { system: string; user: string; history?: ChatMessage[] }

// A provider answer that retrying will not fix: a wrong key, no credit, or a wrong model name.
function providerError(status: number): HttpError | null {
  if (status === 401 || status === 403) return new HttpError(502, 'ai_auth_failed', 'The AI key was refused.');
  if (status === 429) return new HttpError(502, 'ai_quota', 'The AI service is busy or out of credit.');
  if (status === 404) return new HttpError(502, 'ai_model', 'The AI model name is not available.');
  return null;
}

async function once(c: AiConfig, a: AskArgs): Promise<Record<string, unknown> | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (c.key) headers.Authorization = `Bearer ${c.key}`;
    const res = await fetch(`${c.base}/chat/completions`, {
      method: 'POST',
      headers,
      signal: ctrl.signal,
      body: JSON.stringify({
        model: c.model, // only model and messages: newer models reject temperature and max_tokens
        messages: [
          { role: 'system', content: a.system },
          ...(a.history ?? []),
          { role: 'user', content: a.user },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(`AI request failed with status ${res.status}`); // the status only: never the body or key
      const hard = providerError(res.status);
      if (hard) throw hard;
      throw new Error('bad status');
    }
    const body: any = await res.json();
    const text = body?.choices?.[0]?.message?.content;
    return typeof text === 'string' ? extractJson(text) : null;
  } finally {
    clearTimeout(timer);
  }
}

// Returns the parsed JSON object. One retry; then an "ai_no_answer" error. No made-up fallback.
export async function askJson(a: AskArgs): Promise<Record<string, unknown>> {
  const c = config();
  if (!c.base) throw new HttpError(503, 'ai_not_set_up', 'The AI is not set up.');
  const started = Date.now();
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0 && Date.now() - started > 12_000) break; // a slow first try: do not keep the phone waiting
    try {
      const out = await once(c, a);
      if (out) return out;
    } catch (e) {
      if (e instanceof HttpError) throw e; // key, credit or model problem: say so, do not retry
      // otherwise try again, then give up below
    }
  }
  throw new HttpError(502, 'ai_no_answer', 'The assistant could not answer right now.');
}
