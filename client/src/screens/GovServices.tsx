// «الخدمات الحكومية لذوي الإعاقة»: a list of ten services and a detail screen for each. Informational only.
import { ExternalLink, FileText, Wallet, Car, Accessibility, CalendarCheck, Clock, HeartHandshake, GraduationCap, Stethoscope, Briefcase, ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Screen } from '../components/Screen';
import { GOV_SERVICES } from '../data/govServices';
import { go } from '../lib/nav';
import { useT } from '../strings';
import '../styles/directory.css';

const ICONS: Record<string, LucideIcon> = {
  file: FileText, wallet: Wallet, car: Car, chair: Accessibility, calendar: CalendarCheck,
  clock: Clock, heart: HeartHandshake, school: GraduationCap, health: Stethoscope, briefcase: Briefcase,
};

const host = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

function Footer() {
  const t = useT();
  return <p className="small gov-footer">{t('gov.footer')}</p>;
}

export function GovServices({ id }: { id?: string }) {
  const t = useT();
  const s = id ? GOV_SERVICES.find((x) => x.id === id) : undefined;

  if (id && !s) {
    return (
      <Screen title={t('gov.title')} back footer={false}>
        <p role="alert">{t('gov.notfound')}</p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => go('gov')}>{t('gov.all')}</button>
        <Footer />
      </Screen>
    );
  }

  if (s) {
    return (
      <Screen title={t('gov.title')} back footer={false}>
        <article className="glass dir-card gov-detail">
          <h1 className="dir-name">{s.name}</h1>
          <p>{s.about}</p>
          <h2 className="gov-h">{t('gov.authority')}</h2>
          <p>{s.authority}</p>
          <h2 className="gov-h">{t('gov.eligibility')}</h2>
          {s.eligibility.length ? <ul className="gov-list">{s.eligibility.map((x) => <li key={x}>{x}</li>)}</ul> : <p>{t('gov.check')}</p>}
          <h2 className="gov-h">{t('gov.steps')}</h2>
          {s.steps.length ? <ol className="gov-list">{s.steps.map((x) => <li key={x}>{x}</li>)}</ol> : <p>{t('gov.check')}</p>}
          {s.website && (
            <a className="btn btn-primary btn-block" href={s.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={18} aria-hidden="true" /> {t('gov.visit')}
              <span className="sr-only"> {t('dir.opens_new')}</span>
            </a>
          )}
          <p className="small dir-source">
            {t('dir.source')}: <a href={s.source} target="_blank" rel="noopener noreferrer" dir="ltr">{host(s.source)}</a>
            {' · '}{t('dir.checked')} <span dir="ltr">2026-11-14</span>
          </p>
        </article>
        <button type="button" className="btn btn-secondary btn-block" onClick={() => go('gov')}>{t('gov.all')}</button>
        <Footer />
      </Screen>
    );
  }

  return (
    <Screen title={t('gov.title')} back footer={false}>
      <p className="gov-sub">{t('gov.subtitle')}</p>
      <ul className="gov-items">
        {GOV_SERVICES.map((x) => {
          const Icon = ICONS[x.icon];
          return (
            <li key={x.id}>
              <button type="button" className="glass gov-item" onClick={() => go('gov', x.id)}>
                <Icon aria-hidden="true" className="gov-ic" />
                <span>{x.name}</span>
                <ChevronLeft aria-hidden="true" className="gov-chev" />
              </button>
            </li>
          );
        })}
      </ul>
      <Footer />
    </Screen>
  );
}
