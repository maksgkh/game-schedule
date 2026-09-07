import { GameEvent, UpcomingEvent } from "../types";
import { getMoscowTime, getNextOccurrence, formatTimeUntil } from "../utils/time";

interface Props {
  events: GameEvent[];
}

export default function EventList({ events }: Props) {
  const now = getMoscowTime();
  
  const upcoming: UpcomingEvent[] = events
    .map(event => {
      const next = getNextOccurrence(event, now);
      if (!next) return null;
      
      const timeUntil = next.getTime() - now.getTime();
      return {
        event,
        timeUntil,
        displayTime: formatTimeUntil(timeUntil),
      };
    })
    .filter((e): e is UpcomingEvent => e !== null)
    .sort((a, b) => a.timeUntil - b.timeUntil);

  return (
    <div className="event-list">
      {upcoming.map(({ event, displayTime }) => (
        <div key={event.id} className="event-item" style={{ borderLeftColor: event.color }}>
          <div className="event-info">
            <div className="event-name">{event.name}</div>
            <div className="event-time">
              {event.type === "fixed" && event.time && event.time}
              {event.type === "interval" && `Каждые ${event.interval} мин`}
              {event.type === "range" && event.range && `${event.range.start}–${event.range.end}`}
              {event.type === "weekly" && event.range && `${event.range.start}–${event.range.end}`}
            </div>
            {event.type === "weekly" && event.days && (
              <div className="event-days">
                {event.days.map(d => ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][d]).join(", ")}
              </div>
            )}
          </div>
          <div className="event-countdown">{displayTime}</div>
        </div>
      ))}
    </div>
  );
}