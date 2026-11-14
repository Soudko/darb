import { useEffect, useState } from 'react';
import { ExternalLink, Info, Phone } from 'lucide-react';
import type { DirectoryEntry, DirectorySection } from '../../../shared/types';
import { Screen } from '../components/Screen';
import { getDirectory } from '../lib/api';
import { usePrefs } from '../state/prefs';
import { useT } from '../strings';
import '../styles/directory.css';

// Support and Government services show one section; Services shows every section.
const PAGES: Record<string, DirectorySection[]> = {
  support: ['support'],
  government: ['government'],
  services: ['government', 'support', 'services'],
};
export const isDirectoryPage = (p?: string): p is string => !!p && p in PAGES;

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

function Card({ e }: { e: DirectoryEntry }) {
  const t = useT();
  const { lang } = usePrefs();
  const ar = lang === 'ar';
  const how = ar ? e.how_ar : e.how_en;
  return (
    <article className="glass dir-card">
      <h3 className="dir-name">{ar ? e.name_ar : e.name_en}</h3>
      <p>{ar ? e.what_ar : e.what_en}</p>
      {how && (
        <p className="dir-how"><strong>{t('dir.how')}: </strong>{how}</p>
      )}
      <div className="dir-actions">
        {e.phone && (
          <a className="btn btn-secondary dir-btn" href={`tel:${e.phone.replace(/[\s-]/g, '')}`}>
            <Phone size={18} aria-hidden="true" /> {t('dir.call')} <span dir="ltr">{e.phone}</span>
          </a>
        )}
        {e.website && (
          <a className="btn btn-secondary dir-btn" href={e.website} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={18} aria-hidden="true" /> {t('dir.website')}
            <span className="sr-only"> {t('dir.opens_new')}</span>
          </a>
        )}
      </div>
      <p className="small dir-source">
        {t('dir.source')}:{' '}
        <a href={e.source} target="_blank" rel="noopener noreferrer" dir="ltr">{host(e.source)}</a>
        {' · '}{t('dir.checked')} <span dir="ltr">{e.checked}</span>
        {' · '}{e.official_source ? t('dir.official') : t('dir.unofficial')}
      </p>
    </article>
  );
}

export function Directory({ page }: { page: string }) {
  const t = useT();
  const sections = PAGES[page] ?? [];
  const [entries, setEntries] = useState<DirectoryEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    getDirectory()
      .then((list) => live && setEntries(list))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const title = t('coming.' + page);
  return (
    <Screen title={title} back footer={false}>
      <section className="glass dir-intro">
        <Info size={20} aria-hidden="true" className="dir-intro-ic" />
        <div>
          <p>{t('dir.intro')}</p>
          <p className="small">{t('dir.not_official')}</p>
          {page === 'government' && <p className="small">{t('coming.gov_note')}</p>}
        </div>
      </section>

      {failed && <p role="alert">{t('dir.error')}</p>}
      {!failed && !entries && <p className="small" aria-live="polite">{t('dir.loading')}</p>}
      {entries &&
        sections.map((s) => {
          const list = entries.filter((e) => e.section === s);
          return (
            <section key={s} className="dir-section" aria-labelledby={`dir-h-${s}`}>
              {sections.length > 1 && <h2 id={`dir-h-${s}`}>{t('dir.section.' + s)}</h2>}
              {sections.length === 1 && <h2 id={`dir-h-${s}`} className="sr-only">{title}</h2>}
              {list.length === 0 ? <p className="small">{t('dir.empty')}</p> : list.map((e) => <Card key={e.id} e={e} />)}
            </section>
          );
        })}
    </Screen>
  );
}
