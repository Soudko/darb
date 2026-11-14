import { useT } from '../strings';
import { Screen } from '../components/Screen';
import '../styles/shell.css';

const credits = ['react', 'vite', 'express', 'leaflet', 'osm', 'lucide', 'fonts', 'ai'];

export function About(_props: {}) {
  const t = useT();
  return (
    <Screen title={t('about.title')} back>
      <section className="glass"><p>{t('about.what')}</p></section>
      <section className="glass">
        <h2>{t('about.honest_title')}</h2>
        <p>{t('about.honest')}</p>
      </section>
      <section className="glass">
        <h2>{t('about.privacy_title')}</h2>
        <p>{t('about.privacy')}</p>
      </section>
      <section className="glass">
        <h2>{t('about.credits_title')}</h2>
        <ul className="sh-list">{credits.map((c) => <li key={c}>{t('about.credits.' + c)}</li>)}</ul>
      </section>
    </Screen>
  );
}
