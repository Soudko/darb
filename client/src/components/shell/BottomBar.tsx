import { House, Map, Bell, Settings } from 'lucide-react';
import { go, useRoute } from '../../lib/nav';
import { useT } from '../../strings';
import '../../styles/shell.css';

const items = [
  { screen: 'home', key: 'nav.home', Icon: House },
  { screen: 'map', key: 'nav.map', Icon: Map },
  { screen: 'alerts', key: 'nav.alerts', Icon: Bell },
  { screen: 'settings', key: 'nav.settings', Icon: Settings },
];

export function BottomBar() {
  const t = useT();
  const route = useRoute();
  const current = route.screen || 'home';
  return (
    <nav className="sh-bar glass-strong" aria-label={t('nav.main')}>
      {items.map(({ screen, key, Icon }) => (
        <button key={screen} type="button" className="sh-bar-item" aria-current={current === screen ? 'page' : undefined} onClick={() => go(screen)}>
          <Icon aria-hidden="true" />
          <span>{t(key)}</span>
        </button>
      ))}
    </nav>
  );
}
