// «إضافة مكان جديد»: a form that saves a community place on the server. Nothing is sent until the user reviews and confirms.
import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CATEGORY_KEYS, QUESTION_KEYS } from '../../../shared/types';
import type { Answer, CategoryKey, PlaceView, QuestionKey } from '../../../shared/types';
import { Screen } from '../components/Screen';
import { PhotoPicker, type PickedPhoto } from '../components/community/PhotoPicker';
import { LocationPicker, insideKuwait, type Pos } from '../components/community/LocationPicker';
import { AiHelp } from '../components/community/AiHelp';
import { ApiFailure, submitPlace } from '../lib/api';
import { go } from '../lib/nav';
import { useT } from '../strings';
import '../styles/community.css';

const GOVERNORATES = ['capital', 'hawalli', 'farwaniya', 'mubarak', 'ahmadi', 'jahra'];
const ANSWERS: Answer[] = ['yes', 'no', 'unknown'];

export function AddPlace(_props: {}) {
  const t = useT();
  const [step, setStep] = useState<'form' | 'review' | 'done'>('form');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [governorate, setGovernorate] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [pos, setPos] = useState<Pos | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, Answer>>>({});
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<PlaceView | null>(null);
  const errRef = useRef<HTMLDivElement>(null);

  const answerOf = (k: QuestionKey): Answer => answers[k] ?? 'unknown';
  const unanswered = QUESTION_KEYS.filter((k) => answerOf(k) === 'unknown');

  function validate(): string[] {
    const e: string[] = [];
    if (!name.trim()) e.push(t('add.err.name'));
    if (!category) e.push(t('add.err.category'));
    if (!pos || !confirmed || !insideKuwait(pos)) e.push(t('add.err.location'));
    return e;
  }

  function toReview() {
    const e = validate();
    setErrors(e);
    if (e.length) return void setTimeout(() => errRef.current?.focus(), 0);
    setStep('review');
    window.scrollTo(0, 0);
  }

  async function send() {
    const e = validate();
    if (e.length || !pos || !category) return void setErrors(e);
    setBusy(true);
    setErrors([]);
    try {
      const place = await submitPlace({
        name: name.trim(), category, governorate: governorate ? t('gov.' + governorate) : '', area, address, description,
        lat: pos.lat, lng: pos.lng, answers, answers_note: note,
        photos: photos.map((p) => ({ kind: p.kind, data_url: p.dataUrl })),
      });
      setSaved(place);
      setStep('done');
      window.scrollTo(0, 0);
    } catch (err) {
      const c = err instanceof ApiFailure ? err.code : '';
      setErrors([c === 'rate_limited' ? t('add.err.rate_limited') : c === 'too_long' ? t('add.err.too_long') : t('add.err.submit')]);
      setTimeout(() => errRef.current?.focus(), 0);
    } finally {
      setBusy(false);
    }
  }

  if (step === 'done' && saved) {
    return (
      <Screen title={t('add.title')} back footer={false}>
        <section className="glass cm-card cm-done" role="status">
          <CheckCircle2 size={48} aria-hidden="true" className="cm-done-ic" />
          <h1>{t('add.done.title')}</h1>
          <p>{t('add.done.body')}</p>
          <span className="cm-badge">{t('com.label')}</span>
          <button type="button" className="btn btn-primary btn-block" onClick={() => go('map', undefined, { focus: saved.id })}>{t('add.done.map')}</button>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => go('place', saved.id)}>{t('add.done.details')}</button>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => location.reload()}>{t('add.done.another')}</button>
        </section>
      </Screen>
    );
  }

  if (step === 'review') {
    const rows: [string, string][] = [
      [t('add.name'), name], [t('add.category'), category ? t('cat.' + category) : ''],
      [t('add.governorate'), governorate ? t('gov.' + governorate) : ''], [t('add.area'), area], [t('add.address'), address], [t('add.description'), description],
      [t('add.sec.location'), pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : ''],
    ];
    return (
      <Screen title={t('add.title')} back footer={false}>
        <section className="glass cm-card">
          <h1>{t('add.review.title')}</h1>
          <p className="small">{t('add.review.hint')}</p>
          <dl className="cm-review">
            {rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd dir="auto">{v}</dd></div>)}
            <div><dt>{t('add.sec.photos')}</dt><dd>{photos.length}</dd></div>
          </dl>
          {photos.length > 0 && <ul className="cm-thumbs cm-small">{photos.map((p) => <li key={p.id}><img src={p.dataUrl} alt={t('photo.' + p.kind)} /></li>)}</ul>}
          <h2>{t('add.sec.access')}</h2>
          <ul className="cm-answers">
            {QUESTION_KEYS.map((k) => <li key={k}><span>{t('q.' + k)}</span><strong className={`cm-ans cm-ans-${answerOf(k)}`}>{t('ans.' + answerOf(k))}</strong></li>)}
          </ul>
          {note && <p dir="auto">{note}</p>}
          {unanswered.length > 0 && (
            <div className="cm-unanswered">
              <strong>{t('add.review.unanswered')}</strong>
              <p className="small">{unanswered.map((k) => t('q.' + k)).join('، ')}</p>
            </div>
          )}
          {errors.length > 0 && <div ref={errRef} tabIndex={-1} role="alert" className="cm-error">{errors.map((x) => <p key={x}>{x}</p>)}</div>}
          <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={() => void send()}>{busy ? t('add.submitting') : t('add.submit')}</button>
          <button type="button" className="btn btn-secondary btn-block" disabled={busy} onClick={() => setStep('form')}>{t('add.review.edit')}</button>
        </section>
      </Screen>
    );
  }

  return (
    <Screen title={t('add.title')} back footer={false}>
      <form className="cm-form" noValidate onSubmit={(e) => { e.preventDefault(); toReview(); }}>
        <p className="small">{t('add.intro')}</p>
        {errors.length > 0 && (
          <div ref={errRef} tabIndex={-1} role="alert" className="glass cm-error">
            <strong>{t('add.errors')}</strong>
            <ul>{errors.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}

        <fieldset className="glass cm-card">
          <legend><h2>{t('add.sec.basic')}</h2></legend>
          <label>{t('add.name')} <span className="small">({t('add.required')})</span>
            <input className="field" value={name} maxLength={120} required aria-required="true" autoComplete="off" onChange={(e) => setName(e.target.value)} />
          </label>
          <label>{t('add.category')} <span className="small">({t('add.required')})</span>
            <select className="field" value={category} required aria-required="true" onChange={(e) => setCategory(e.target.value as CategoryKey | '')}>
              <option value="">{t('add.category.choose')}</option>
              {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{t('cat.' + k)}</option>)}
            </select>
          </label>
          <label>{t('add.governorate')}
            <select className="field" value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
              <option value="">{t('add.governorate.choose')}</option>
              {GOVERNORATES.map((g) => <option key={g} value={g}>{t('gov.' + g)}</option>)}
            </select>
          </label>
          <label>{t('add.area')}
            <input className="field" value={area} maxLength={80} onChange={(e) => setArea(e.target.value)} />
          </label>
          <label>{t('add.address')}
            <input className="field" value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label>{t('add.description')} <span className="small">({t('add.optional')})</span>
            <textarea className="field" rows={3} maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <AiHelp label={t('add.help.desc')} prompt={() => `${t('add.help.desc')}: «${description || name}». ${t('add.help.note')}`} />
        </fieldset>

        <fieldset className="glass cm-card">
          <legend><h2>{t('add.sec.photos')}</h2></legend>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </fieldset>

        <fieldset className="glass cm-card">
          <legend><h2>{t('add.sec.location')} <span className="small">({t('add.required')})</span></h2></legend>
          <LocationPicker pos={pos} confirmed={confirmed} onPos={(p) => { setPos(p); setConfirmed(false); }} onConfirm={setConfirmed} />
        </fieldset>

        <fieldset className="glass cm-card">
          <legend><h2>{t('add.sec.access')}</h2></legend>
          <p className="small">{t('add.access.hint')}</p>
          {QUESTION_KEYS.map((k) => (
            <div key={k} className="cm-q" role="radiogroup" aria-labelledby={`q-${k}`}>
              <span id={`q-${k}`} className="cm-q-label">{t('q.' + k)}</span>
              <div className="cm-seg">
                {ANSWERS.map((a) => (
                  <label key={a} className={`cm-opt${answerOf(k) === a ? ' on' : ''}`}>
                    <input type="radio" name={`q-${k}`} value={a} checked={answerOf(k) === a} onChange={() => setAnswers({ ...answers, [k]: a })} />
                    <span>{t('ans.' + a)}</span>
                  </label>
                ))}
              </div>
              <AiHelp label={t('add.help.q')} prompt={() => `${t('add.help.q')}: «${t('q.' + k)}»`} />
            </div>
          ))}
          <label>{t('add.access.note')} <span className="small">({t('add.optional')})</span>
            <textarea className="field" rows={3} maxLength={600} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </fieldset>

        <button type="submit" className="btn btn-primary btn-block">{t('add.review')}</button>
      </form>
    </Screen>
  );
}
