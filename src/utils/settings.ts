import { Settings } from "../types";

const KEY = "game_schedule_settings";

const DEFAULT_NOTIFICATION_CONFIG = {
  enabled: true,
  minutesBeforeStart: 5,
  minutesBeforeEnd: 5,
  sound: "soft_chime" as const,
};

const DEFAULT_OVERLAY_CONFIG = {
  enabled: true,
  showInOverlay: true,
  minutesBeforeShow: 5,
};

export const DEFAULT_SETTINGS: Settings = {
  drop: { ...DEFAULT_NOTIFICATION_CONFIG, ...DEFAULT_OVERLAY_CONFIG },
  workshop: { ...DEFAULT_NOTIFICATION_CONFIG, ...DEFAULT_OVERLAY_CONFIG },
  dealer: { ...DEFAULT_NOTIFICATION_CONFIG, ...DEFAULT_OVERLAY_CONFIG },
  contraband: { ...DEFAULT_NOTIFICATION_CONFIG, ...DEFAULT_OVERLAY_CONFIG },
  gov: { ...DEFAULT_NOTIFICATION_CONFIG, minutesBeforeStart: 10, ...DEFAULT_OVERLAY_CONFIG },
  island: { ...DEFAULT_NOTIFICATION_CONFIG, minutesBeforeStart: 15, minutesBeforeEnd: 5, ...DEFAULT_OVERLAY_CONFIG },
  captures: { ...DEFAULT_NOTIFICATION_CONFIG, minutesBeforeStart: 10, minutesBeforeEnd: 5, ...DEFAULT_OVERLAY_CONFIG },
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    
    return {
      drop: { ...DEFAULT_SETTINGS.drop, ...parsed.drop },
      workshop: { ...DEFAULT_SETTINGS.workshop, ...parsed.workshop },
      dealer: { ...DEFAULT_SETTINGS.dealer, ...parsed.dealer },
      contraband: { ...DEFAULT_SETTINGS.contraband, ...parsed.contraband },
      gov: { ...DEFAULT_SETTINGS.gov, ...parsed.gov },
      island: { ...DEFAULT_SETTINGS.island, ...parsed.island },
      captures: { ...DEFAULT_SETTINGS.captures, ...parsed.captures },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}