import { Router } from 'express';
import { FACILITY_KEYS, NEEDS } from '../shared/types';
import type { AssistantAction, AssistantPlacePick, AssistantResponse, ChatTurn, Lang, Need, PlaceView } from '../shared/types';
import { aiStatus, askJson } from './ai';
import { HttpError } from './errors';
import { getPlaces } from './places';
import { listCommunityPlaces } from './community';

const WINDOW_MS = 10 * 60 * 1000;
const PER_DEVICE = 60;
const PER_IP = 300; // high enough for several judges behind one proxy address
const MAX_QUESTION = 500;
const MAX_REPLY = 2500;
const MAX_HISTORY = 12;

const MEDICAL_SYSTEM =
  'You are a filter. The user text is JSON with the latest "question" and the user\'s "earlier" messages. ' +
  'Read the question together with the earlier messages (a follow-up like "how much for my child?" after a medicine ' +
  'question counts). Decide whether it asks for personal medical advice: which medicine or dose to take, ' +
  'a treatment, or a diagnosis of symptoms. These are NOT medical: finding an accessible place, how to communicate ' +
  'with or help a disabled person, assistive technology, disability etiquette, rights, everyday life, and general ' +
  'knowledge. Reply ONLY with JSON: {"medical": true} or {"medical": false}.';

// Saoud's Darb AI personality (14 Nov brief), then Darb's honesty rules and the reply format.
const PERSONALITY = `You are Darb AI, an intelligent, friendly, and accessible digital assistant developed for people in Kuwait.
You specialize in supporting people with disabilities, older adults, caregivers, and individuals with different accessibility needs.
You understand Arabic, Kuwaiti Arabic, and English.
Respond in the user's preferred language.
Use simple, clear, respectful language.
Adapt your explanations to the user's accessibility preferences when provided.
Help users with everyday questions, technology, navigation, communication, accessibility, and general knowledge.
Never assume that all people with the same disability have identical needs.
Ask for clarification when necessary.
Do not invent verified accessibility information, real-time navigation data, or government services.
If a question requires current information that is not available through connected tools, explain that limitation.
Be intelligent, conversational, supportive, and practical.`;

const ANSWER_SYSTEM = `${PERSONALITY}

How Darb works:
- You can talk about any topic: greetings, everyday questions, technology, communication, accessibility and general knowledge. Keep the conversation going naturally and use the earlier messages for follow-up questions (for example "make your last answer shorter").
- Reply in the language the user writes in. Kuwaiti or any Arabic -> reply in clear, warm Arabic (light Gulf touches are fine). English -> reply in English. Set reply_lang to "ar" or "en" to match.
- The user message is JSON with "question", the user's "needs", "simple" and Darb's verified place "records". Facts about a real place may come ONLY from these records. Never state from your own knowledge whether a real venue has a ramp, lift, parking, toilet or any other facility.
- Whenever your reply mentions one of the records by name, include that record in "places" with its facts.
- When the question is about finding or visiting a place, pick up to three records that fit and give for each a "why": one or two short sentences, in the reply's language, naming only facts found in that record. In "facts" list the facility keys (entrances, parking, lifts, toilets, seating) or point ids that back it. Otherwise return places [].
- If the user asks about the accessibility or facilities of a specific named venue (a mall, hospital, restaurant, ministry or other place) that matches no record's name_ar or name_en, set unknown_place to true and places to []. Questions about places in general (for example "what should I check before visiting a mall?") are fine: answer them with general advice.
- Some records have "verified": false. They are community submissions that nobody has reviewed. When you mention one, say clearly that its information is community-submitted and not verified. "answers" in such a record are the contributor's answers (yes, no or unknown); treat unknown as unknown.
- Actions: when it helps, add an "action" that offers the user a button: {"type":"open_add_place"} when they want to add or describe a new place or ask for help filling the form (also explain the form's questions in the reply); {"type":"open_map"} or {"type":"open_map","place_id":id} when they want to go to a place or see the map; {"type":"open_place","place_id":id} to open a record's details. Only use place ids from the records. Never claim a route is wheelchair accessible. Nothing is submitted or published for the user: they review and confirm everything themselves. Omit "action" when none fits.
- You have no live data: no traffic, opening hours, queues or government service status. Say so when asked.
- Never give medical advice (medicines, doses, diagnosis). Never call a place or route "safe" («آمن»): Darb guides, it does not promise safety.
- When asked to reword something the user wrote (for example a request to staff), write a clear, polite version they can show or say.
- Adapt to the needs: hearing -> everything in text, never rely on sound; visual -> describe in words, never "look for the colour", screen-reader friendly; speech -> the user may type short or broken phrases, understand them kindly; cognitive or simple -> short sentences, one idea each, numbered steps; elderly -> plain, calm and patient; mobility -> think about steps, ramps, lifts, doors and distance.
- Format: plain text only. Short paragraphs; for steps use lines starting "1." "2." or "•". No markdown, no ** or #, no tables. Usually under 150 words unless the user asks for more.
Reply ONLY with JSON: {"unknown_place":bool,"reply":string,"reply_lang":"ar"|"en","places":[{"place_id":string,"why":string,"facts":[string]}],"action":{"type":string,"place_id":string}}`;

const COGNITIVE_RULE =
  '\nThe user has cognitive needs: every sentence under 10 words, one idea per sentence, everyday words.';
const SIMPLE_RULE = '\nThe user asked for a simple interface: keep it short, with numbered steps where it helps.';
const UNSAFE_WORDS = /\bsafe(ly|ty)?\b|آمن/i;
const isTrue = (v: unknown) => v === true || v === 'true';

// Short records for the AI: only what it needs, with each place's id.
function toRecord(p: PlaceView) {
  const facilities: Record<string, unknown> = {};
  for (const k of FACILITY_KEYS) {
    const f = p.facilities[k];
    if (f) facilities[k] = { available: f.available, count: f.count, note_en: f.note_en };
  }
  return {
    id: p.id, name_ar: p.name_ar, name_en: p.name_en, type: p.type, status: p.status, facilities,
    verified: !p.community || p.community.verification === 'verified',
    ...(p.community ? { answers: p.community.answers, area: p.community.area, description: p.community.description, notes: p.community.answers_note } : {}),
    points: p.points.map((q) => ({ id: q.id, kind: q.kind, name_en: q.name_en, accessible: q.accessible, quiet: q.quiet })),
  };
}

function cap(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

// The screens show plain text: take out markdown marks the model may still add.
const plain = (s: string) => s.replace(/\*\*|__/g, '').replace(/^#{1,6}\s+/gm, '').trim();
// The language the reply is actually written in: more Arabic letters than Latin ones means Arabic.
const langOf = (s: string): Lang =>
  (s.match(/[\u0600-\u06FF]/g)?.length ?? 0) >= (s.match(/[A-Za-z]/g)?.length ?? 0) ? 'ar' : 'en';
const namesARecord = (s: string, places: PlaceView[]) =>
  places.some((p) => [p.name_ar, p.name_en].some((n) => n && s.toLowerCase().includes(n.toLowerCase())));

const noAnswer = () => new HttpError(502, 'ai_no_answer', 'The assistant could not answer right now.');

// Check the AI's JSON before the screens ever see it.
function checkAnswer(raw: Record<string, unknown>, places: PlaceView[]): AssistantResponse {
  if (isTrue(raw.unknown_place)) return { kind: 'no_data' };
  const text = cap(raw.reply, MAX_REPLY);
  if (!text || (raw.places !== undefined && !Array.isArray(raw.places))) throw noAnswer();
  const reply = plain(text);
  const reply_lang = langOf(reply);
  const asked = (raw.places as unknown[] | undefined) ?? [];

  const picks: AssistantPlacePick[] = [];
  for (const item of asked as any[]) {
    if (picks.length >= 3) break;
    const place = places.find((p) => p.id === item?.place_id);
    const why = cap(item?.why, 300);
    if (!place || !why || !Array.isArray(item.facts)) continue;
    const facts = (item.facts as unknown[]).filter((f): f is string => {
      if (typeof f !== 'string') return false;
      if ((FACILITY_KEYS as string[]).includes(f)) {
        const a = place.facilities[f as (typeof FACILITY_KEYS)[number]]?.available;
        return a === 'yes' || a === 'no';
      }
      return place.points.some((q) => q.id === f);
    });
    if (!facts.length) continue;
    picks.push({ place_id: place.id, why: plain(why), facts: [...new Set(facts)] });
  }
  // The model picked places but none survived the check: its reply may name them, so show nothing.
  if (asked.length > 0 && picks.length === 0) throw noAnswer();
  // A reply that talks about a Darb place must show it as a checked card, so every claim is backed.
  const aboutPlaces = picks.length > 0 || namesARecord(reply, places);
  if (aboutPlaces && picks.length === 0) throw noAnswer();
  // Claims about places never promise safety. (General talk may use the word, e.g. "road safety".)
  const placeTexts = aboutPlaces ? [reply, ...picks.map((p) => p.why)] : [];
  if (placeTexts.some((x) => UNSAFE_WORDS.test(x))) throw noAnswer();
  const action = checkAction(raw.action, places);
  return { kind: 'answer', reply, reply_lang, places: picks, model: aiStatus().model ?? '', ...(action ? { action } : {}) };
}

// Only actions that point at real screens and real records get through.
function checkAction(v: any, places: PlaceView[]): AssistantAction | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const exists = (id: unknown) => typeof id === 'string' && places.some((p) => p.id === id);
  if (v.type === 'open_add_place') return { type: 'open_add_place' };
  if (v.type === 'open_map') return exists(v.place_id) ? { type: 'open_map', place_id: v.place_id } : { type: 'open_map' };
  if (v.type === 'open_place' && exists(v.place_id)) return { type: 'open_place', place_id: v.place_id };
  return undefined;
}

function parseHistory(v: unknown): ChatTurn[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new HttpError(400, 'bad_request', 'history must be a list.');
  const out: ChatTurn[] = [];
  for (const m of v.slice(-MAX_HISTORY)) {
    const role = m?.role;
    if (role !== 'user' && role !== 'assistant') continue;
    const content = cap(m?.content, role === 'user' ? MAX_QUESTION : MAX_REPLY);
    if (content) out.push({ role, content });
  }
  return out;
}

interface Parsed { question: string; needs: Need[]; lang: Lang; device: string; history: ChatTurn[]; simple: boolean }

function parseBody(body: any): Parsed {
  const q = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!q) throw new HttpError(400, 'bad_request', 'Please write a question.');
  if (q.length > MAX_QUESTION) throw new HttpError(400, 'too_long', 'The question is too long (500 characters at most).');
  if (body.needs !== undefined && !Array.isArray(body.needs)) throw new HttpError(400, 'bad_request', 'needs must be a list.');
  const needs = ((body.needs ?? []) as unknown[]).filter((n): n is Need => NEEDS.includes(n as Need));
  const lang: Lang = body.lang === 'en' ? 'en' : 'ar';
  const device = body.device_id === undefined ? '' : body.device_id;
  if (typeof device !== 'string' || device.length > 100) throw new HttpError(400, 'bad_request', 'device_id is not valid.');
  return { question: q, needs, lang, device, history: parseHistory(body.history), simple: isTrue(body.simple) };
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
      const { question, needs, lang, device, history, simple } = parseBody(req.body);
      const now = Date.now();
      const limited = overLimit(`ip:${req.ip}`, PER_IP, now) || (device !== '' && overLimit(`dev:${device}`, PER_DEVICE, now));
      if (limited) throw new HttpError(429, 'rate_limited', 'Too many questions. Please wait a few minutes.');
      if (aiStatus().status !== 'ready') throw new HttpError(503, 'ai_not_set_up', 'The assistant is not set up yet.');

      const earlier = history.filter((m) => m.role === 'user').slice(-3).map((m) => m.content);
      const check = await askJson({ system: MEDICAL_SYSTEM, user: JSON.stringify({ earlier, question }) });
      if (isTrue(check.medical)) return void res.json({ kind: 'medical' } satisfies AssistantResponse);

      const all = [...getPlaces(), ...(await listCommunityPlaces())];
      const real = all.filter((p) => !p.is_sample);
      const places = real.length ? real : all;

      const user = JSON.stringify({ question, needs, simple, screen_language: lang, records: places.map(toRecord) });
      let system = ANSWER_SYSTEM;
      if (needs.includes('cognitive')) system += COGNITIVE_RULE;
      if (simple) system += SIMPLE_RULE;
      const raw = await askJson({ system, user, history });
      res.json(checkAnswer(raw, places));
    } catch (e) {
      next(e);
    }
  });

  return router;
}
