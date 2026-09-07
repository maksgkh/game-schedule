import { useEffect, useState } from "react";
import { UpcomingEvent } from "../types";
import { getMoscowTime, getUpcomingRegular } from "../utils/time";

export default function EventList() {
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    const update = () => setUpcoming(getUpcomingRegular(getMoscowTime()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="event-list">
      {upcoming.map(({ event, displayTime }, idx) => (
        <div
          key={event.id + displayTime}
          className={`event-item ${idx === 0 ? "next-event" : ""}`}
          style={{ borderLeftColor: event.color }}
        >
          <div className="event-info">
            <span className="name">{event.name}</span>
            <span className="time">{event.time}</span>
          </div>
          <div className="countdown">{displayTime}</div>
        </div>
      ))}
    </div>
  );
}