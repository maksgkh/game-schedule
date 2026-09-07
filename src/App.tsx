import { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import EventList from "./components/EventList";
import SpecialEvents from "./components/SpecialEvents";
import SettingsModal from "./components/SettingsModal";
import Toast from "./components/Toast";
import { Settings } from "./types";
import { getMoscowTime, parseTime, isSpecialActive, setDevTime, DEV_TIME_OVERRIDE } from "./utils/time";
import { loadSettings, saveSettings } from "./utils/settings";
import { playSound } from "./utils/sounds";
import { REGULAR_EVENTS, SPECIAL_EVENTS } from "./schedule";

export default function App() {
  const [currentTime, setCurrentTime] = useState(getMoscowTime());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const sentRef = useRef<Set<string>>(new Set());

  // Обновление времени
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getMoscowTime()), 1000);
    return () => clearInterval(id);
  }, []);

  // Разрешение на уведомления ОС
  useEffect(() => {
    import("@tauri-apps/plugin-notification").then(({ isPermissionGranted, requestPermission }) => {
      isPermissionGranted().then(granted => {
        if (!granted) requestPermission();
      });
    });
  }, []);

  // ЛОГИКА УВЕДОМЛЕНИЙ
  useEffect(() => {
    const check = async () => {
      const now = getMoscowTime();
      const nowMs = now.getTime();
      const today = now.getDay();

      // 1. Обычные события
      const upcoming = REGULAR_EVENTS.map(ev => {
        let t = parseTime(ev.time, now);
        if (t.getTime() <= nowMs) { t = new Date(t); t.setDate(t.getDate() + 1); }
        return { ev, diff: t.getTime() - nowMs, target: t };
      }).sort((a, b) => a.diff - b.diff);

      for (const { ev, diff, target } of upcoming) {
        const cfg = settings[ev.category];
        if (!cfg?.enabled) continue;
        const windowMs = cfg.minutesBeforeStart * 60 * 1000;
        if (diff > 0 && diff <= windowMs) {
          const key = `reg_${ev.id}_${target.toISOString().slice(0, 16)}`;
          if (!sentRef.current.has(key)) {
            sentRef.current.add(key);
            triggerAlert(ev.name, `Через ${Math.round(diff / 60000)} мин`, cfg);
          }
        }
      }

      // 2. Особые события
      SPECIAL_EVENTS.forEach(ev => {
        const cfg = settings[ev.id];
        if (!cfg?.enabled) return;
        const state = isSpecialActive(ev, now);
        let dayOk = true;
        if (ev.days && !ev.days.includes(today)) dayOk = false;
        if (ev.subEvents && !ev.subEvents.some(s => s.days.includes(today))) dayOk = false;
        if (ev.timeRange && dayOk) {
          const startT = parseTime(ev.timeRange.start, now);
          let sTarget = startT.getTime() <= nowMs ? new Date(startT.getTime() + 86400000) : startT;
          const diffStart = sTarget.getTime() - nowMs;
          if (diffStart > 0 && diffStart <= cfg.minutesBeforeStart * 60 * 1000) {
            const key = `sp_start_${ev.id}_${sTarget.toISOString().slice(0, 10)}`;
            if (!sentRef.current.has(key)) {
              sentRef.current.add(key);
              const subText = state.activeSubName ? ` (${state.activeSubName})` : "";
              triggerAlert(`${ev.name}${subText}`, `Начало через ${Math.round(diffStart / 60000)} мин`, cfg);
            }
          }
          if (cfg.minutesBeforeEnd > 0) {
            const endT = parseTime(ev.timeRange.end, now);
            const diffEnd = endT.getTime() - nowMs;
            if (diffEnd > 0 && diffEnd <= cfg.minutesBeforeEnd * 60 * 1000) {
              const key = `sp_end_${ev.id}_${endT.toISOString().slice(0, 10)}`;
              if (!sentRef.current.has(key)) {
                sentRef.current.add(key);
                triggerAlert(`${ev.name} (Конец)`, `Осталось ${Math.round(diffEnd / 60000)} мин`, cfg);
              }
            }
          }
        }
      });
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, [settings]);

  function triggerAlert(title: string, body: string, cfg: Settings[keyof Settings]) {
    setToast({ title, message: body });
    playSound(cfg.sound, (cfg as any).customSoundData);
    import("@tauri-apps/plugin-notification").then(({ sendNotification }) => {
      sendNotification({ title: "Расписание", body: `${title} - ${body}` });
    }).catch(err => console.error("Ошибка загрузки плагина уведомлений:", err));
  }

  // Управление режимом оверлея
  const toggleOverlay = async () => {
    const win = getCurrentWindow();
    if (!isOverlayMode) {
      await win.setAlwaysOnTop(true);
      await win.setDecorations(false);
      setIsOverlayMode(true);
    } else {
      await win.setAlwaysOnTop(false);
      await win.setDecorations(true);
      setIsOverlayMode(false);
    }
  };

  // Вычисление ближайшего события для оверлея
  const upcoming = REGULAR_EVENTS.map(ev => {
    let t = parseTime(ev.time, currentTime);
    if (t.getTime() <= currentTime.getTime()) { t = new Date(t); t.setDate(t.getDate() + 1); }
    return { ev, diff: t.getTime() - currentTime.getTime(), target: t };
  }).sort((a, b) => a.diff - b.diff)[0];

  const specialState = SPECIAL_EVENTS.map(ev => ({ ev, state: isSpecialActive(ev, currentTime) }))
    .filter(x => x.state.active || x.state.highlighted)[0];

  const isImminent = upcoming && upcoming.diff <= 15 * 60 * 1000;
  const overlayOpacity = isOverlayMode ? (isImminent || specialState ? 1 : 0.15) : 1;

  const formatTime = (d: Date) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className={`app ${isOverlayMode ? "overlay-mode" : ""}`} style={{ opacity: overlayOpacity }}>
      {isOverlayMode && (
        <button className="exit-overlay-btn" onClick={toggleOverlay} title="Выйти из режима оверлея">✕</button>
      )}

      <div className="topbar">
        <h1>🎮 Расписание</h1>
        <div className="topbar-right">
          {DEV_TIME_OVERRIDE && <span className="dev-badge">DEV MODE</span>}
          <div className="clock">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)} · МСК</div>
          </div>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Настройки">⚙</button>
          <button className={`icon-btn ${isOverlayMode ? "active" : ""}`} onClick={toggleOverlay} title="Режим оверлея (поверх игры)">
            {isOverlayMode ? "🖥️" : "👁️"}
          </button>
        </div>
      </div>

      <div className="dev-controls">
        <label>Тест времени: </label>
        <input 
          type="datetime-local" 
          onChange={(e) => setDevTime(e.target.value ? new Date(e.target.value) : null)} 
        />
        <button className="btn small" onClick={() => setDevTime(null)}>Сброс</button>
      </div>

      <div className="section-title">Особые события</div>
      <SpecialEvents />

      <div className="section-title">Ближайшие</div>
      <EventList />

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => { saveSettings(s); setSettings(s); sentRef.current.clear(); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}