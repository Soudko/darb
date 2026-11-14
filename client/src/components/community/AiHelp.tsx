import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ApiFailure, askAssistant } from '../../lib/api';
import { deviceId, getPrefs } from '../../state/prefs';
import { useT } from '../../strings';

// A small "help me" link that asks the same Darb AI backend. It only shows a suggestion: it never fills in or sends anything.
export function AiHelp({ label, prompt }: { label: string; prompt: () => string }) {
  const t = useT();
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');
  const [reply, setReply] = useState('');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  async function ask() {
    setState('busy');
    setReply('');
    try {
      const p = getPrefs();
      const r = await askAssistant({ question: prompt().slice(0, 500), needs: p.needs, lang: p.lang, device_id: deviceId(), simple: true });
      if (r.kind === 'answer') {
        setReply(r.reply);
        setDir(r.reply_lang === 'ar' ? 'rtl' : 'ltr');
        setState('idle');
      } else {
        setState('failed');
      }
    } catch (e) {
      setState('failed');
      void (e instanceof ApiFailure);
    }
  }

  return (
    <div className="cm-aihelp">
      <button type="button" className="cm-linkbtn" disabled={state === 'busy'} onClick={() => void ask()}>
        <Sparkles size={16} aria-hidden="true" /> {label}
      </button>
      <div aria-live="polite">
        {state === 'busy' && <p className="small">{t('add.help.busy')}</p>}
        {state === 'failed' && <p className="small">{t('add.help.failed')}</p>}
        {reply && (
          <div className="glass cm-suggest">
            <p dir={dir}>{reply}</p>
            <p className="small">{t('add.help.note')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
