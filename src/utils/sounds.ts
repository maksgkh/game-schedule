// Генерация звуков без внешних файлов через Web Audio API
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playSound(name: string) {
  switch (name) {
    case "beep":
      playTone(880, 0.15, "sine", 0.3);
      setTimeout(() => playTone(880, 0.15, "sine", 0.3), 200);
      break;
    case "chime":
      playTone(660, 0.3, "sine", 0.25);
      setTimeout(() => playTone(880, 0.4, "sine", 0.25), 150);
      break;
    case "alert":
      playTone(440, 0.2, "square", 0.2);
      setTimeout(() => playTone(440, 0.2, "square", 0.2), 250);
      setTimeout(() => playTone(440, 0.2, "square", 0.2), 500);
      break;
    case "none":
    default:
      break;
  }
}

export const SOUND_OPTIONS = [
  { id: "beep", name: "🔔 Бип (двойной)" },
  { id: "chime", name: "🎵 Перелив" },
  { id: "alert", name: "🚨 Тревога" },
  { id: "none", name: "🔇 Без звука" },
] as const;