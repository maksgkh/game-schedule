export interface NotificationConfig {
  enabled: boolean;
  minutesBeforeStart: number;
  minutesBeforeEnd: number;
  sound: "soft_chime" | "gentle_bell" | "warm_ping" | "custom";
  customSoundData?: string;
}

export interface OverlayConfig {
  showInOverlay: boolean;
  minutesBeforeShow: number;
}

export interface Settings {
  drop: NotificationConfig & OverlayConfig;
  stash: NotificationConfig & OverlayConfig;
  workshop: NotificationConfig & OverlayConfig;
  dealer: NotificationConfig & OverlayConfig;
  contraband: NotificationConfig & OverlayConfig;
  gov: NotificationConfig & OverlayConfig;
  island: NotificationConfig & OverlayConfig;
  captures: NotificationConfig & OverlayConfig;
}

export type SettingsKey = keyof Settings;

export interface UiSettings {
  hotkey: string;
  overlayOpacity: number;   // 0.2 .. 1
  autoHide: boolean;        // "Скрывать автоматически"
  imminentMinutes: number;  // за сколько минут показывать
  overlayPos: { x: number; y: number } | null;
}

export interface RegularEvent {
  id: string;
  name: string;
  time: string;
  color: string;
  category: "drop" | "stash" | "workshop" | "dealer" | "contraband";
}

export interface SpecialEvent {
  id: "gov" | "island" | "captures";
  name: string;
  description: string;
  color: string;
  timeRange?: { start: string; end: string };
  days?: number[];
  subEvents?: { name: string; days: number[] }[];
  highlightRange?: { start: string; end: string };
}

export interface UpcomingEvent {
  event: RegularEvent;
  timeUntil: number;
  displayTime: string;
}