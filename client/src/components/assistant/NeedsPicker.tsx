import { NEEDS, type Need } from '../../../../shared/types';
import { setPrefs, usePrefs } from '../../state/prefs';
import { useT } from '../../strings';

export function NeedsPicker() {
  const t = useT();
  const { needs } = usePrefs();
  const toggle = (n: Need) =>
    setPrefs({ needs: needs.includes(n) ? needs.filter((x) => x !== n) : [...needs, n] });
  return (
    <section className="glass as-needs" aria-labelledby="as-needs-h">
      <h2 id="as-needs-h" className="as-h">{t('assistant.needs_label')}</h2>
      <p className="small">{t('assistant.needs_hint')}</p>
      <div className="as-chips">
        {NEEDS.map((n) => (
          <button key={n} type="button" className="chip as-chip" aria-pressed={needs.includes(n)} onClick={() => toggle(n)}>
            {t(`need.${n}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
