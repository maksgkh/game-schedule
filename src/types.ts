export interface GameEvent {
    id: string;
    name: string;
    time?: string; // "HH:MM" для фиксированных
    interval?: number; // минуты для интервальных
    range?: { start: string; end: string }; // "HH:MM" для диапазонов
    days?: number[]; // 0=вс, 1=пн, ..., 6=сб для еженедельных
    type: 'fixed' | 'interval' | 'range' | 'weekly';
    color: string;
  }
  
  export interface UpcomingEvent {
    event: GameEvent;
    timeUntil: number; // миллисекунды до начала
    displayTime: string; // "через 41 мин"
  }