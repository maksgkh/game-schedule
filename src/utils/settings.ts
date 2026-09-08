import { Settings, UiSettings } from "../types";

const KEY = "game_schedule_settings_v2";
const UI_KEY = "game_schedule_ui_v2";

export const DEFAULTS: Settings = {
  drop:       { enabled: true,  minutesBeforeStart: 5,  minutesBeforeEnd: 5,  sound: "soft_chime",  showInOverlay: true, minutesBeforeShow: 5 },
  stash:      { enabled: true,  minutesBeforeStart: 5,  minutesBeforeEnd: 5,  sound: "soft_chime",  showInOverlay: true, minutesBeforeShow: 5 },
  workshop:   { enabled: true,  minutesBeforeStart: 10, minutesBeforeEnd: 5,  sound: "gentle_bell", showInOverlay: true, minutesBeforeShow: 5 },
  dealer:     { enabled: true,  minutesBeforeStart: 5,  minutesBeforeEnd: 5,  sound: "warm_ping",   showInOverlay: true, minutesBeforeShow: 5 },
  contraband: { enabled: false, minutesBeforeStart: 5,  minutesBeforeEnd: 5,  sound: "soft_chime",  showInOverlay: true, minutesBeforeShow: 5 },
  gov:        { enabled: true,  minutesBeforeStart: 10, minutesBeforeEnd: 10, sound: "gentle_bell", showInOverlay: true, minutesBeforeShow: 5 },
  island:     { enabled: true,  minutesBeforeStart: 10, minutesBeforeEnd: 10, sound: "gentle_bell", showInOverlay: true, minutesBeforeShow: 5 },
  captures:   { enabled: true,  minutesBeforeStart: 10, minutesBeforeEnd: 10, sound: "warm_ping",   showInOverlay: true, minutesBeforeShow: 5 },
};

export const UI_DEFAULTS: UiSettings = {
  hotkey: "CommandOrControl+Shift+H",
  overlayOpacity: 0.9,
  autoHide: false,
  imminentMinutes: 15,
  overlayPos: null,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    const out: any = structuredClone(DEFAULTS);
    if (!raw) return out;
    const parsed = JSON.parse(raw);
    for (const k of Object.keys(DEFAULTS) as (keyof Settings)[]) {
      if (parsed[k]) out[k] = { ...DEFAULTS[k], ...parsed[k] };
    }
    return out;
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function loadUiSettings(): UiSettings {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) return { ...UI_DEFAULTS };
    return { ...UI_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...UI_DEFAULTS };
  }
}

export function saveUiSettings(u: UiSettings): void {
  localStorage.setItem(UI_KEY, JSON.stringify(u));
}

/** Файл настроек, которым можно поделиться с другими игроками */
export function exportAll(s: Settings, u: UiSettings): string {
  return JSON.stringify({ app: "game-schedule", version: 2, settings: s, ui: u }, null, 2);
}

export function importAll(json: string): { settings: Settings; ui: UiSettings } | null {
  try {
    const data = JSON.parse(json);
    const settings: any = structuredClone(DEFAULTS);
    const src = data.settings ?? data;
    for (const k of Object.keys(DEFAULTS) as (keyof Settings)[]) {
      if (src[k]) settings[k] = { ...DEFAULTS[k], ...src[k] };
    }
    const ui: UiSettings = { ...UI_DEFAULTS, ...(data.ui ?? {}) };
    return { settings, ui };
  } catch {
    return null;
  }
}