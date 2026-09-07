// МСК = UTC+3
const MSK_OFFSET = 3 * 60; // в минутах

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

export function isTimeInRange(time: Date, start: string, end: string): boolean {
  const startTime = parseTime(start, time);
  const endTime = parseTime(end, time);
  return time >= startTime && time < endTime;
}

export function getNextOccurrence(
  event: GameEvent,
  now: Date
): Date | null {
  if (event.type === "fixed" && event.time) {
    let next = parseTime(event.time, now);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (event.type === "interval" && event.interval) {
    const nextMinutes = Math.ceil((now.getMinutes() + 1) / event.interval) * event.interval;
    const next = new Date(now);
    
    if (nextMinutes >= 60) {
      next.setHours(next.getHours() + 1, nextMinutes - 60, 0, 0);
    } else {
      next.setMinutes(nextMinutes, 0, 0);
    }
    
    return next;
  }

  if (event.type === "range" && event.range) {
    if (isTimeInRange(now, event.range.start, event.range.end)) {
      return now; // уже идёт
    }
    
    const startTime = parseTime(event.range.start, now);
    if (startTime > now) return startTime;
    
    // Завтра
    startTime.setDate(startTime.getDate() + 1);
    return startTime;
  }

  if (event.type === "weekly" && event.range && event.days) {
    const today = now.getDay();
    
    // Проверяем, идёт ли сейчас
    if (event.days.includes(today) && isTimeInRange(now, event.range.start, event.range.end)) {
      return now;
    }
    
    // Ищем ближайший день
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      const checkDay = checkDate.getDay();
      
      if (event.days.includes(checkDay)) {
        const startTime = parseTime(event.range.start, checkDate);
        if (startTime > now) return startTime;
      }
    }
  }

  return null;
}