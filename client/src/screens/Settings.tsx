import { Type, Sun, Contrast, Volume2, Vibrate, Globe, Users, Info, ChevronLeft, ChevronRight, Hand, Pause, LayoutList } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePrefs, setPrefs } from '../state/prefs';
import type { TextSize, Theme } from '../state/prefs';
import { useT } from '../strings';
import { Screen } from '../components/Screen';
import '../styles/shell.css';

function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} className="sh-switch" onClick={() => onChange(!on)} />;
}
function Label({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className="sh-setting-label" aria-hidden="false">{icon}<span>{children}</span></span>;
}

export function Settings(_props: {}) {
  const p = usePrefs();
  const t = useT();
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  const sizes: TextSize[] = ['normal', 'large', 'larger'];
  const themes: Theme[] = ['dark', 'light'];
  const Chev = p.lang === 'ar' ? ChevronLeft : ChevronRight;
  return (
    <Screen title={t('settings.title')}>
      <section className="glass sh-setting">
        <Label icon={<Type aria-hidden="true" />}>{t('settings.text_size')}</Label>
        <div className="sh-chips">
          {sizes.map((s) => <button key={s} type="button" className="chip" aria-pressed={p.textSize === s} onClick={() => setPrefs({ textSize: s })}>{t('settings.size.' + s)}</button>)}
        </div>
      </section>
      <section className="glass sh-setting">
        <Label icon={<Sun aria-hidden="true" />}>{t('settings.display')}</Label>
        <div className="sh-chips">
          {themes.map((m) => <button key={m} type="button" className="chip" aria-pressed={p.theme === m} onClick={() => setPrefs({ theme: m })}>{t('settings.' + m)}</button>)}
        </div>
      </section>
      <section className="glass sh-setting">
        <div className="sh-setting-row">
          <Label icon={<Contrast aria-hidden="true" />}>{t('settings.contrast')}</Label>
          <Switch on={p.highContrast} label={t('settings.contrast')} onChange={(v) => setPrefs({ highContrast: v })} />
        </div>
        <div className="sh-setting-row">
          <Label icon={<Volume2 aria-hidden="true" />}>{t('settings.read_aloud')}</Label>
          <Switch on={p.readAloud} label={t('settings.read_aloud')} onChange={(v) => setPrefs({ readAloud: v })} />
        </div>
        <div className="sh-setting-row">
          <Label icon={<Vibrate aria-hidden="true" />}>{t('settings.vibration')}</Label>
          <Switch on={p.vibration && canVibrate} disabled={!canVibrate} label={t('settings.vibration')} onChange={(v) => setPrefs({ vibration: v })} />
        </div>
        {!canVibrate && <p className="small">{t('settings.no_vibrate')}</p>}
      </section>
      <section className="glass sh-setting" aria-label={t('settings2.interaction')}>
        <div className="sh-setting-row">
          <Label icon={<Hand aria-hidden="true" />}>{t('settings2.large_targets')}</Label>
          <Switch on={p.largeTargets} label={t('settings2.large_targets')} onChange={(v) => setPrefs({ largeTargets: v })} />
        </div>
        <div className="sh-setting-row">
          <Label icon={<Pause aria-hidden="true" />}>{t('settings2.reduced_motion')}</Label>
          <Switch on={p.reducedMotion} label={t('settings2.reduced_motion')} onChange={(v) => setPrefs({ reducedMotion: v })} />
        </div>
        <div className="sh-setting-row">
          <Label icon={<LayoutList aria-hidden="true" />}>{t('settings2.simplified')}</Label>
          <Switch on={p.simplified} label={t('settings2.simplified')} onChange={(v) => setPrefs({ simplified: v })} />
        </div>
        <p className="small">{t('settings2.simplified_hint')}</p>
      </section>
      <section className="glass sh-setting">
        <Label icon={<Globe aria-hidden="true" />}>{t('settings.language')}</Label>
        <div className="sh-chips">
          <button type="button" className="chip" aria-pressed={p.lang === 'ar'} onClick={() => setPrefs({ lang: 'ar' })}>العربية</button>
          <button type="button" className="chip" aria-pressed={p.lang === 'en'} onClick={() => setPrefs({ lang: 'en' })}>English</button>
        </div>
      </section>
      <section className="glass">
        <a className="sh-linkrow" href="#/needs"><Label icon={<Users aria-hidden="true" />}>{t('settings.needs')}</Label><Chev aria-hidden="true" /></a>
        <a className="sh-linkrow" href="#/about"><Label icon={<Info aria-hidden="true" />}>{t('settings.about')}</Label><Chev aria-hidden="true" /></a>
      </section>
      <p className="small">{t('settings2.profile_note')}</p>
    </Screen>
  );
}
