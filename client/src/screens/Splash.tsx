import { go } from '../lib/nav';
import { usePrefs } from '../state/prefs';
import { useT } from '../strings';
import { Skyline } from '../components/shell/Skyline';
import { LangButton } from '../components/shell/LangButton';
import '../styles/shell.css';

export function Splash(_props: {}) {
  const p = usePrefs();
  const t = useT();
  const logo = p.theme === 'light' ? '/brand/darb-logo-ar-light.svg' : '/brand/darb-logo-ar-dark.svg';
  return (
    <div className="sh-stage">
      <Skyline />
      <div className="sh-stage-body">
        <img className="sh-logo" src={logo} alt={p.lang === 'ar' ? 'درب' : 'Darb'} style={{ marginTop: 'clamp(16px, 6vh, 56px)' }} />
        <p className="glass sh-card-tag">{t('app.tagline')}</p>
      </div>
      <div className="sh-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={() => go(p.onboarded ? 'home' : 'onboarding')}>{t('splash.start')}</button>
        <LangButton />
      </div>
    </div>
  );
}
