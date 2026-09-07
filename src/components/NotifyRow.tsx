import { NotificationConfig } from "../types";
import { SOUND_OPTIONS } from "../utils/sounds";
import { playSound } from "../utils/sounds";

interface Props {
  title: string;
  config: NotificationConfig;
  hasEndEvent?: boolean; // показывать поле "до конца"
  onChange: (c: NotificationConfig) => void;
}

export default function NotifyRow({ title, config, hasEndEvent, onChange }: Props) {
  function update(patch: Partial<NotificationConfig>) {
    onChange({ ...config, ...patch });
  }

  return (
    <div className="notify-row">
      <div className="nr-head">
        <label className="nr-toggle">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          <span className="nr-title">{title}</span>
        </label>
        <button
          className="btn small"
          disabled={!config.enabled}
          onClick={() => playSound(config.sound)}
          title="Тест звука"
        >
          🔊 Тест
        </button>
      </div>

      {config.enabled && (
        <div className="nr-body">
          <div className="nr-field">
            <label>За сколько мин. до начала</label>
            <input
              type="number"
              min={1}
              max={120}
              value={config.minutesBeforeStart}
              onChange={(e) => update({ minutesBeforeStart: Number(e.target.value) })}
            />
          </div>

          {hasEndEvent && (
            <div className="nr-field">
              <label>За сколько мин. до конца</label>
              <input
                type="number"
                min={1}
                max={120}
                value={config.minutesBeforeEnd}
                onChange={(e) => update({ minutesBeforeEnd: Number(e.target.value) })}
              />
            </div>
          )}

          <div className="nr-field">
            <label>Звук</label>
            <select
              value={config.sound}
              onChange={(e) => update({ sound: e.target.value as NotificationConfig["sound"] })}
            >
              {SOUND_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}