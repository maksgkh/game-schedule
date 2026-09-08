import { useState } from "react";
import { Settings, SettingsKey } from "../types";
import { playSound, SOUND_OPTIONS } from "../utils/sounds";
import { setDevTime } from "../utils/time";          // ← вот это исправлено (было settings)
import { exportAll, importAll } from "../utils/settings";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

interface Props {
  settings: Settings;
  ui: UiSettings;
  onSave: (s: Settings, u: UiSettings) => void;
  onClose: () => void;
}

const SECTIONS: { key: SettingsKey; title: string; hasEnd: boolean }[] = [
  { key: "drop", title: "📦 Дроп", hasEnd: false },
  { key: "stash", title: "🎁 Тайники", hasEnd: false },
  { key: "workshop", title: "🏭 Цеха", hasEnd: false },
  { key: "dealer", title: "👤 Дилеры", hasEnd: false },
  { key: "contraband", title: "🚢 Контрабанда", hasEnd: false },
  { key: "gov", title: "🏛️ Поставки гос.организаций", hasEnd: true },
  { key: "island", title: "🏝️ Нападение на Остров / Форт", hasEnd: true },
  { key: "captures", title: "🎯 Капты", hasEnd: true },
];

export default function SettingsModal({ settings, ui, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>(settings);
  const [localUi, setLocalUi] = useState<UiSettings>(ui);
  const [testTime, setTestTime] = useState("");
  const [autostart, setAutostart] = useState(false);

  useEffect(() => { isEnabled().then(setAutostart).catch(() => {}); }, []);

  const toggleAutostart = async (v: boolean) => {
    try { if (v) await enable(); else await disable(); setAutostart(v); }
    catch (e) { console.error(e); }
  };

  const updateSection = (key: SettingsKey, cfg: any) => setLocal({ ...local, [key]: cfg });

  const doExport = () => {
    const blob = new Blob([exportAll(local, localUi)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "game-schedule-settings.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = importAll(String(reader.result));
      if (res) { setLocal(res.settings); setLocalUi(res.ui); }
      else alert("Не удалось прочитать файл настроек");
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ Настройки</h2>
        <p className="modal-hint">Уведомления, оверлей и поведение приложения</p>

        <div className="settings-list">
          {SECTIONS.map((sec) => {
            const cfg = local[sec.key];
            if (!cfg) return null;
            return (
              <div key={sec.key} className="notify-row">
                <div className="nr-head">
                  <label className="nr-toggle">
                    <input type="checkbox" checked={cfg.enabled}
                      onChange={(e) => updateSection(sec.key, { ...cfg, enabled: e.target.checked })} />
                    <span className="nr-title">{sec.title}</span>
                  </label>
                  <button className="btn small" disabled={!cfg.enabled}
                    onClick={() => playSound(cfg.sound, cfg.customSoundData)}>🔊 Тест</button>
                </div>
                {cfg.enabled && (
                  <div className="nr-body">
                    <div className="nr-field">
                      <label>До начала (мин)</label>
                      <input type="number" min={1} max={120} value={cfg.minutesBeforeStart}
                        onChange={(e) => updateSection(sec.key, { ...cfg, minutesBeforeStart: Number(e.target.value) })} />
                    </div>
                    {sec.hasEnd && (
                      <div className="nr-field">
                        <label>До конца (мин)</label>
                        <input type="number" min={1} max={120} value={cfg.minutesBeforeEnd}
                          onChange={(e) => updateSection(sec.key, { ...cfg, minutesBeforeEnd: Number(e.target.value) })} />
                      </div>
                    )}
                    <div className="nr-field">
                      <label>Звук</label>
                      <select value={cfg.sound}
                        onChange={(e) => updateSection(sec.key, { ...cfg, sound: e.target.value as any })}>
                        {SOUND_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                      </select>
                    </div>
                    {cfg.sound === "custom" && (
                      <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Свой звук (MP3/WAV, до 2 МБ)</label>
                        <input type="file" accept="audio/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateSection(sec.key, { ...cfg, customSoundData: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ===== ПОВЕДЕНИЕ ПРИЛОЖЕНИЯ ===== */}
          <div className="notify-row" style={{ borderColor: "#444", background: "#0f0f0f" }}>
            <div className="nr-head"><span className="nr-title">🖥️ Приложение и оверлей</span></div>
            <div className="nr-body">
              <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                <label>Горячая клавиша оверлея (формат: CommandOrControl+Shift+H)</label>
                <input type="text" value={localUi.hotkey}
                  onChange={(e) => setLocalUi({ ...localUi, hotkey: e.target.value })} />
              </div>
              <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                <label>Прозрачность оверлея: {Math.round(localUi.overlayOpacity * 100)}%</label>
                <input type="range" min={20} max={100} step={5}
                  value={Math.round(localUi.overlayOpacity * 100)}
                  onChange={(e) => setLocalUi({ ...localUi, overlayOpacity: Number(e.target.value) / 100 })} />
              </div>
              <div className="nr-field">
                <label className="nr-toggle" style={{ fontSize: "0.8rem" }}>
                  <input type="checkbox" checked={localUi.autoHide}
                    onChange={(e) => setLocalUi({ ...localUi, autoHide: e.target.checked })} />
                  Скрывать автоматически
                </label>
              </div>
              <div className="nr-field">
                <label>Показывать за (мин)</label>
                <input type="number" min={1} max={60} value={localUi.imminentMinutes}
                  onChange={(e) => setLocalUi({ ...localUi, imminentMinutes: Number(e.target.value) })} />
              </div>
              <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                <label className="nr-toggle" style={{ fontSize: "0.8rem" }}>
                  <input type="checkbox" checked={autostart} onChange={(e) => toggleAutostart(e.target.checked)} />
                  Запускать вместе с Windows
                </label>
              </div>
              <div className="ui-actions" style={{ gridColumn: "1 / -1" }}>
                <button className="btn small" onClick={doExport}>⬇ Экспорт настроек</button>
                <label className="btn small" style={{ cursor: "pointer" }}>
                  ⬆ Импорт
                  <input type="file" accept="application/json" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); }} />
                </label>
              </div>
            </div>
          </div>

          {/* ===== ТЕСТ ВРЕМЕНИ ===== */}
          <div className="notify-row" style={{ borderColor: "#444", background: "#0f0f0f" }}>
            <div className="nr-head">
              <span className="nr-title" style={{ color: "#888" }}>🛠️ Тест времени (симуляция)</span>
              <button className="btn small" onClick={() => { setTestTime(""); setDevTime(null); }}>Сброс</button>
            </div>
            <div className="nr-body">
              <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                <label>Установить время</label>
                <input type="datetime-local" value={testTime}
                  onChange={(e) => { setTestTime(e.target.value); setDevTime(e.target.value ? new Date(e.target.value) : null); }} />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Отмена</button>
          <button className="btn primary" onClick={() => { onSave(local, localUi); onClose(); }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}