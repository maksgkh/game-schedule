import { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import EventList from "./components/EventList";
import SpecialEvents from "./components/SpecialEvents";
import SettingsModal from "./components/SettingsModal";
import Toast from "./components/Toast";
import { Settings } from "./types";
import { getMoscowTime, parseTime, isSpecialActive, formatTimeUntil } from "./utils/time";
import { loadSettings, saveSettings } from "./utils/settings";
import { playSound } from "./utils/sounds";
import { REGULAR_EVENTS, SPECIAL_EVENTS } from "./schedule";

function getClosestEvent(now: Date) {
  const nowMs = now.getTime();
  let closest = { name: "", diff: Infinity, color: "#fff" };

  for (const ev of REGULAR_EVENTS) {
    let t = parseTime(ev.time, now);
    if (t.getTime() <= nowMs) { t = new Date(t); t.setDate(t.getDate() + 1); }
    const diff = t.getTime() - nowMs;
    if (diff < closest.diff) {
      closest = { name: ev.name, diff, color: ev.color };
    }
  }

  for (const ev of SPECIAL_EVENTS) {
    const state = isSpecialActive(ev, now);
    if (state.active) continue; 
    if (ev.timeRange) {
      const startT = parseTime(ev.timeRange.start, now);
      let sTarget = startT.getTime() <= nowMs ? new Date(startT.getTime() + 86400000) : startT;
      
      let dayOk = true;
      const today = now.getDay();
      if (ev.days && !ev.days.includes(today)) dayOk = false;
      if (ev.subEvents && !ev.subEvents.some(s => s.days.includes(today))) dayOk = false;
      
      if (dayOk) {
        const diff = sTarget.getTime() - nowMs;
        if (diff < closest.diff && diff > 0) {
          closest = { name: ev.name, diff, color: ev.color };
        }
      }
    }
  }
  return closest;
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(getMoscowTime());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const sentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getMoscowTime()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    import("@tauri-apps/plugin-notification").then(({ isPermissionGranted, requestPermission }) => {
      isPermissionGranted().then(granted => {
        if (!granted) requestPermission();
      });
    });
  }, []);

  useEffect(() => {
    const check = async () => {
      const now = getMoscowTime();
      const nowMs = now.getTime();
      const today = now.getDay();

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

  const toggleOverlay = async () => {
    const win = getCurrentWindow();
    if (!isOverlayMode) {
      await win.setAlwaysOnTop(true);
      await win.setDecorations(false);
      try {
        await win.setSize(new LogicalSize(300, 80));
      } catch (e) {
        console.warn("Resize failed", e);
      }
      setIsOverlayMode(true);
    } else {
      await win.setAlwaysOnTop(false);
      await win.setDecorations(true);
      try {
        await win.setSize(new LogicalSize(380, 650));
      } catch (e) {
        console.warn("Resize failed", e);
      }
      setIsOverlayMode(false);
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });

  if (isOverlayMode) {
    const closest = getClosestEvent(currentTime);
    const isImminent = closest && closest.diff <= 15 * 60 * 1000;
    return (
      <div className="app overlay-widget" style={{ opacity: isImminent ? 1 : 0.15 }}>
        <button className="exit-overlay-btn" onClick={toggleOverlay} title="Выйти из режима оверлея">✕</button>
        {closest && closest.diff < Infinity && (
          <div className="overlay-event" style={{ borderLeftColor: closest.color }}>
            <div className="overlay-event-name">{closest.name}</div>
            <div className="overlay-event-countdown">{formatTimeUntil(closest.diff)}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <h1>🎮 Расписание</h1>
        <div className="topbar-right">
          <div className="clock">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)} · МСК</div>
          </div>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Настройки">⚙</button>
          <button className={`icon-btn ${isOverlayMode ? "active" : ""}`} onClick={toggleOverlay} title="Режим оверлея (поверх игры)">
            👁️
          </button>
        </div>
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