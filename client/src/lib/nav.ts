// A small screen router kept in the URL hash, so Back works and links can be shared.
// Screens: splash, onboarding, needs, home, map, place/<id>, assistant, settings, alerts, coming/<name>, about
import { useSyncExternalStore } from 'react';

export interface Route {
  screen: string;
  param?: string;
  query: URLSearchParams;
}

function parse(): Route {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const [screen, param] = path.split('/');
  return { screen: screen || '', param: param ? decodeURIComponent(param) : undefined, query: new URLSearchParams(qs) };
}

let route = parse();
const listeners = new Set<() => void>();
window.addEventListener('hashchange', () => {
  route = parse();
  listeners.forEach((fn) => fn());
  window.scrollTo(0, 0);
});

export function useRoute(): Route {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => route,
  );
}

// go('place', 'avenues')  →  #/place/avenues ;  go('map', undefined, { focus: 'avenues' })
export function go(screen: string, param?: string, query?: Record<string, string>): void {
  const qs = query ? '?' + new URLSearchParams(query).toString() : '';
  location.hash = `/${screen}${param ? '/' + encodeURIComponent(param) : ''}${qs}`;
}

export function back(): void {
  if (history.length > 1) history.back();
  else go('home');
}
