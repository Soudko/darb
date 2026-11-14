import { Check, X, CircleHelp, MapPin } from 'lucide-react';
import { FACILITY_KEYS, type FacilityKey, type PlaceView } from '../../../../shared/types';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../strings';

// The facts the server checked for one pick, each with its source. Only what the server returned.
export function FactList({ place, facts }: { place: PlaceView; facts: string[] }) {
  const t = useT();
  const { lang } = usePrefs();
  const rows: React.ReactNode[] = [];
  for (const f of [...new Set(facts)]) {
    if ((FACILITY_KEYS as string[]).includes(f)) {
      const fac = place.facilities[f as FacilityKey];
      if (!fac) continue;
      const Icon = fac.available === 'yes' ? Check : fac.available === 'no' ? X : CircleHelp;
      rows.push(
        <li key={f} className="as-fact">
          <Icon size={18} aria-hidden="true" className="as-fact-ic" />
          <div>
            <strong>{t(`fac.${f}`)}: {t(`yn.${fac.available}`)}</strong>
            {fac.count !== undefined && <span> · {t('fac.count')}: {fac.count}</span>}
            <div className="as-fact-src">{t('fac.source')}: {fac.source} · {fac.date}</div>
          </div>
        </li>,
      );
    } else {
      const point = place.points.find((p) => p.id === f);
      if (!point) continue;
      rows.push(
        <li key={f} className="as-fact">
          <MapPin size={18} aria-hidden="true" className="as-fact-ic" />
          <div>
            <strong>{lang === 'ar' ? point.name_ar : point.name_en}</strong>
            {point.accessible && <span> · {t('point.accessible')}</span>}
          </div>
        </li>,
      );
    }
  }
  if (!rows.length) return null;
  return (
    <div className="as-facts">
      <p className="as-facts-h">{t('assistant.facts_label')}</p>
      <ul className="as-fact-list">{rows}</ul>
    </div>
  );
}
