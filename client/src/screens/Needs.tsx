import { Accessibility, Eye, Ear, MessageCircle, Brain, Users, Bandage, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NEEDS } from '../../../shared/types';
import type { Need } from '../../../shared/types';
import { go } from '../lib/nav';
import { usePrefs, setPrefs } from '../state/prefs';
import { useT } from '../strings';
import { Screen } from '../components/Screen';
import '../styles/shell.css';

const icons: Record<Need, LucideIcon> = {
  mobility: Accessibility, visual: Eye, hearing: Ear, speech: MessageCircle, cognitive: Brain, elderly: Users, temporary: Bandage,
};

export function Needs(_props: {}) {
  const p = usePrefs();
  const t = useT();
  const toggle = (n: Need) => setPrefs({ needs: p.needs.includes(n) ? p.needs.filter((x) => x !== n) : [...p.needs, n] });
  return (
    <Screen title={t('needs.title')} back bottomBar={false}>
      <p className="small">{t('needs.hint')}</p>
      <div className="sh-col">
        {NEEDS.map((n) => {
          const Icon = icons[n];
          const on = p.needs.includes(n);
          return (
            <button key={n} type="button" aria-pressed={on} className={'glass sh-need' + (on ? ' selected' : '')} onClick={() => toggle(n)}>
              <Icon aria-hidden="true" />
              <span>{t('need.' + n)}</span>
              <span className="tick" aria-hidden="true"><Check /></span>
            </button>
          );
        })}
      </div>
      <p className="small sh-center">{t('needs.saved')}</p>
      <button type="button" className="btn btn-primary btn-block" onClick={() => { setPrefs({ onboarded: true }); go('home'); }}>{t('needs.continue')}</button>
    </Screen>
  );
}
