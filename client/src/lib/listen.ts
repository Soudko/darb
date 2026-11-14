// Voice input with the browser's own speech recognition, set to Kuwaiti Arabic (ar-KW) or English.
type Rec = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null;
};

function ctor(): (new () => Rec) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export const canListen = (): boolean => typeof window !== 'undefined' && !!ctor();

export type ListenError = 'denied' | 'nothing' | 'failed';
let active: Rec | null = null;

export function stopListening(): void {
  active?.stop();
}

export function startListening(lang: 'ar' | 'en', h: { onText: (t: string) => void; onEnd: (heard: boolean) => void; onError: (e: ListenError) => void }): void {
  const C = ctor();
  if (!C) return h.onError('failed');
  stopListening();
  const r = new C();
  r.lang = lang === 'ar' ? 'ar-KW' : 'en-GB';
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  let heard = false;
  let failed = false;
  r.onresult = (e: any) => {
    const text = Array.from(e.results as ArrayLike<any>).map((x) => x[0].transcript).join(' ').trim();
    if (text) { heard = true; h.onText(text); }
  };
  r.onerror = (e: any) => {
    failed = true;
    h.onError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : e.error === 'no-speech' ? 'nothing' : 'failed');
  };
  r.onend = () => {
    active = null;
    if (!failed && !heard) h.onError('nothing');
    h.onEnd(heard && !failed);
  };
  active = r;
  try { r.start(); } catch { active = null; h.onError('failed'); }
}
