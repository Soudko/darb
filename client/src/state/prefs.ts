// Preferences kept on the phone only (localStorage). Nothing here is sent to the server except
// needs, lang and the device code, which go with assistant questions.
import { useSyncExternalStore } from 'react';
import type { Lang, Need } from '../../../shared/types';

export type TextSize = 'normal' | 'large' | 'larger';
export type Theme = 'dark' | 'light';

export interface Prefs {
  lang: Lang;
  needs: Need[];
  textSize: TextSize;
  theme: Theme;
  highContrast: boolean;
  readAloud: boolean;
  vibration: boolean;
  largeTargets: boolean;
  reducedMotion: boolean;
  simplified: boolean;
  onboarded: boolean;
}

const KEY = 'darb_prefs';
const defaults: Prefs = {
  lang: 'ar',
  needs: [],
  textSize: 'normal',
  theme: 'dark',
  highContrast: false,
  readAloud: false,
  vibration: true,
  largeTargets: false,
  reducedMotion: false,
  simplified: false,
  onboarded: false,
};

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

let current: Prefs = load();
const listeners = new Set<() => void>();

export function getPrefs(): Prefs {
  return current;
}

export function setPrefs(patch: Partial<Prefs>): void {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Private mode or storage blocked: keep the settings for this visit only.
  }
  applyToDocument(current);
  listeners.forEach((fn) => fn());
}

export function subscribePrefs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribePrefs, getPrefs);
}

// Puts the settings on <html> so the CSS can apply them to the whole app.
export function applyToDocument(p: Prefs): void {
  const el = document.documentElement;
  el.lang = p.lang;
  el.dir = p.lang === 'ar' ? 'rtl' : 'ltr';
  el.dataset.theme = p.theme;
  el.dataset.contrast = p.highContrast ? 'high' : 'normal';
  el.dataset.textSize = p.textSize;
  el.dataset.targets = p.largeTargets ? 'large' : 'normal';
  el.dataset.motion = p.reducedMotion ? 'reduced' : 'normal';
  el.dataset.simple = p.simplified ? 'on' : 'off';
}

// A random code made once per browser, sent with AI requests for the rate limit only.
export function deviceId(): string {
  const k = 'darb_device_id';
  try {
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}
