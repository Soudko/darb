import { Globe } from 'lucide-react';
import { usePrefs, setPrefs } from '../../state/prefs';
import { useT } from '../../strings';
import '../../styles/shell.css';

export function LangButton() {
  const p = usePrefs();
  const t = useT();
  return (
    <button type="button" className="btn btn-secondary sh-lang" aria-label={t('lang.switch_label')}
      onClick={() => setPrefs({ lang: p.lang === 'ar' ? 'en' : 'ar' })}>
      <Globe size={20} aria-hidden="true" />
      <span>{t('lang.switch')}</span>
    </button>
  );
}
