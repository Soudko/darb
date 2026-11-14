import { forwardRef, useEffect, useState } from 'react';
import { Sparkles, Map as MapIcon, Square, Volume2 } from 'lucide-react';
import type { AssistantResponse, PlaceView } from '../../../../shared/types';
import { FactList } from './FactList';
import { PlaceCard } from '../place/PlaceCard';
import { go } from '../../lib/nav';
import { canSpeak, speak, stopSpeaking } from '../../lib/speak';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../strings';

export interface PickView {
  place: PlaceView;
  why: string;
  facts: string[];
}
export interface TurnData {
  id: number;
  question: string;
  status: 'loading' | 'done' | 'error';
  response?: AssistantResponse;
  picks?: PickView[];
  errorCode?: string;
}

function AiBubble({ children, reply, ai = true }: { children: React.ReactNode; reply: React.Ref<HTMLDivElement>; ai?: boolean }) {
  const t = useT();
  return (
    <div className="glass as-bubble as-bubble-ai" ref={reply} tabIndex={-1}>
      {ai && <span className="as-tag"><Sparkles size={14} aria-hidden="true" /> {t('assistant.ai_tag')}</span>}
      {children}
    </div>
  );
}

function ListenButton({ text, lang }: { text: string; lang: 'ar' | 'en' }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => { if (playing) stopSpeaking(); }, [playing]);
  if (!canSpeak()) return null;
  const toggle = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
    } else {
      setPlaying(true);
      speak(text, lang, () => setPlaying(false));
    }
  };
  return (
    <button type="button" className="btn btn-secondary as-listen" aria-pressed={playing} onClick={toggle}>
      {playing ? <Square size={18} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
      {playing ? t('assistant.stop') : t('assistant.listen')}
    </button>
  );
}

function MapButton() {
  const t = useT();
  return (
    <button type="button" className="btn btn-secondary as-map-btn" onClick={() => go('map')}>
      <MapIcon size={20} aria-hidden="true" /> {t('assistant.open_map')}
    </button>
  );
}

interface Props {
  turn: TurnData;
  busy: boolean;
  onRetry: (q: string) => void;
}

export const Turn = forwardRef<HTMLDivElement, Props>(function Turn({ turn, busy, onRetry }, ref) {
  const t = useT();
  const { lang } = usePrefs();
  const r = turn.response;

  let body: React.ReactNode = null;
  if (turn.status === 'loading') {
    body = <p className="as-thinking small">{t('assistant.thinking')}</p>;
  } else if (turn.status === 'error') {
    const c = turn.errorCode;
    const msg =
      c === 'ai_not_set_up' ? t('ai.not_set_up')
      : c === 'ai_auth_failed' ? t('ai.auth_failed')
      : c === 'ai_quota' ? t('ai.quota')
      : c === 'ai_model' ? t('ai.model')
      : c === 'rate_limited' ? t('error.rate_limited')
      : c === 'too_long' ? t('assistant.too_long')
      : c === 'offline' ? t('ai.offline')
      : t('ai.no_answer');
    const fixedByTeam = c === 'ai_not_set_up' || c === 'ai_auth_failed' || c === 'ai_model';
    const retry = !fixedByTeam && c !== 'rate_limited' && c !== 'too_long';
    body = (
      <AiBubble reply={ref} ai={false}>
        <p>{msg}</p>
        {retry && (
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => onRetry(turn.question)}>
            {t('ai.try_again')}
          </button>
        )}
      </AiBubble>
    );
  } else if (r?.kind === 'medical') {
    body = <AiBubble reply={ref}><p>{t('honest.medical')}</p></AiBubble>;
  } else if (r?.kind === 'no_data') {
    body = (
      <AiBubble reply={ref}>
        <p>{t('honest.no_data')}</p>
        <MapButton />
      </AiBubble>
    );
  } else if (r?.kind === 'answer') {
    const picks = (turn.picks ?? []).slice(0, 3);
    body = (
      <>
        <AiBubble reply={ref}>
          <p className="as-reply" lang={r.reply_lang} dir={r.reply_lang === 'ar' ? 'rtl' : 'ltr'}>{r.reply}</p>
          <ListenButton text={r.reply} lang={r.reply_lang} />
          {picks.length === 0 && r.places.length === 0 && /مكان|أماكن|place|venue|mall|مجمع/i.test(turn.question) && <MapButton />}
        </AiBubble>
        {picks.length > 0 && (
          <div className="as-picks">
            {picks.map((p) => (
              <div key={p.place.id} className="as-pick">
                <PlaceCard place={p.place} why={p.why} />
                <FactList place={p.place} facts={p.facts} />
              </div>
            ))}
            <p className="label-community">{t('honest.community')}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="as-turn">
      <div className="glass as-bubble as-bubble-user">
        <span className="sr-only">{t('assistant.you')}: </span>
        {turn.question}
      </div>
      {body}
    </div>
  );
});
