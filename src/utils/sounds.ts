// Мягкие встроенные звуки (Base64 Data URI для надежности без внешних файлов)
// Это короткие, приятные звуки (chime, bell, ping)
const SOUNDS: Record<string, string> = {
    soft_chime: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...", // (Укорочено для примера, в реальном коде я дам рабочие короткие base64 или используем Web Audio API для генерации мягких звуков)
  };
  
  // Генератор мягких звуков через Web Audio API (надежнее и не требует длинных base64 строк)
  let audioCtx: AudioContext | null = null;
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  
  function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
  
  export function playSound(soundType: string, customData?: string) {
    if (soundType === "custom" && customData) {
      const audio = new Audio(customData);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      return;
    }
  
    // Мягкие синтезированные звуки
    switch (soundType) {
      case "soft_chime":
        playTone(523.25, 0.4, "sine", 0.15); // C5
        setTimeout(() => playTone(659.25, 0.6, "sine", 0.15), 150); // E5
        break;
      case "gentle_bell":
        playTone(880, 0.8, "triangle", 0.1); // A5
        break;
      case "warm_ping":
        playTone(440, 0.3, "sine", 0.2);
        setTimeout(() => playTone(554.37, 0.4, "sine", 0.2), 100);
        break;
    }
  }
  
  export const SOUND_OPTIONS = [
    { id: "soft_chime", name: "🎵 Мягкий перезвон" },
    { id: "gentle_bell", name: "🔔 Тихий колокольчик" },
    { id: "warm_ping", name: "💧 Теплый пинг" },
    { id: "custom", name: "📁 Свой файл (MP3/WAV)" },
  ];