import { useEffect, useState } from "react";
import { SpecialEvent } from "../types";
import { SPECIAL_EVENTS } from "../schedule";
import { getMoscowTime, isSpecialActive } from "../utils/time";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function SpecialEvents() {
  const [states, setStates] = useState<Record<string, { active: boolean; highlighted: boolean; activeSubName?: string }>>({});

  useEffect(() => {
    const update = () => {
      const now = getMoscowTime();
      const newStates: typeof states = {};
      SPECIAL_EVENTS.forEach(ev => {
        newStates[ev.id] = isSpecialActive(ev, now);
      });
      setStates(newStates);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="special-list">
      {SPECIAL_EVENTS.map(ev => {
        const state = states[ev.id] || { active: false, highlighted: false };
        const classes = ["special-item"];
        if (state.active) classes.push("active");
        if (state.highlighted) classes.push("highlighted");

        return (
          <div key={ev.id} className={classes.join(" ")} style={{ borderLeftColor: ev.color }}>
            <div className="sp-name">
              {ev.name}
              {state.highlighted && <span className="sp-badge">АКТИВНО</span>}
            </div>
            <div className="sp-desc">{ev.description}</div>
            
            {state.activeSubName && <div className="sp-sub">Сегодня: {state.activeSubName}</div>}
            
            {ev.days && (
              <div className="sp-days">Дни: {ev.days.map(d => DAY_NAMES[d]).join(", ")}</div>
            )}
            {ev.subEvents && (
              <div className="sp-days">
                {ev.subEvents.map(s => `${s.name}: ${s.days.map(d => DAY_NAMES[d]).join(", ")}`).join(" | ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}