'use client';

import { useMemo } from 'react';
import type { TaskListItem } from '../lib/api/tasks-client';
import { taskStatusLabel } from '../lib/mock/tasks-mock';

interface CalendarLitePanelProps {
  tasks: TaskListItem[];
}

function relatedLabel(task: TaskListItem): string {
  if (!task.relatedType) {
    return '—';
  }
  return task.relatedType.charAt(0).toUpperCase() + task.relatedType.slice(1);
}

export function CalendarLitePanel({ tasks }: CalendarLitePanelProps) {
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((task) => task.dueAt && task.status !== 'done')
      .filter((task) => new Date(task.dueAt as string) >= now)
      .sort((left, right) => {
        const leftDue = new Date(left.dueAt as string).getTime();
        const rightDue = new Date(right.dueAt as string).getTime();
        return leftDue - rightDue;
      })
      .slice(0, 8);
  }, [tasks]);

  return (
    <section className="calendar-sidebar" data-testid="calendar-lite-panel">
      <h2>Yaklaşan görevler</h2>

      {upcomingTasks.length === 0 ? (
        <p className="detail-tab-panel__empty" data-testid="calendar-lite-empty">
          Yaklaşan bitiş tarihi olan görev yok.
        </p>
      ) : (
        <ul className="calendar-task-list" data-testid="calendar-lite-list">
          {upcomingTasks.map((task) => (
            <li key={task.id} className="calendar-task" data-testid={`calendar-lite-task-${task.id}`}>
              <input
                type="checkbox"
                checked={task.status === 'done'}
                disabled
                aria-label={task.title}
              />
              <div>
                <span>{task.title}</span>
                <p className="calendar-event__meta">
                  {new Date(task.dueAt as string).toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' · '}
                  {taskStatusLabel(task.status)}
                  {' · '}
                  {relatedLabel(task)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
