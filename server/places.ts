import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AccessStatus, Place, PlaceView } from '../shared/types';

const here = path.dirname(fileURLToPath(import.meta.url));
export const PLACES_FILE = path.resolve(here, '../data/places.json');

// Full = all four main facilities are "yes". Partial = at least one is "yes".
export function workOutStatus(place: Pick<Place, 'facilities'>): AccessStatus {
  const keys = ['entrances', 'parking', 'lifts', 'toilets'] as const;
  const yes = keys.filter((k) => place.facilities?.[k]?.available === 'yes').length;
  if (yes === keys.length) return 'full';
  return yes > 0 ? 'partial' : 'unknown';
}

const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown) => typeof v === 'string' && v.length > 0;

function looksValid(p: any): boolean {
  return (
    p && isStr(p.id) && isStr(p.name_ar) && isStr(p.name_en) && isStr(p.type) &&
    isNum(p.lat) && isNum(p.lng) && p.facilities && typeof p.facilities === 'object' &&
    !Array.isArray(p.facilities) && Array.isArray(p.points)
  );
}

export function loadPlaces(file = PLACES_FILE): PlaceView[] {
  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    console.error('places: could not read the places file');
    return [];
  }
  const list: any[] = Array.isArray(raw?.places) ? raw.places : [];
  const out: PlaceView[] = [];
  for (const p of list) {
    if (!looksValid(p)) {
      console.error(`places: skipped an invalid place (id: ${String(p?.id)})`);
      continue;
    }
    out.push({ ...(p as Place), status: workOutStatus(p) });
  }
  return out;
}

let cache: PlaceView[] | null = null;
// Loaded once, the first time it is asked for.
export function getPlaces(): PlaceView[] {
  if (!cache) cache = loadPlaces();
  return cache;
}
