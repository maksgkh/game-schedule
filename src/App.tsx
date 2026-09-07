import { useState, useEffect } from "react";
import EventList from "./components/Eventlist";
import { SCHEDULE } from "./schedule";
import { getMoscowTime } from "./utils/time";

// ИСПРАВЛЕННЫЙ ИМПОРТ ДЛЯ TAURI V2:
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
export default function App() {
  const [currentTime, setCurrentTime] = useState(getMoscowTime());

  // Обновление времени каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getMoscowTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Проверка уведомлений
  useEffect(() => {
    const checkNotifications = async () => {
      let granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }
      if (!granted) return;

      const now = getMoscowTime();
      
      SCHEDULE.forEach(event => {
        if (event.type !== "fixed" || !event.time) return;
        
        const [h, m] = event.time.split(":").map(Number);
        const eventTime = new Date(now);
        eventTime.setHours(h, m, 0, 0);
        
        const diff = eventTime.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        // Уведомление за 5 минут
        if (diff > 0 && diff <= fiveMinutes) {
          const notifiedKey = `notified_${event.id}_${eventTime.toISOString()}`;
          if (!localStorage.getItem(notifiedKey)) {
            sendNotification({
              title: "Событие скоро начнётся",
              body: `${event.name} — через 5 минут`,
            });
            localStorage.setItem(notifiedKey, "true");
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000);
    checkNotifications();
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="app">
      <header>
        <h1>🎮 Игровое Расписание</h1>
        <div className="clock">
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)}</div>
          <div className="timezone">МСК</div>
        </div>
      </header>

      <EventList events={SCHEDULE} />
    </div>
  );
}