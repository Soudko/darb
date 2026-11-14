import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIRECTORY_SECTIONS } from '../shared/types';
import type { DirectoryEntry } from '../shared/types';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DIRECTORY_FILE = path.resolve(here, '../data/directory.json');

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const isHttps = (v: string) => /^https:\/\/[^\s]+$/.test(v);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isPhone = (v: string) => v === '' || /^[+\d][\d\s-]{2,19}$/.test(v);

// Only entries with a name in both languages, a section, an https source and a date get through.
export function checkEntry(e: any, checked: string): DirectoryEntry | null {
  const entry: DirectoryEntry = {
    id: str(e?.id), section: e?.section, name_ar: str(e?.name_ar), name_en: str(e?.name_en),
    what_ar: str(e?.what_ar), what_en: str(e?.what_en), how_ar: str(e?.how_ar), how_en: str(e?.how_en),
    phone: str(e?.phone), website: str(e?.website), source: str(e?.source),
    checked: str(e?.checked) || checked, official_source: e?.official_source === true,
  };
  const ok =
    /^[a-z0-9-]+$/.test(entry.id) && DIRECTORY_SECTIONS.includes(entry.section) &&
    entry.name_ar && entry.name_en && entry.what_ar && entry.what_en &&
    isHttps(entry.source) && isDate(entry.checked) && isPhone(entry.phone) &&
    (entry.website === '' || isHttps(entry.website));
  return ok ? entry : null;
}

export function loadDirectory(file = DIRECTORY_FILE): DirectoryEntry[] {
  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return []; // no file yet: the screens show "nothing yet"
  }
  const out: DirectoryEntry[] = [];
  for (const e of Array.isArray(raw?.entries) ? raw.entries : []) {
    const ok = checkEntry(e, str(raw?.checked));
    if (ok) out.push(ok);
    else console.error(`directory: skipped an invalid entry (id: ${String(e?.id)})`);
  }
  return out;
}

let cache: DirectoryEntry[] | null = null;
export function getDirectory(): DirectoryEntry[] {
  if (!cache) cache = loadDirectory();
  return cache;
}
