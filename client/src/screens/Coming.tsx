import { Hourglass, Sparkles } from 'lucide-react';
import { go } from '../lib/nav';
import { useT } from '../strings';
import { Screen } from '../components/Screen';
import '../styles/shell.css';

const known = ['voice', 'seating', 'companion', 'favourites', 'report', 'alerts', 'support', 'government', 'services'];

export function Coming({ name }: { name: string }) {
  const t = useT();
  const title = t('coming.' + (known.includes(name) ? name : 'other'));
  return (
    <Screen title={title} back>
      <section className="glass sh-center">
        <Hourglass className="sh-coming-ic" aria-hidden="true" />
        <h2>{title}</h2>
        <p>{t('coming.soon')}</p>
        {name === 'government' && <p className="small">{t('coming.gov_note')}</p>}
      </section>
      <button type="button" className="btn btn-primary btn-block" onClick={() => go('assistant')}>
        <Sparkles size={20} aria-hidden="true" />{t('home.ask')}
      </button>
    </Screen>
  );
}
