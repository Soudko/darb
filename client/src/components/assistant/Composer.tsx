import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Square } from 'lucide-react';
import { canListen, startListening, stopListening, type ListenError } from '../../lib/listen';
import { stopSpeaking, unlockSpeech } from '../../lib/speak';
import { setAiActivity } from '../../state/aiActivity';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../strings';

export const MAX_LEN = 500;

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onVoiceSubmit: (text: string) => void;
  busy: boolean;
}

export function Composer({ value, onChange, onSubmit, onVoiceSubmit, busy }: Props) {
  const t = useT();
  const { lang } = usePrefs();
  const near = value.length >= 400;
  const [listening, setListening] = useState(false);
  const [msg, setMsg] = useState('');
  const heard = useRef('');
  useEffect(() => () => { stopListening(); setAiActivity('idle'); }, []);

  function toggleMic() {
    setMsg('');
    if (listening) return stopListening();
    if (!canListen()) return setMsg(t('voice.unsupported'));
    stopSpeaking();
    unlockSpeech(); // iPhone needs speech to start from a tap, so the spoken answer can follow
    heard.current = '';
    setListening(true);
    setAiActivity('listening');
    startListening(lang, {
      onText: (x) => { heard.current = x.slice(0, MAX_LEN); onChange(heard.current); },
      onError: (e: ListenError) => setMsg(t(e === 'denied' ? 'voice.denied' : e === 'nothing' ? 'voice.nothing' : 'voice.unsupported')),
      onEnd: (ok) => {
        setListening(false);
        setAiActivity('idle');
        if (ok && heard.current) onVoiceSubmit(heard.current); // the question is asked, and the answer is read aloud
      },
    });
  }

  return (
    <form
      className="glass-strong as-composer"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="as-composer-row">
        <input
          className="field as-input"
          type="text"
          value={value}
          maxLength={MAX_LEN}
          placeholder={listening ? t('voice.listening') : t('assistant.placeholder')}
          aria-label={t('assistant.input_label')}
          enterKeyHint="send"
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={`btn btn-secondary as-mic${listening ? ' is-listening' : ''}`}
          aria-pressed={listening}
          aria-label={listening ? t('voice.stop') : t('voice.mic')}
          disabled={busy && !listening}
          onClick={toggleMic}
        >
          {listening ? <Square size={20} aria-hidden="true" /> : <Mic size={22} aria-hidden="true" />}
        </button>
        <button type="submit" className="btn btn-primary as-ask" disabled={busy || !value.trim()}>
          <Send size={20} aria-hidden="true" className="as-send-icon" />
          {t('assistant.ask')}
        </button>
      </div>
      <p className="small as-count" role="status" aria-live="polite" hidden={!listening && !msg}>{listening ? t('voice.listening') : msg}</p>
      {near && (
        <p className="small as-count" aria-live="off">
          {value.length} / {MAX_LEN} {t('assistant.chars')}
        </p>
      )}
    </form>
  );
}
