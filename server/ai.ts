import { HttpError } from './errors';

// The one shared AI helper: any OpenAI-compatible server (LM Studio, Replit AI Integrations, ...).
interface AiConfig { base: string; key: string; model: string }

function config(): AiConfig {
  const env = process.env;
  const own = (env.AI_BASE_URL || '').trim();
  const useReplit = !own;
  const base = (own || (env.AI_INTEGRATIONS_OPENAI_BASE_URL || '')).trim().replace(/\/+$/, '');
  const key = useReplit ? env.AI_INTEGRATIONS_OPENAI_API_KEY || '' : env.AI_API_KEY || '';
  // A placeholder key (for example PASTE_KEY_HERE) means the real key is not added yet: not set up.
  const placeholder = /paste|placeholder|your[_-]?key|changeme/i.test(key);
  return { base: placeholder ? '' : base, key, model: (env.AI_MODEL || '').trim() || 'gpt-4.1-mini' };
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

export interface AskArgs { system: string; user: string; maxTokens?: number; temperature?: number }

async function once(c: AiConfig, a: AskArgs): Promise<Record<string, unknown> | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);
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
          { role: 'user', content: a.user },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(`AI request failed with status ${res.status}`); // the status only: never the body or key
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
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await once(c, a);
      if (out) return out;
    } catch {
      // try again, then give up below
    }
  }
  throw new HttpError(502, 'ai_no_answer', 'The assistant could not answer right now.');
}
