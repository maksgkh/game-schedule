import { useState, useEffect, useRef } from "react";
import EventList from "./components/EventList";
import SpecialEvents from "./components/SpecialEvents";
import SettingsModal from "./components/SettingsModal";
import { Settings } from "./types";
import { getMoscowTime, parseTime, isSpecialActive } from "./utils/time";
import { loadSettings, saveSettings } from "./utils/settings";
import { playSound } from "./utils/sounds";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { REGULAR_EVENTS, SPECIAL_EVENTS } from "./schedule";

export default function App() {
  const [currentTime, setCurrentTime] = useState(getMoscowTime());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [showSettings, setShowSettings] = useState(false);

  // Ключи уже отправленных уведомлений, чтобы не спамить
  const sentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getMoscowTime()), 1000);
    return () => clearInterval(id);
  }, []);

  // Запрос разрешения на уведомления при старте
  useEffect(() => {
    (async () => {
      let granted = await isPermissionGranted();
      if (!granted) {
        const p = await requestPermission();
        granted = p === "granted";
      }
    })();
  }, []);

  // Основная логика уведомлений
  useEffect(() => {
    const check = async () => {
      const granted = await isPermissionGranted();
      if (!granted) return;

      const now = getMoscowTime();
      const nowMs = now.getTime();

      // 1. Обычные события (Тайники, Дроп, Дилеры, Цеха)
      if (settings.regular.enabled) {
        const windowMs = settings.regular.minutesBeforeStart * 60 * 1000;
        REGULAR_EVENTS.forEach(event => {
          let target = parseTime(event.time, now);
          if (target.getTime() <= nowMs) {
            target = new Date(target);
            target.setDate(target.getDate() + 1);
          }
          const diff = target.getTime() - nowMs;
          if (diff > 0 && diff <= windowMs) {
            const key = `r_${event.id}_${target.toISOString().slice(0, 16)}`;
            if (!sentRef.current.has(key)) {
              sentRef.current.add(key);
              fireNotification(
                "Событие скоро",
                `${event.name} в ${event.time} (через ${Math.round(diff / 60000)} мин)`,
                settings.regular.sound
              );
            }
          }
        });
      }

      // 2. Особые события
      SPECIAL_EVENTS.forEach(ev => {
        const cfgKey = ev.id as keyof Settings;
        const cfg = settings[cfgKey];
        if (!cfg || !cfg.enabled) return;

        const state = isSpecialActive(ev, now);

        // Уведомление ДО НАЧАЛА
        if (ev.timeRange) {
          const startTime = parseTime(ev.timeRange.start, now);
          let startTarget = startTime;
          if (startTarget.getTime() <= nowMs) {
            startTarget = new Date(startTarget);
            startTarget.setDate(startTarget.getDate() + 1);
          }
          const diffStart = startTarget.getTime() - nowMs;
          const windowStart = cfg.minutesBeforeStart * 60 * 1000;

          // Для событий по дням (Капты, Остров/Форт) — проверяем, что сегодня нужный день
          let dayOk = true;
          if (ev.days && !ev.days.includes(now.getDay())) dayOk = false;
          if (ev.subEvents) {
            const anyToday = ev.subEvents.some(s => s.days.includes(now.getDay()));
            if (!anyToday) dayOk = false;
          }

          if (dayOk && diffStart > 0 && diffStart <= windowStart) {
            const key = `s_start_${ev.id}_${startTarget.toISOString().slice(0, 10)}`;
            if (!sentRef.current.has(key)) {
              sentRef.current.add(key);
              fireNotification(
                ev.name,
                `Начало через ${Math.round(diffStart / 60000)} мин`,
                cfg.sound
              );
            }
          }

          // Уведомление ДО КОНЦА
          if (cfg.minutesBeforeEnd > 0) {
            const endTime = parseTime(ev.timeRange.end, now);
            const diffEnd = endTime.getTime() - nowMs;
            const windowEnd = cfg.minutesBeforeEnd * 60 * 1000;
            if (dayOk && diffEnd > 0 && diffEnd <= windowEnd) {
              const key = `s_end_${ev.id}_${endTime.toISOString().slice(0, 10)}`;
              if (!sentRef.current.has(key)) {
                sentRef.current.add(key);
                fireNotification(
                  ev.name,
                  `До конца ${Math.round(diffEnd / 60000)} мин`,
                  cfg.sound
                );
              }
            }
          }
        }

        // Контрабанда — уведомление за N минут до 30-й минуты
        if (ev.minuteMark !== undefined) {
          const nowMin = now.getMinutes();
          const nowSec = now.getSeconds();
          const targetMin = ev.minuteMark;
          let diffMin = targetMin - nowMin;
          if (diffMin < 0) diffMin += 60;
          const diffMs = (diffMin * 60 - nowSec) * 1000;
          const windowMs = cfg.minutesBeforeStart * 60 * 1000;

          if (diffMs > 0 && diffMs <= windowMs) {
            const key = `sm_${now.toISOString().slice(0, 13)}_${targetMin}`;
            if (!sentRef.current.has(key)) {
              sentRef.current.add(key);
              fireNotification(
                "Контрабанда",
                `Через ${Math.round(diffMs / 60000)} мин`,
                cfg.sound
              );
            }
          }
        }
      });
    };

    check();
    const id = setInterval(check, 10000); // проверяем каждые 10 сек
    return () => clearInterval(id);
  }, [settings]);

  function handleSaveSettings(s: Settings) {
    saveSettings(s);
    setSettings(s);
    sentRef.current.clear(); // сбрасываем кэш, чтобы новые настройки сработали
  }

  const formatTime = (d: Date) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="app">
      <div className="topbar">
        <h1>🎮 Расписание</h1>
        <div className="clock">
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)} · МСК</div>
        </div>
        <button className="icon-btn" onClick={() => setShowSettings(true)} title="Настройки">⚙</button>
      </div>

      <div className="section-title">Особые события</div>
      <SpecialEvents />

      <div className="section-title">Ближайшие</div>
      <EventList />

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// Универсальная функция: нативное уведомление + звук
async function fireNotification(title: string, body: string, sound: string) {
  try {
    sendNotification({ title, body });
  } catch (e) {
    console.warn("Notification error:", e);
  }
  playSound(sound);
}