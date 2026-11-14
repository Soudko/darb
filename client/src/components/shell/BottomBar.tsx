import { House, Map, AudioLines, LayoutGrid, UserRound } from 'lucide-react';
import { go, useRoute } from '../../lib/nav';
import { useT } from '../../strings';
import '../../styles/shell.css';

export function BottomBar() {
  const t = useT();
  const route = useRoute();
  const s = route.screen || 'home';
  const services = s === 'coming' && route.param === 'services';
  const item = (key: string, Icon: typeof House, on: boolean, to: () => void) => (
    <button key={key} type="button" className="sh-bar-item" aria-current={on ? 'page' : undefined} onClick={to}>
      <Icon aria-hidden="true" /><span>{t(key)}</span>
    </button>
  );
  return (
    <nav className="sh-bar glass-strong" aria-label={t('nav.main')}>
      {item('nav.home', House, s === 'home', () => go('home'))}
      {item('nav.map', Map, s === 'map' || s === 'place', () => go('map'))}
      <button type="button" className="sh-bar-ai" aria-label={t('bar.assistant')} aria-current={s === 'assistant' ? 'page' : undefined} onClick={() => go('assistant')}>
        <AudioLines aria-hidden="true" />
      </button>
      {item('bar.services', LayoutGrid, services, () => go('coming', 'services'))}
      {item('bar.profile', UserRound, s === 'settings', () => go('settings'))}
    </nav>
  );
}
