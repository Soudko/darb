// What the assistant is doing right now, so the bottom-bar button can show it. Never stored.
import { useSyncExternalStore } from 'react';

export type AiActivity = 'idle' | 'listening' | 'thinking' | 'speaking';
let current: AiActivity = 'idle';
const listeners = new Set<() => void>();

export function setAiActivity(a: AiActivity): void {
  if (a === current) return;
  current = a;
  listeners.forEach((fn) => fn());
}

export function useAiActivity(): AiActivity {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
  );
}
