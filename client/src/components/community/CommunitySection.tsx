import { useState } from 'react';
import { Flag } from 'lucide-react';
import { QUESTION_KEYS } from '../../../../shared/types';
import type { PlaceView } from '../../../../shared/types';
import { reportPlace } from '../../lib/api';
import { useT } from '../../strings';
import '../../styles/community.css';

// The label shown on every community place: never a verified badge unless a moderator marked it so.
export function CommunityBadge({ place }: { place: PlaceView }) {
  const t = useT();
  const c = place.community;
  if (!c) return null;
  if (c.verification === 'verified') return <span className="cm-badge cm-badge-verified">{t('com.verified')}</span>;
  return <span className="cm-badge">{t('com.label')}</span>;
}

export function CommunitySection({ place }: { place: PlaceView }) {
  const t = useT();
  const c = place.community;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'failed'>('idle');
  if (!c) return null;

  async function send() {
    if (!text.trim()) return;
    setState('busy');
    try {
      await reportPlace(place.id, text.trim());
      setState('sent');
      setOpen(false);
      setText('');
    } catch {
      setState('failed');
    }
  }

  const where = [c.governorate, c.area, c.address].filter(Boolean).join('، ');
  return (
    <section className="glass details-card cm-card">
      <CommunityBadge place={place} />
      {c.verification !== 'verified' && <p className="cm-warn">{t('com.about')}</p>}
      {where && <p><strong>{t('com.where')}:</strong> <span dir="auto">{where}</span></p>}
      {c.description && <p dir="auto">{c.description}</p>}
      {c.photos.length > 0 && (
        <>
          <h2>{t('com.photos')}</h2>
          <div className="cm-gallery">
            {c.photos.map((p) => (
              <figure key={p.id}>
                <img src={p.url} alt={`${t('com.photos')}: ${t('photo.' + p.kind)}`} loading="lazy" />
                <figcaption>{t('photo.' + p.kind)}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      <h2>{t('com.answers')}</h2>
      <ul className="cm-answers">
        {QUESTION_KEYS.map((k) => {
          const a = c.answers[k] ?? 'unknown';
          return <li key={k}><span>{t('q.' + k)}</span><strong className={`cm-ans cm-ans-${a}`}>{t('ans.' + a)}</strong></li>;
        })}
      </ul>
      {c.answers_note && <p dir="auto"><strong>{t('com.note')}:</strong> {c.answers_note}</p>}
      {state === 'sent' && <p role="status">{t('com.report.thanks')}</p>}
      {!open ? (
        <button type="button" className="cm-linkbtn" onClick={() => { setOpen(true); setState('idle'); }}>
          <Flag size={16} aria-hidden="true" /> {t('com.report')}
        </button>
      ) : (
        <div className="cm-card">
          <label>{t('com.report.what')}
            <textarea className="field" rows={3} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          {state === 'failed' && <p role="alert" className="cm-error">{t('com.report.failed')}</p>}
          <div className="cm-row">
            <button type="button" className="btn btn-primary" disabled={state === 'busy' || !text.trim()} onClick={() => void send()}>{t('com.report.send')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>{t('com.report.cancel')}</button>
          </div>
        </div>
      )}
    </section>
  );
}
