import { ArrowLeft, ArrowRight } from 'lucide-react';
import { back } from '../../lib/nav';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../strings';
import '../../styles/shell.css';

export function Header({ title, showBack }: { title?: string; showBack?: boolean }) {
  const p = usePrefs();
  const t = useT();
  const mark = p.theme === 'light' ? '/brand/darb-mark-light.svg' : '/brand/darb-mark-dark.svg';
  const BackIcon = p.lang === 'ar' ? ArrowRight : ArrowLeft; // points the way "back" lies
  return (
    <header className="sh-header glass-strong">
      {showBack && (
        <button type="button" className="icon-btn" aria-label={t('nav.back')} onClick={back}>
          <BackIcon size={22} aria-hidden="true" />
        </button>
      )}
      {title ? <h1 className="sh-title">{title}</h1> : <span className="sh-spacer" />}
      <div className="sh-brand">
        <img src={mark} alt={p.lang === 'ar' ? 'درب' : 'Darb'} />
        <span aria-hidden="true">{t('app.name')}</span>
      </div>
    </header>
  );
}
