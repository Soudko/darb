import { useCallback, useEffect, useState } from 'react';
import type { PlaceView } from '../../../../shared/types';
import { getPlaces } from '../../lib/api';

export type PlacesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; places: PlaceView[] };

export function usePlaces(): [PlacesState, () => void] {
  const [state, setState] = useState<PlacesState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setState({ status: 'loading' });
    getPlaces().then(
      (places) => live && setState({ status: 'ready', places }),
      () => live && setState({ status: 'error' }),
    );
    return () => {
      live = false;
    };
  }, [attempt]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return [state, retry];
}
