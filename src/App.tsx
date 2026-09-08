import { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import EventList from "./components/EventList";
import SpecialEvents from "./components/SpecialEvents";
import SettingsModal from "./components/SettingsModal";
import Toast from "./components/Toast";
import { Settings, UiSettings } from "./types";
import { getMoscowTime, parseTime, isSpecialActive, formatTimeUntil } from "./utils/time";
import { loadSettings, saveSettings, loadUiSettings, saveUiSettings } from "./utils/settings";
import { playSound } from "./utils/sounds";
import { REGULAR_EVENTS, SPECIAL_EVENTS } from "./schedule";

function getClosestEvent(now: Date) {
  const nowMs = now.getTime();
  let closest = { name: "", diff: Infinity, color: "#fff" };

  for (const ev of REGULAR_EVENTS) {
    let t = parseTime(ev.time, now);
    if (t.getTime() <= nowMs) { t = new Date(t); t.setDate(t.getDate() + 1); }
    const diff = t.getTime() - nowMs;
    if (diff < closest.diff) closest = { name: ev.name, diff, color: ev.color };
  }

  for (const ev of SPECIAL_EVENTS) {
    const state = isSpecialActive(ev, now);
    if (state.active || !ev.timeRange) continue;
    const today = now.getDay();
    let dayOk = true;
    if (ev.days && !ev.days.includes(today)) dayOk = false;
    if (ev.subEvents && !ev.subEvents.some(s => s.days.includes(today))) dayOk = false;
    if (!dayOk) continue;
    const startT = parseTime(ev.timeRange.start, now);
    const sTarget = startT.getTime() <= nowMs ? new Date(startT.getTime() + 86400000) : startT;
    const diff = sTarget.getTime() - nowMs;
    if (diff > 0 && diff < closest.diff) closest = { name: ev.name, diff, color: ev.color };
  }
  return closest;
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(getMoscowTime());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [ui, setUi] = useState<UiSettings>(loadUiSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const sentRef = useRef<Set<string>>(new Set());
  const peekUntilRef = useRef(0);
  const overlayRef = useRef(false);
  overlayRef.current = isOverlayMode;

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getMoscowTime()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { saveUiSettings(ui); }, [ui]);

  useEffect(() => {
    import("@tauri-apps/plugin-notification").then(({ isPermissionGranted, requestPermission }) => {
      isPermissionGranted().then(g => { if (!g) requestPermission(); });
    });
  }, []);

  // ===== ОВЕРЛЕЙ: вход / выход =====
  const enterOverlay = async () => {
    const win = getCurrentWindow();
    try { await win.setDecorations(false); } catch (e) { console.warn(e); }
    try { await win.setSize(new LogicalSize(320, 84)); } catch (e) { console.warn(e); }
    if (ui.overlayPos) {
      try { await win.setPosition(new PhysicalPosition(ui.overlayPos.x, ui.overlayPos.y)); } catch (e) { console.warn(e); }
    }
    try { await win.setAlwaysOnTop(true); } catch (e) { console.warn(e); } // ПОСЛЕДЕМ — иначе Windows сбросит TOPMOST
    try { await win.show(); } catch (e) { console.warn(e); }
    setIsOverlayMode(true);
  };

  const exitOverlay = async () => {
    const win = getCurrentWindow();
    try { await win.setAlwaysOnTop(false); } catch (e) { console.warn(e); }
    try { await win.setDecorations(true); } catch (e) { console.warn(e); }
    try { await win.setSize(new LogicalSize(380, 650)); } catch (e) { console.warn(e); }
    try { await win.show(); } catch (e) { console.warn(e); }
    setIsOverlayMode(false);
  };

  const toggleOverlay = async () => {
    if (overlayRef.current) await exitOverlay();
    else await enterOverlay();
  };

  // Хоткей: войти / peek / выйти
  const hotkeyHandler = async () => {
    const win = getCurrentWindow();
    if (!overlayRef.current) { await enterOverlay(); return; }
    const visible = await win.isVisible().catch(() => true);
    if (!visible) {
      peekUntilRef.current = Date.now() + 10000;
      await win.show().catch(() => {});
    } else {
      await exitOverlay();
    }
  };
  const hotkeyRef = useRef(hotkeyHandler);
  hotkeyRef.current = hotkeyHandler;

  // Регистрация глобальной горячей клавиши
  useEffect(() => {
    unregisterAll().catch(() => {});
    register(ui.hotkey, () => { hotkeyRef.current(); })
      .catch(err => console.error("Не удалось зарегистрировать хоткей:", err));
    return () => { unregisterAll().catch(() => {}); };
  }, [ui.hotkey]);

  // Кнопка трея "Мини-оверлей"
  useEffect(() => {
    const un = listen("toggle-overlay", () => { toggleOverlay(); });
    return () => { un.then(f => f()); };
  }, []);

  // Держим TOPMOST (поверх игры и любых окон)
  useEffect(() => {
    if (!isOverlayMode) return;
    const id = setInterval(() => {
      getCurrentWindow().setAlwaysOnTop(true).catch(() => {});
    }, 2000);
    return () => clearInterval(id);
  }, [isOverlayMode]);

  // Автоскрытие: прячем окно, когда до события далеко
  useEffect(() => {
    if (!isOverlayMode) return;
    const win = getCurrentWindow();
    if (!ui.autoHide) { win.show().catch(() => {}); return; }
    const closest = getClosestEvent(currentTime);
    const imminent = closest.diff <= ui.imminentMinutes * 60000;
    const peek = Date.now() < peekUntilRef.current;
    if (imminent || peek) win.show().catch(() => {});
    else win.hide().catch(() => {});
  }, [currentTime, isOverlayMode, ui.autoHide, ui.imminentMinutes]);

  // Запоминаем позицию оверлея
  useEffect(() => {
    if (!isOverlayMode) return;
    const win = getCurrentWindow();
    let t: any = null;
    const un = listen("tauri://moved", () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        try {
          const p = await win.innerPosition();
          setUi(u => ({ ...u, overlayPos: { x: p.x, y: p.y } }));
        } catch {}
      }, 400);
    });
    return () => { un.then(f => f()); clearTimeout(t); };
  }, [isOverlayMode]);

  // ===== УВЕДОМЛЕНИЯ =====
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
        if (diff > 0 && diff <= cfg.minutesBeforeStart * 60 * 1000) {
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
          const sTarget = startT.getTime() <= nowMs ? new Date(startT.getTime() + 86400000) : startT;
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
    }).catch(err => console.error("Ошибка уведомлений:", err));
  }

  const formatTime = (d: Date) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });

  // ===== МИНИ-ОВЕРЛЕЙ =====
  if (isOverlayMode) {
    const closest = getClosestEvent(currentTime);
    const imminent = closest.diff <= ui.imminentMinutes * 60000;
    const opacity = ui.overlayOpacity * (imminent ? 1 : 0.35);
    return (
      <div className="app overlay-widget" style={{ opacity }}>
        <button className="exit-overlay-btn" onClick={exitOverlay} title="Выйти из оверлея">✕</button>
        {closest.diff < Infinity && (
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
          <button className="icon-btn" onClick={enterOverlay} title="Мини-оверлей поверх игры">👁️</button>
        </div>
      </div>

      <div className="section-title">Особые события</div>
      <SpecialEvents />

      <div className="section-title">Ближайшие</div>
      <EventList />

      {showSettings && (
        <SettingsModal
          settings={settings}
          ui={ui}
          onSave={(s, u) => { saveSettings(s); setSettings(s); saveUiSettings(u); setUi(u); sentRef.current.clear(); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}