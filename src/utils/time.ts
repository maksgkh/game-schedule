import { RegularEvent, SpecialEvent, UpcomingEvent } from "../types";
import { REGULAR_EVENTS } from "../schedule";

const MSK_OFFSET = 3 * 60;

// Смещение в миллисекундах для режима разработчика
export let DEV_TIME_OFFSET = 0;

export function setDevTime(date: Date | null) {
  if (date) {
    // Вычисляем разницу между выбранным временем и текущим реальным
    DEV_TIME_OFFSET = date.getTime() - new Date().getTime();
  } else {
    DEV_TIME_OFFSET = 0;
  }
}

export function getMoscowTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + MSK_OFFSET * 60000 + DEV_TIME_OFFSET);
}

export function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function formatTimeUntil(ms: number): string {
  if (ms < 0) return "сейчас";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  }
  if (minutes > 0) return `${minutes} мин`;
  return "менее мин";
}

export function getUpcomingRegular(now: Date): UpcomingEvent[] {
  return REGULAR_EVENTS.map(event => {
    let next = parseTime(event.time, now);
    if (next.getTime() <= now.getTime()) {
      next = new Date(next);
      next.setDate(next.getDate() + 1);
    }
    return {
      event,
      timeUntil: next.getTime() - now.getTime(),
      displayTime: formatTimeUntil(next.getTime() - now.getTime()),
    };
  }).sort((a, b) => a.timeUntil - b.timeUntil);
}

export function isSpecialActive(ev: SpecialEvent, now: Date) {
  const today = now.getDay();
  const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
  let active = false;
  let highlighted = false;
  let activeSubName = "";

  if (ev.timeRange) {
    const inTime = hm >= ev.timeRange.start && hm < ev.timeRange.end;
    const inHighlight = ev.highlightRange ? (hm >= ev.highlightRange.start && hm < ev.highlightRange.end) : false;
    
    if (ev.days) {
      active = ev.days.includes(today) && inTime;
      highlighted = active && inHighlight;
    } else if (ev.subEvents) {
      const todaySub = ev.subEvents.find(s => s.days.includes(today));
      if (todaySub && inTime) {
        active = true;
        highlighted = inHighlight;
        activeSubName = todaySub.name;
      }
    } else {
      active = inTime;
      highlighted = inHighlight;
    }
  }

  return { active, highlighted, activeSubName };
}