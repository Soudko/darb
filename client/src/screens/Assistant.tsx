import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen } from '../components/Screen';
import { NeedsPicker } from '../components/assistant/NeedsPicker';
import { Composer, MAX_LEN } from '../components/assistant/Composer';
import { Turn, type PickView, type TurnData } from '../components/assistant/Turn';
import { ApiFailure, askAssistant, getPlaces } from '../lib/api';
import { deviceId, getPrefs, usePrefs } from '../state/prefs';
import { useT } from '../strings';
import '../styles/assistant.css';

const QUICK = ['assistant.q1', 'assistant.q2', 'assistant.q3', 'assistant.q4'];
const EXAMPLES = ['assistant.ex1', 'assistant.ex2', 'assistant.ex3'];

// The conversation is kept in memory only (never saved to the device), so Back from a place's
// details shows the same conversation. It is gone when the page is closed or reloaded.
let savedTurns: TurnData[] = [];
let savedNextId = 1;

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
    const id = nextId.current++;
    savedNextId = nextId.current;
    setTurns((all) => [...all, { id, question, status: 'loading' }]);
    setText('');
    const prefs = getPrefs();
    try {
      const response = await askAssistant({ question, needs: prefs.needs, lang: prefs.lang, device_id: deviceId() });
      let picks: PickView[] = [];
      if (response.kind === 'answer' && response.places.length) {
        try {
          const all = await getPlaces();
          picks = response.places.flatMap((p) => {
            const place = all.find((x) => x.id === p.place_id);
            return place ? [{ place, why_ar: p.why_ar, why_en: p.why_en, facts: p.facts ?? [] }] : [];
          });
        } catch {
          picks = [];
        }
      }
      patch(id, { status: 'done', response, picks });
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
