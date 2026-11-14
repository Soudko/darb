// A glass card for one place, used on the map and by the assistant.
import { Map as MapIcon, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import type { PlaceView } from '../../../../shared/types';
import { go } from '../../lib/nav';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../strings';
import { StatusBadge } from './StatusBadge';
import { PlaceThumb } from './PlaceThumb';
import { CommunityBadge } from '../community/CommunitySection';
import '../../styles/places.css';

export interface PlaceCardProps { place: PlaceView; why?: string; distanceM?: number; }

export function formatDistance(m: number, t: (k: string) => string): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} ${t('place.km')}`;
  return `${Math.max(1, Math.round(m))} ${t('place.m')}`;
}

export function PlaceCard({ place, why, distanceM }: PlaceCardProps) {
  const t = useT();
  const { lang } = usePrefs();
  const name = lang === 'ar' ? place.name_ar : place.name_en;
  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;
  return (
    <article className="glass place-card" aria-label={name}>
      <div className="place-card-top">
        <PlaceThumb place={place} />
        <div className="place-card-info">
          <h2 className="place-card-name">{name}</h2>
          <StatusBadge status={place.status} />
          <CommunityBadge place={place} />
          {distanceM !== undefined && <span className="place-distance">{formatDistance(distanceM, t)}</span>}
        </div>
      </div>
      {why && (
        <div className="place-why">
          <Lightbulb size={18} aria-hidden="true" />
          <div>
            <strong>{t('place.why')}</strong>
            <p>{why}</p>
          </div>
        </div>
      )}
      <div className="place-labels">
        {place.is_sample && <span className="label-sample">{t('honest.sample')}</span>}
        <span className="label-community">{t('honest.community')}</span>
      </div>
      <div className="place-card-actions">
        <button type="button" className="btn btn-secondary" onClick={() => go('map', undefined, { focus: place.id })}>
          <MapIcon size={18} aria-hidden="true" />
          {t('place.show_map')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go('place', place.id)}>
          {t('place.details')}
          <Chevron size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
