import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search, Sparkles, Navigation, Map, Armchair, Camera, Heart, FlagTriangleRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { go } from '../lib/nav';
import { usePrefs } from '../state/prefs';
import { useT } from '../strings';
import { Screen } from '../components/Screen';
import '../styles/shell.css';

const tiles: { key: string; Icon: LucideIcon; to: () => void }[] = [
  { key: 'voice', Icon: Navigation, to: () => go('coming', 'voice') },
  { key: 'map', Icon: Map, to: () => go('map') },
  { key: 'seating', Icon: Armchair, to: () => go('coming', 'seating') },
  { key: 'companion', Icon: Camera, to: () => go('coming', 'companion') },
  { key: 'favourites', Icon: Heart, to: () => go('coming', 'favourites') },
  { key: 'report', Icon: FlagTriangleRight, to: () => go('coming', 'report') },
];

export function Home(_props: {}) {
  const p = usePrefs();
  const t = useT();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim();
    if (text) go('assistant', undefined, { q: text });
    else go('assistant');
  };
  return (
    <Screen>
      <section>
        <h1>{t('home.welcome')}</h1>
        <p className="small">{t('home.help')}</p>
      </section>
      <form className="glass sh-search" onSubmit={submit} role="search">
        <Search size={22} aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('home.search')} aria-label={t('home.search')}
          onClick={() => { if (!q.trim()) go('assistant'); }} />
        <button type="submit" className="icon-btn" aria-label={t('home.search_go')}><Search size={20} aria-hidden="true" /></button>
      </form>
      <button type="button" className="btn btn-primary btn-block" onClick={() => go('assistant')}>
        <Sparkles size={20} aria-hidden="true" />{t('home.ask')}
      </button>
      <div className="sh-grid">
        {tiles.map(({ key, Icon, to }) => (
          <button key={key} type="button" className="glass sh-tile" onClick={to}>
            <Icon aria-hidden="true" />
            <span>{t('home.tile.' + key)}</span>
          </button>
        ))}
      </div>
      {p.needs.length > 0 && (
        <div className="sh-chips" aria-label={t('home.needs')}>
          {p.needs.map((n) => <span key={n} className="chip">{t('need.' + n)}</span>)}
          <a className="sh-link" href="#/needs">{t('home.edit')}</a>
        </div>
      )}
    </Screen>
  );
}
