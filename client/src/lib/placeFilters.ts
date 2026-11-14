// Filters for the map and list. Pure functions, no side effects.
import type { PlaceView } from '../../../shared/types';

export type Quick = 'all' | 'accessible' | 'parking' | 'food';
export interface Advanced {
  wheelchair: boolean;
  blind: boolean;
  parking: boolean;
  toilets: boolean;
  seating: boolean;
  lifts: boolean;
}
export const noAdvanced: Advanced = { wheelchair: false, blind: false, parking: false, toilets: false, seating: false, lifts: false };
export const ADVANCED_KEYS = Object.keys(noAdvanced) as (keyof Advanced)[];

export function advancedCount(a: Advanced): number {
  return ADVANCED_KEYS.filter((k) => a[k]).length;
}

const yes = (p: PlaceView, k: keyof PlaceView['facilities']) => p.facilities[k]?.available === 'yes';

export function matches(p: PlaceView, quick: Quick, a: Advanced): boolean {
  if (quick === 'accessible' && p.status === 'unknown') return false;
  if (quick === 'parking' && !yes(p, 'parking')) return false;
  if (quick === 'food' && p.type !== 'restaurant' && p.type !== 'cafe') return false;
  if (a.wheelchair && !yes(p, 'entrances')) return false;
  if (a.blind && !p.points.some((pt) => pt.kind === 'entrance' && pt.accessible)) return false;
  if (a.parking && !yes(p, 'parking')) return false;
  if (a.toilets && !yes(p, 'toilets')) return false;
  if (a.seating && !yes(p, 'seating')) return false;
  if (a.lifts && !yes(p, 'lifts')) return false;
  return true;
}

export function applyFilters(places: PlaceView[], quick: Quick, a: Advanced): PlaceView[] {
  return places.filter((p) => matches(p, quick, a));
}
