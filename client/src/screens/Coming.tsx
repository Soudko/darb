import { Hourglass } from 'lucide-react';
import { useT } from '../strings';
import { Screen } from '../components/Screen';
import '../styles/shell.css';

const known = ['voice', 'seating', 'companion', 'favourites', 'report', 'alerts'];

export function Coming({ name }: { name: string }) {
  const t = useT();
  const title = t('coming.' + (known.includes(name) ? name : 'other'));
  return (
    <Screen title={title} back>
      <section className="glass sh-center">
        <Hourglass className="sh-coming-ic" aria-hidden="true" />
        <h2>{title}</h2>
        <p>{t('coming.soon')}</p>
      </section>
    </Screen>
  );
}
