import { RegularEvent, SpecialEvent, UpcomingEvent } from "../types";
import { REGULAR_EVENTS } from "../schedule";

const MSK_OFFSET = 3 * 60;

export function getMoscowTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + MSK_OFFSET * 60000);
}

export function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function formatTimeUntil(ms: number): string {
  if (ms < 0) return "уже идёт";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    const mins = minutes % 60;
    return mins > 0 ? `через ${hours} ч ${mins} мин` : `через ${hours} ч`;
  }
  if (minutes > 0) return `через ${minutes} мин`;
  return "сейчас";
}

// Получить список будущих обычных событий
export function getUpcomingRegular(now: Date): UpcomingEvent[] {
  return REGULAR_EVENTS.map(event => {
    let next = parseTime(event.time, now);
    if (next <= now) {
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

// Проверить, активно ли особое событие СЕЙЧАС
export function isSpecialActive(ev: SpecialEvent, now: Date): {
  active: boolean;
  highlighted: boolean;
  subLabel?: string;
} {
  const today = now.getDay();
  const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Контрабанда — на 30-й минуте
  if (ev.minuteMark !== undefined) {
    const active = now.getMinutes() === ev.minuteMark;
    return { active, highlighted: active };
  }

  // Капты — по дням + время
  if (ev.days) {
    const dayMatch = ev.days.includes(today);
    const timeMatch = ev.timeRange
      ? hm >= ev.timeRange.start && hm < ev.timeRange.end
      : false;
    return { active: dayMatch && timeMatch, highlighted: dayMatch && timeMatch };
  }

  // Остров/Форт — подсобытия по дням
  if (ev.subEvents && ev.timeRange) {
    const inTime = hm >= ev.timeRange.start && hm < ev.timeRange.end;
    if (!inTime) return { active: false, highlighted: false };
    for (const sub of ev.subEvents) {
      if (sub.days.includes(today)) {
        return { active: true, highlighted: true, subLabel: sub.name };
      }
    }
    return { active: false, highlighted: false };
  }

  // Обычный диапазон
  if (ev.timeRange) {
    const active = hm >= ev.timeRange.start && hm < ev.timeRange.end;
    const highlighted = ev.highlightRange
      ? hm >= ev.highlightRange.start && hm < ev.highlightRange.end
      : active;
    return { active, highlighted };
  }

  return { active: false, highlighted: false };
}