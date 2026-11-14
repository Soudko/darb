// Reading answers aloud with the phone's own voice (Web Speech API). Nothing leaves the phone.
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

// Short pieces: some browsers stop a single long utterance after about 15 seconds.
function pieces(text: string): string[] {
  return text
    .split(/(?<=[.!?؟。\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Best Arabic voice on the phone: Kuwaiti first, then any Arabic one. Browsers rarely ship a Kuwaiti voice,
// so usually the Kuwaiti wording is read by a general Arabic voice.
function arabicVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const ar = voices.filter((v) => /^ar/i.test(v.lang));
  return ar.find((v) => /^ar[-_]KW/i.test(v.lang)) ?? ar.find((v) => /^ar[-_](SA|AE|QA|BH)/i.test(v.lang)) ?? ar[0];
}

export function speak(text: string, lang: 'ar' | 'en', onEnd?: () => void): void {
  if (!canSpeak() || !text.trim()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const parts = pieces(text);
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = lang === 'ar' ? 'ar-KW' : 'en-GB';
      if (lang === 'ar') {
        const v = arabicVoice();
        if (v) { u.voice = v; u.lang = v.lang; }
      }
      u.rate = 0.95;
      if (i === parts.length - 1 && onEnd) {
        u.onend = onEnd;
        u.onerror = onEnd;
      }
      synth.speak(u);
    });
  } catch {
    onEnd?.();
  }
}

// iPhone Safari only allows speech that starts from a tap: call this inside the tap.
export function unlockSpeech(): void {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  } catch {
    // nothing to do: the Listen button still works
  }
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
