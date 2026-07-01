'use client';

import { HOURS, MOCK_CALENDAR_EVENTS, MOCK_SIDEBAR_TASKS } from '../lib/mock/calendar-mock';
import { MockPreviewBadge } from './mock-preview-badge';

const PIXELS_PER_HOUR = 56;
const DAY_START_HOUR = 8;

function eventTop(startHour: number, startMinute: number) {
  return (startHour - DAY_START_HOUR) * PIXELS_PER_HOUR + (startMinute / 60) * PIXELS_PER_HOUR;
}

function eventHeight(durationMinutes: number) {
  return (durationMinutes / 60) * PIXELS_PER_HOUR;
}

export function CalendarView() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="workspace-card calendar-page" data-testid="calendar-page">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Takvim</h1>
          <span className="entity-page__count">{dateLabel}</span>
        </div>
        <MockPreviewBadge />
      </header>

      <div className="calendar-layout">
        <div className="calendar-day" data-testid="calendar-day">
          <div className="calendar-day__grid">
            {HOURS.map((hour) => (
              <div key={hour} className="calendar-day__hour-row">
                <time className="calendar-day__hour-label">
                  {String(hour).padStart(2, '0')}:00
                </time>
                <div className="calendar-day__hour-slot" />
              </div>
            ))}
            <div className="calendar-day__events">
              {MOCK_CALENDAR_EVENTS.map((event) => (
                <article
                  key={event.id}
                  className="calendar-event"
                  data-testid={`calendar-event-${event.id}`}
                  style={{
                    top: `${eventTop(event.startHour, event.startMinute)}px`,
                    height: `${eventHeight(event.durationMinutes)}px`,
                    borderLeftColor: event.color,
                    background: `${event.color}22`,
                  }}
                >
                  <p className="calendar-event__title">{event.title}</p>
                  <p className="calendar-event__meta">{event.customer}</p>
                  <time>
                    {String(event.startHour).padStart(2, '0')}:
                    {String(event.startMinute).padStart(2, '0')}
                  </time>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="calendar-sidebar" aria-label="Günün görevleri">
          <h2>Bugünün görevleri</h2>
          <ul className="calendar-task-list">
            {MOCK_SIDEBAR_TASKS.map((task) => (
              <li key={task.id} className={task.done ? 'calendar-task calendar-task--done' : 'calendar-task'}>
                <input type="checkbox" checked={task.done} disabled aria-label={task.title} />
                <span>{task.title}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
