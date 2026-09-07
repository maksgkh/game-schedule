import { Settings, NotificationConfig } from "../types";

const KEY = "game_schedule_settings";

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  minutesBeforeStart: 5,
  minutesBeforeEnd: 5,
  sound: "beep",
};

export const DEFAULT_SETTINGS: Settings = {
  regular: { ...DEFAULT_CONFIG },
  gov: { ...DEFAULT_CONFIG, minutesBeforeStart: 10, sound: "chime" },
  smuggle: { ...DEFAULT_CONFIG, minutesBeforeStart: 2, sound: "beep" },
  island: { ...DEFAULT_CONFIG, minutesBeforeStart: 15, minutesBeforeEnd: 5, sound: "alert" },
  captures: { ...DEFAULT_CONFIG, minutesBeforeStart: 10, minutesBeforeEnd: 5, sound: "alert" },
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Дополняем дефолтами, если каких-то полей нет
    return {
      regular: { ...DEFAULT_CONFIG, ...parsed.regular },
      gov: { ...DEFAULT_CONFIG, ...parsed.gov },
      smuggle: { ...DEFAULT_CONFIG, ...parsed.smuggle },
      island: { ...DEFAULT_CONFIG, ...parsed.island },
      captures: { ...DEFAULT_CONFIG, ...parsed.captures },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}