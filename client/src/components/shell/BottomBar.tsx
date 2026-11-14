import { House, Map, LayoutGrid, UserRound } from 'lucide-react';
import { go, useRoute } from '../../lib/nav';
import { useT } from '../../strings';
import { useAiActivity } from '../../state/aiActivity';
import '../../styles/shell.css';

export function BottomBar() {
  const t = useT();
  const activity = useAiActivity();
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
      <button type="button" className={`sh-bar-ai${activity !== 'idle' ? ' is-active' : ''}`} data-activity={activity} aria-label={t('bar.assistant')} aria-current={s === 'assistant' ? 'page' : undefined} onClick={() => go('assistant')}>
        <svg className="sh-wave" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
          {[3, 9, 15, 21, 27].map((x, i) => <rect key={x} className="sh-wave-bar" style={{ animationDelay: `${i * 0.12}s` }} x={x - 1.5} y="6" width="3" height="18" rx="1.5" />)}
        </svg>
      </button>
      {item('bar.services', LayoutGrid, services, () => go('coming', 'services'))}
      {item('bar.profile', UserRound, s === 'settings', () => go('settings'))}
    </nav>
  );
}
