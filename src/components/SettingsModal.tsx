import { useState } from "react";
import { Settings, SettingsKey, NotificationConfig } from "../types";

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

const SECTIONS: { key: SettingsKey; title: string; hasEnd: boolean }[] = [
  { key: "regular", title: "📦 Обычные (Тайники, Дроп, Дилеры, Цеха)", hasEnd: false },
  { key: "gov", title: "🏛️ Поставки гос.организаций", hasEnd: true },
  { key: "smuggle", title: "💨 Контрабанда", hasEnd: false },
  { key: "island", title: "🏝️ Нападение на Остров / Форт", hasEnd: true },
  { key: "captures", title: "🎯 Капты", hasEnd: true },
];

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>(settings);

  function updateSection(key: SettingsKey, cfg: NotificationConfig) {
    setLocal({ ...local, [key]: cfg });
  }

  function save() {
    onSave(local);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ Настройки уведомлений</h2>
        <p className="modal-hint">Настрой для каждого типа событий отдельно</p>

        <div className="settings-list">
          {SECTIONS.map(sec => (
            <NotifyRowLazy
              key={sec.key}
              title={sec.title}
              config={local[sec.key]}
              hasEndEvent={sec.hasEnd}
              onChange={(cfg) => updateSection(sec.key, cfg)}
            />
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Отмена</button>
          <button className="btn primary" onClick={save}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// Ленивый импорт, чтобы не тянуть NotifyRow в корень
import NotifyRowLazy from "./NotifyRow";