let audioContext: AudioContext | undefined;

function getContext(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export function playTone(frequency: number, durationMs: number, volume = 0.04): void {
  const context = getContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + durationMs / 1000);
}

export function playStep(): void {
  playTone(220, 40, 0.02);
}

export function playRestore(): void {
  playTone(392, 120, 0.05);
  window.setTimeout(() => playTone(523, 180, 0.04), 90);
}

export function playChapter(chapter: number): void {
  const base = 261 + chapter * 28;
  playTone(base, 200, 0.05);
  window.setTimeout(() => playTone(base * 1.25, 260, 0.04), 120);
}

export function playHarpNote(frequency: number): void {
  playTone(frequency, 180, 0.06);
  window.setTimeout(() => playTone(frequency * 1.25, 140, 0.04), 100);
}

export function playVictory(): void {
  playTone(330, 160, 0.05);
  window.setTimeout(() => playTone(392, 160, 0.05), 120);
  window.setTimeout(() => playTone(523, 240, 0.05), 260);
}
