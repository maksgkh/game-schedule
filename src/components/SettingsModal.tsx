import { useState } from "react";
import { Settings, SettingsKey, NotificationConfig } from "../types";
import { playSound, SOUND_OPTIONS } from "../utils/sounds";
import { setDevTime } from "../utils/time";

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

const SECTIONS: { key: SettingsKey; title: string; hasEnd: boolean }[] = [
  { key: "drop", title: "📦 Дроп / Тайники", hasEnd: false },
  { key: "workshop", title: "🏭 Цеха", hasEnd: false },
  { key: "dealer", title: "👤 Дилеры", hasEnd: false },
  { key: "contraband", title: "🚢 Контрабанда", hasEnd: false },
  { key: "gov", title: "🏛️ Поставки гос.организаций", hasEnd: true },
  { key: "island", title: "🏝️ Нападение на Остров / Форт", hasEnd: true },
  { key: "captures", title: "🎯 Капты", hasEnd: true },
];

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>(settings);
  const [testTime, setTestTime] = useState<string>("");

  function updateSection(key: SettingsKey, cfg: any) {
    setLocal({ ...local, [key]: cfg });
  }

  function save() {
    onSave(local);
    onClose();
  }

  const handleTimeChange = (val: string) => {
    setTestTime(val);
    setDevTime(val ? new Date(val) : null);
  };

  const resetTime = () => {
    setTestTime("");
    setDevTime(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ Настройки уведомлений</h2>
        <p className="modal-hint">Настрой время, звук и оверлей для каждого типа событий</p>

        <div className="settings-list">
          {SECTIONS.map((sec) => {
            const cfg = local[sec.key];
            if (!cfg) return null;
            return (
              <div key={sec.key} className="notify-row">
                <div className="nr-head">
                  <label className="nr-toggle">
                    <input
                      type="checkbox"
                      checked={cfg.enabled}
                      onChange={(e) => updateSection(sec.key, { ...cfg, enabled: e.target.checked })}
                    />
                    <span className="nr-title">{sec.title}</span>
                  </label>
                  <button
                    className="btn small"
                    disabled={!cfg.enabled}
                    onClick={() => playSound(cfg.sound, cfg.customSoundData)}
                    title="Проиграть выбранный звук"
                  >
                    🔊 Тест
                  </button>
                </div>
                {cfg.enabled && (
                  <div className="nr-body">
                    <div className="nr-field">
                      <label>До начала (мин)</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={cfg.minutesBeforeStart}
                        onChange={(e) =>
                          updateSection(sec.key, { ...cfg, minutesBeforeStart: Number(e.target.value) })
                        }
                      />
                    </div>
                    {sec.hasEnd && (
                      <div className="nr-field">
                        <label>До конца (мин)</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={cfg.minutesBeforeEnd}
                          onChange={(e) =>
                            updateSection(sec.key, { ...cfg, minutesBeforeEnd: Number(e.target.value) })
                          }
                        />
                      </div>
                    )}
                    <div className="nr-field">
                      <label>Звук</label>
                      <select
                        value={cfg.sound}
                        onChange={(e) =>
                          updateSection(sec.key, { ...cfg, sound: e.target.value as any })
                        }
                      >
                        {SOUND_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="nr-field">
                      <label>Оверлей (мин)</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={cfg.minutesBeforeShow || 5}
                        onChange={(e) =>
                          updateSection(sec.key, { ...cfg, minutesBeforeShow: Number(e.target.value) })
                        }
                      />
                    </div>
                    {cfg.sound === "custom" && (
                      <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Загрузить свой звук (MP3/WAV, макс. 2 МБ)</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateSection(sec.key, { ...cfg, customSoundData: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {cfg.customSoundData && (
                          <button
                            className="btn small"
                            style={{ marginTop: 8, width: "100%" }}
                            onClick={() => playSound("custom", cfg.customSoundData)}
                          >
                            ▶ Проверить загруженный звук
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="notify-row" style={{ marginTop: 16, borderColor: "#444", background: "#0f0f0f" }}>
            <div className="nr-head">
              <span className="nr-title" style={{ color: "#888" }}>🛠️ Тест времени (симуляция)</span>
              <button
                className="btn small"
                onClick={resetTime}
              >
                Сброс
              </button>
            </div>
            <div className="nr-body" style={{ paddingTop: "12px", marginTop: "12px" }}>
              <div className="nr-field" style={{ gridColumn: "1 / -1" }}>
                <label>Установить время</label>
                <input
                  type="datetime-local"
                  value={testTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Отмена</button>
          <button className="btn primary" onClick={save}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}