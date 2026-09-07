export interface RegularEvent {
  id: string;
  name: string;
  time: string;
  color: string;
}

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  color: string;
  timeRange?: { start: string; end: string };
  days?: number[];
  minuteMark?: number;
  highlightRange?: { start: string; end: string };
  subEvents?: { name: string; days: number[] }[];
}

export interface UpcomingEvent {
  event: RegularEvent;
  timeUntil: number;
  displayTime: string;
}

// Настройки уведомлений для одного типа
export interface NotificationConfig {
  enabled: boolean;
  minutesBeforeStart: number;
  minutesBeforeEnd: number; // для событий с концом
  sound: "beep" | "chime" | "alert" | "none";
}

export interface Settings {
  regular: NotificationConfig;   // Тайники, Дроп, Дилеры, Цеха
  gov: NotificationConfig;       // Поставки гос.организаций
  smuggle: NotificationConfig;   // Контрабанда
  island: NotificationConfig;    // Остров/Форт
  captures: NotificationConfig;  // Капты
}

export type SettingsKey = keyof Settings;