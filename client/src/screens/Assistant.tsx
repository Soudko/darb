import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen } from '../components/Screen';
import { NeedsPicker } from '../components/assistant/NeedsPicker';
import { Composer, MAX_LEN } from '../components/assistant/Composer';
import { Turn, type PickView, type TurnData } from '../components/assistant/Turn';
import { ApiFailure, askAssistant, getPlaces } from '../lib/api';
import { speak, stopSpeaking, unlockSpeech } from '../lib/speak';
import { deviceId, getPrefs, usePrefs } from '../state/prefs';
import { t as text, useT } from '../strings';
import type { AssistantResponse, ChatTurn } from '../../../shared/types';
import '../styles/assistant.css';

const QUICK = ['assistant.q1', 'assistant.q2', 'assistant.q3', 'assistant.q4'];
const EXAMPLES = ['assistant.ex1', 'assistant.ex2', 'assistant.ex3'];

// The conversation is kept in memory only (never saved to the device), so Back from a place's
// details shows the same conversation. It is gone when the page is closed or reloaded.
let savedTurns: TurnData[] = [];
let savedNextId = 1;

const HISTORY_TURNS = 6; // the last six questions and answers go back to the AI for follow-ups

// What the AI said, in words, for the conversation history and for reading aloud.
function replyText(r: AssistantResponse): { content: string; lang?: 'ar' | 'en' } {
  if (r.kind === 'answer') return { content: r.reply, lang: r.reply_lang };
  return { content: text(r.kind === 'medical' ? 'honest.medical' : 'honest.no_data') };
}

function historyOf(turns: TurnData[]): ChatTurn[] {
  return turns
    .filter((x) => x.status === 'done' && x.response)
    .slice(-HISTORY_TURNS)
    .flatMap((x) => [
      { role: 'user' as const, content: x.question },
      { role: 'assistant' as const, content: replyText(x.response!).content },
    ]);
}

export function Assistant({ initialQuestion }: { initialQuestion?: string }) {
  const t = useT();
  usePrefs();
  const [turns, setTurns] = useState<TurnData[]>(() =>
    savedTurns.map((x) => (x.status === 'loading' ? { ...x, status: 'error' as const, errorCode: 'server_error' } : x)),
  );
  const [text, setText] = useState((initialQuestion ?? '').slice(0, MAX_LEN));
  useEffect(() => {
    savedTurns = turns;
  }, [turns]);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const open = useRef(true);
  useEffect(() => {
    open.current = true;
    return () => {
      open.current = false;
      stopSpeaking();
    };
  }, []);
  const busy = turns.some((x) => x.status === 'loading');
  const nextId = useRef(savedNextId);
  const busyRef = useRef(false);
  const replyRef = useRef<HTMLDivElement>(null);
  const [focusId, setFocusId] = useState(0);

  const patch = (id: number, p: Partial<TurnData>) =>
    setTurns((all) => all.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const ask = useCallback(async (raw: string) => {
    const question = raw.trim().slice(0, MAX_LEN);
    if (!question || busyRef.current) return;
    busyRef.current = true;
    stopSpeaking();
    if (getPrefs().readAloud) unlockSpeech();
    const history = historyOf(turnsRef.current);
    const id = nextId.current++;
    savedNextId = nextId.current;
    setTurns((all) => [...all, { id, question, status: 'loading' }]);
    setText('');
    const prefs = getPrefs();
    try {
      const simple = prefs.simplified || prefs.textSize === 'larger';
      const response = await askAssistant({ question, needs: prefs.needs, lang: prefs.lang, device_id: deviceId(), history, simple });
      let picks: PickView[] = [];
      if (response.kind === 'answer' && response.places.length) {
        try {
          const all = await getPlaces();
          picks = response.places.flatMap((p) => {
            const place = all.find((x) => x.id === p.place_id);
            return place ? [{ place, why: p.why, facts: p.facts ?? [] }] : [];
          });
        } catch {
          picks = [];
        }
      }
      patch(id, { status: 'done', response, picks });
      if (getPrefs().readAloud && open.current) {
        const said = replyText(response);
        speak(said.content, said.lang ?? getPrefs().lang);
      }
    } catch (e) {
      patch(id, { status: 'error', errorCode: e instanceof ApiFailure ? e.code : 'server_error' });
    } finally {
      busyRef.current = false;
      setFocusId(id);
    }
  }, []);

  // The question from the Home search box: ask it once.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialQuestion?.trim()) {
      void ask(initialQuestion);
      // Keep the question out of browser history so Back/forward never asks it again.
      history.replaceState(null, '', '#/assistant');
    }
  }, [initialQuestion, ask]);

  // Move focus to the newest reply.
  useEffect(() => {
    if (focusId && replyRef.current) {
      replyRef.current.focus({ preventScroll: true });
      replyRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [focusId, turns]);

  const last = turns[turns.length - 1];

  return (
    <Screen title={t('assistant.title')} back footer={false}>
      <div className="as-page">
        <NeedsPicker />

        <section aria-labelledby="as-quick-h">
          <h2 id="as-quick-h" className="as-h">{t('assistant.quick_label')}</h2>
          <div className="as-chips">
            {QUICK.map((k) => (
              <button key={k} type="button" className="chip as-chip as-quick" disabled={busy} onClick={() => void ask(t(k))}>
                {t(k)}
              </button>
            ))}
          </div>
        </section>

        {turns.length === 0 && (
          <div className="as-empty small">
            <p>{t('assistant.empty_title')}</p>
            <ul>
              {EXAMPLES.map((k) => <li key={k}>{t(k)}</li>)}
            </ul>
          </div>
        )}

        <div className="as-log" aria-live="polite">
          {turns.map((turn) => (
            <Turn key={turn.id} turn={turn} busy={busy} onRetry={(q) => void ask(q)} ref={turn.id === last?.id ? replyRef : undefined} />
          ))}
        </div>
        <p className="small as-footer">{t('honest.footer')}</p>
        <div className="as-spacer" aria-hidden="true" />
      </div>

      <Composer value={text} onChange={setText} onSubmit={() => void ask(text)} busy={busy} />
    </Screen>
  );
}
