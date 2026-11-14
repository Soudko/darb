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

export function speak(text: string, lang: 'ar' | 'en', onEnd?: () => void): void {
  if (!canSpeak() || !text.trim()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const parts = pieces(text);
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = lang === 'ar' ? 'ar-SA' : 'en-GB';
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
