// Place details «تفاصيل المكان»: photo, name, status, and Information / Facilities tabs.
import { useState, type KeyboardEvent } from 'react';
import { Check, CircleHelp, X, Volume2, Armchair, SquareParking, Toilet, ArrowUpDown, Accessibility, MapPin } from 'lucide-react';
import type { FacilityKey, Point, PlaceView, YesNoUnknown } from '../../../shared/types';
import { FACILITY_KEYS } from '../../../shared/types';
import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/place/StatusBadge';
import { PlaceThumb } from '../components/place/PlaceThumb';
import { usePlaces } from '../components/place/usePlaces';
import { go } from '../lib/nav';
import { usePrefs } from '../state/prefs';
import { useT } from '../strings';
import '../styles/places.css';

const FAC_ICON = { entrances: Accessibility, parking: SquareParking, lifts: ArrowUpDown, toilets: Toilet, seating: Armchair } as const;
const YN_ICON = { yes: Check, no: X, unknown: CircleHelp } as const;
type Tab = 'info' | 'facilities';
const TABS: Tab[] = ['info', 'facilities'];

export function PlaceDetails({ id }: { id: string }) {
  const t = useT();
  const [state, retry] = usePlaces();
  const [tab, setTab] = useState<Tab>('info');
  const place = state.status === 'ready' ? state.places.find((p) => p.id === id) : undefined;

  return (
    <Screen title={t('details.title')} back footer={false}>
      <div className="place-details">
        {state.status === 'loading' && <p className="glass" role="status">{t('map.loading')}</p>}
        {state.status === 'error' && (
          <div className="glass" role="alert">
            <p>{t('error.generic')}</p>
            <button type="button" className="btn btn-primary" onClick={retry}>{t('ai.try_again')}</button>
          </div>
        )}
        {state.status === 'ready' && !place && (
          <div className="glass">
            <p>{t('honest.no_data')}</p>
            <button type="button" className="btn btn-primary" onClick={() => go('map')}>{t('details.to_map')}</button>
          </div>
        )}
        {place && <Body place={place} tab={tab} setTab={setTab} />}
      </div>
    </Screen>
  );
}

function Body({ place, tab, setTab }: { place: PlaceView; tab: Tab; setTab: (t: Tab) => void }) {
  const t = useT();
  const { lang } = usePrefs();
  const name = lang === 'ar' ? place.name_ar : place.name_en;

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = TABS[(TABS.indexOf(tab) + 1) % TABS.length];
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <>
      <PlaceThumb place={place} large />
      <div className="details-head">
        <h1>{name}</h1>
        <StatusBadge status={place.status} />
        {place.is_sample && <span className="label-sample">{t('honest.sample')}</span>}
      </div>

      <div className="tabs" role="tablist" aria-label={t('details.tabs')} onKeyDown={onKey}>
        {TABS.map((k) => (
          <button
            key={k}
            id={`tab-${k}`}
            type="button"
            role="tab"
            aria-selected={tab === k}
            aria-controls={`panel-${k}`}
            tabIndex={tab === k ? 0 : -1}
            className="tab"
            onClick={() => setTab(k)}
          >
            {t(`details.tab.${k}`)}
          </button>
        ))}
      </div>

      <div id="panel-info" role="tabpanel" aria-labelledby="tab-info" hidden={tab !== 'info'}>
        <InfoPanel place={place} />
      </div>
      <div id="panel-facilities" role="tabpanel" aria-labelledby="tab-facilities" hidden={tab !== 'facilities'}>
        <FacilitiesPanel place={place} />
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={() => go('coming', 'voice')}>
        <Volume2 size={20} aria-hidden="true" />
        {t('details.voice')}
      </button>
    </>
  );
}

function InfoPanel({ place }: { place: PlaceView }) {
  const t = useT();
  const { lang } = usePrefs();
  return (
    <section className="glass details-card">
      <dl className="info-list">
        <div><dt>{t('details.type')}</dt><dd>{t(`type.${place.type}`)}</dd></div>
      </dl>
      <h2>{t('details.points')}</h2>
      {place.points.length === 0 ? (
        <p className="small">{t('details.no_points')}</p>
      ) : (
        <ul className="point-list">
          {place.points.map((p) => <PointRow key={p.id} p={p} lang={lang} />)}
        </ul>
      )}
      <span className="label-community">{t('honest.community')}</span>
    </section>
  );
}

function PointRow({ p, lang }: { p: Point; lang: 'ar' | 'en' }) {
  const t = useT();
  const showAccess = p.kind === 'entrance' || p.kind === 'parking';
  const Icon = p.accessible ? Check : X;
  return (
    <li className="point-row">
      <MapPin size={20} aria-hidden="true" className="point-pin" />
      <div>
        <strong>{lang === 'ar' ? p.name_ar : p.name_en}</strong>
        <div className="small">
          {t(`point.${p.kind}`)}
          {showAccess && (
            <>
              {' · '}
              <span className="inline-ic"><Icon size={14} aria-hidden="true" strokeWidth={3} /> {t(p.accessible ? 'point.accessible' : 'point.not_accessible')}</span>
            </>
          )}
          {p.quiet && <> · {t('point.quiet')}</>}
        </div>
      </div>
    </li>
  );
}

function FacilitiesPanel({ place }: { place: PlaceView }) {
  const t = useT();
  const { lang } = usePrefs();
  const hasAny = FACILITY_KEYS.some((k) => place.facilities[k]);
  if (!hasAny) return <p className="glass details-card">{t('honest.no_data')}</p>;
  return (
    <ul className="fac-list">
      {FACILITY_KEYS.map((k: FacilityKey) => {
        const f = place.facilities[k];
        const avail: YesNoUnknown = f?.available ?? 'unknown';
        const FIcon = FAC_ICON[k];
        const YIcon = YN_ICON[avail];
        const note = f ? (lang === 'ar' ? f.note_ar : f.note_en) : undefined;
        return (
          <li key={k} className="glass fac-row">
            <div className="fac-main">
              <FIcon size={24} aria-hidden="true" className="fac-icon" />
              <div className="fac-text">
                <strong>{t(`fac.${k}`)}</strong>
                {f?.count !== undefined && avail === 'yes' && <span className="small"> ({t('fac.count')}: {f.count})</span>}
              </div>
              <span className={`yn yn-${avail}`}>
                <YIcon size={16} aria-hidden="true" strokeWidth={3} />
                {t(`yn.${avail}`)}
              </span>
            </div>
            {note && <p className="fac-note">{note}</p>}
            {f && (
              <p className="small fac-source">
                {t('fac.source')}: {f.source} · <span dir="ltr">{f.date}</span>
                <br />
                <span className="label-community">{t('honest.community')}</span>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
