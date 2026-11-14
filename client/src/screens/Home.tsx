import { Navigation, MapPin, Headset, Landmark, Camera } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { go } from '../lib/nav';
import { usePrefs } from '../state/prefs';
import { useT } from '../strings';
import { Screen } from '../components/Screen';
import { HomeHero } from '../components/shell/HomeHero';
import { AiOrb } from '../components/shell/AiOrb';
import '../styles/shell.css';

const tiles: { key: string; Icon: LucideIcon; to: () => void }[] = [
  { key: 'places', Icon: Navigation, to: () => go('map') },
  { key: 'nav', Icon: MapPin, to: () => go('coming', 'voice') },
  { key: 'support', Icon: Headset, to: () => go('coming', 'support') },
  { key: 'gov', Icon: Landmark, to: () => go('coming', 'government') },
];

export function Home(_props: {}) {
  const p = usePrefs();
  const t = useT();
  return (
    <Screen header={false}>
      <HomeHero />
      <div className="sh-home-body">
        <button type="button" className="sh-ai" onClick={() => go('assistant')} aria-label={`${t('hm.ai.title')}. ${t('hm.ai.sub')}`}>
          <span className="sh-ai-text">
            <strong>{t('hm.ai.title')}</strong>
            <span>{t('hm.ai.sub')}</span>
          </span>
          <AiOrb />
        </button>
        <div className="sh-grid">
          {tiles.map(({ key, Icon, to }) => (
            <button key={key} type="button" className="glass sh-tile" onClick={to}>
              <Icon aria-hidden="true" />
              <span>{t('hm.tile.' + key)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="glass sh-scan" onClick={() => go('coming', 'companion')}>
          <span className="sh-scan-text">
            <span className="sh-badge">{t('hm.new')}</span>
            <strong>{t('hm.scan.title')}</strong>
            <span>{t('hm.scan.sub')}</span>
          </span>
          <span className="sh-frame decor" aria-hidden="true">
            <i className="c1 decor" /><i className="c2 decor" /><i className="c3 decor" /><i className="c4 decor" />
            <Camera />
          </span>
        </button>
        {p.needs.length > 0 && (
          <div className="sh-chips" role="group" aria-label={t('home.needs')}>
            {p.needs.map((n) => <span key={n} className="chip">{t('need.' + n)}</span>)}
            <a className="sh-link" href="#/needs">{t('home.edit')}</a>
          </div>
        )}
      </div>
    </Screen>
  );
}
