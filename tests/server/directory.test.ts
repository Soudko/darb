import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { createApp } from '../../server/app';
import { checkEntry, DIRECTORY_FILE, loadDirectory } from '../../server/directory';
import { call } from './helper';

const good = {
  id: 'x-1', section: 'support', name_ar: 'أ', name_en: 'A', what_ar: 'ب', what_en: 'B', how_ar: '', how_en: '',
  phone: '112', website: 'https://example.gov.kw', source: 'https://example.gov.kw/page', official_source: true,
};

describe('checkEntry', () => {
  it('keeps a complete entry and takes the file date when the entry has none', () => {
    expect(checkEntry(good, '2026-11-14')?.checked).toBe('2026-11-14');
  });
  it('drops an entry without an https source, a name, a known section or a sensible phone', () => {
    for (const bad of [
      { ...good, source: 'http://example.com' }, { ...good, source: '' }, { ...good, name_en: '' },
      { ...good, section: 'news' }, { ...good, phone: 'call us' }, { ...good, website: 'javascript:alert(1)' },
      { ...good, id: 'Bad Id' },
    ]) expect(checkEntry(bad, '2026-11-14')).toBeNull();
  });
  it('official_source is true only when the file says true', () => {
    expect(checkEntry({ ...good, official_source: 'yes' }, '2026-11-14')?.official_source).toBe(false);
  });
});

describe('the real directory file', () => {
  it('every entry in data/directory.json passes the check (none skipped)', () => {
    if (!fs.existsSync(DIRECTORY_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(DIRECTORY_FILE, 'utf8'));
    expect(loadDirectory().length).toBe(raw.entries.length);
    expect(new Set(raw.entries.map((e: any) => e.id)).size).toBe(raw.entries.length);
  });
});

describe('GET /api/directory', () => {
  it('returns a list', async () => {
    const res = await call(createApp(), 'GET', '/api/directory');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.entries)).toBe(true);
  });
});
