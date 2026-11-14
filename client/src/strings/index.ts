// The text loader. Every on-screen word comes from here, in Arabic and English.
// Each area owns one file: shell.ts (shell builder), places.ts (places builder), assistant.ts (assistant builder).
// common.ts holds the fixed honesty lines; never change their wording.
import { useSyncExternalStore } from 'react';
import { common } from './common';
import { shell } from './shell';
import { places } from './places';
import { assistant } from './assistant';
import { settings } from './settings';
import type { Lang } from '../../../shared/types';
import { getPrefs, subscribePrefs } from '../state/prefs';

type Dict = Record<string, string>;
const all: Record<Lang, Dict> = {
  ar: { ...common.ar, ...shell.ar, ...places.ar, ...assistant.ar, ...settings.ar },
  en: { ...common.en, ...shell.en, ...places.en, ...assistant.en, ...settings.en },
};

export function t(key: string, lang: Lang = getPrefs().lang): string {
  const text = all[lang][key] ?? all.ar[key];
  if (text === undefined) {
    if (import.meta.env.DEV) console.warn(`Missing text: ${key}`);
    return key;
  }
  return text;
}

// Use inside components so they re-render when the language changes.
export function useT(): (key: string) => string {
  const lang = useSyncExternalStore(subscribePrefs, () => getPrefs().lang);
  return (key: string) => t(key, lang);
}
