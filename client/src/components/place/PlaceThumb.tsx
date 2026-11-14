// A place photo, or a tidy placeholder with the place-type icon when there is no photo.
import { useState } from 'react';
import type { PlaceView } from '../../../../shared/types';
import { TYPE_ICON } from './typeIcon';

export function PlaceThumb({ place, large = false }: { place: PlaceView; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const Icon = TYPE_ICON[place.type] ?? TYPE_ICON.other;
  const cls = `place-thumb${large ? ' place-thumb-large' : ''}`;
  const src = place.community?.photos[0]?.url ?? (place.photo ? `/places/${place.photo}` : '');
  if (!src || failed) {
    return (
      <div className={`${cls} place-thumb-empty`} aria-hidden="true">
        <Icon size={large ? 56 : 32} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className={cls}>
      <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
