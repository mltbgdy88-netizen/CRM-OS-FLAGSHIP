'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listTasks, type TaskListItem, type TaskStatus } from '../lib/api/tasks-client';
import {
  taskPriorityClass,
  taskPriorityLabel,
  taskStatusClass,
  taskStatusLabel,
} from '../lib/mock/tasks-mock';
import { ActivityComposer } from './activity-composer';
import { CalendarLitePanel } from './calendar-lite-panel';
import { TableSkeleton } from './table-skeleton';

type StatusFilter = 'all' | TaskStatus;
type OwnerFilter = 'all' | 'unassigned' | string;

function relatedLabel(task: TaskListItem): string {
  if (!task.relatedType) {
    return '—';
  }
  return task.relatedType.charAt(0).toUpperCase() + task.relatedType.slice(1);
}

function ownerLabel(task: TaskListItem): string {
  return task.assignedUserId ? 'Atanmış' : 'Atanmamış';
}

function ownerFilterValue(task: TaskListItem): string {
  return task.assignedUserId ?? 'unassigned';
}

export function TaskListView() {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<TaskListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = useCallback(async () => {
    setState('loading');
    try {
      const result = await listTasks(1, 50);
      setItems(result.items);
      setTotal(result.total);
      setState(result.items.length === 0 ? 'empty' : 'success');
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Görevler yüklenemedi');
      setState('error');
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const owners = useMemo(() => {
    const values = new Set(items.map((task) => ownerFilterValue(task)));
    return [...values].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }
    if (ownerFilter !== 'all') {
      result = result.filter((task) => ownerFilterValue(task) === ownerFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          relatedLabel(task).toLowerCase().includes(query),
      );
    }
    return result;
  }, [items, ownerFilter, searchQuery, statusFilter]);

  const pendingCount = items.filter((task) => task.status === 'pending').length;
  const overdueCount = items.filter(
    (task) => task.status !== 'done' && task.dueAt && new Date(task.dueAt) < new Date(),
  ).length;
  const doneCount = items.filter((task) => task.status === 'done').length;

  function renderSidebar() {
    return (
      <>
        <CalendarLitePanel tasks={items} />
        <ActivityComposer onLogged={() => void loadTasks()} />
      </>
    );
  }

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="task-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Görevler</h1>
          </div>
        </header>
        <TableSkeleton rows={6} data-testid="task-list-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="task-list">
        <p className="state-message state-message--forbidden" data-testid="task-list-forbidden">
          Görev listesini görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="task-list">
        <p className="state-message state-message--error" data-testid="task-list-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page" data-testid="task-list">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Görevler</h1>
            <span className="entity-page__count">0 kayıt</span>
          </div>
          <div className="entity-page__header-actions">
            <button type="button" className="btn-accent-green" disabled title="Sprint-11 sonrası">
              + Yeni Görev
            </button>
          </div>
        </header>

        <div className="calendar-layout">
          <div className="empty-state" data-testid="task-list-empty">
            <span className="empty-state__icon" aria-hidden>
              ◇
            </span>
            <p>Henüz görev kaydı yok.</p>
          </div>
          {renderSidebar()}
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="task-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Görevler</h1>
          <span className="entity-page__count">{total} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <button type="button" className="btn-accent-green" disabled title="Sprint-11 sonrası">
            + Yeni Görev
          </button>
        </div>
      </header>

      <div className="calendar-layout">
        <div>
          <div className="kpi-strip kpi-strip--compact" data-testid="task-kpi-strip">
            <article className="kpi-card">
              <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
                ☑
              </span>
              <div>
                <p className="kpi-card__label">Bekleyen</p>
                <p className="kpi-card__value">{pendingCount}</p>
              </div>
            </article>
            <article className="kpi-card">
              <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>
                !
              </span>
              <div>
                <p className="kpi-card__label">Geciken</p>
                <p className="kpi-card__value">{overdueCount}</p>
              </div>
            </article>
            <article className="kpi-card">
              <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>
                ✓
              </span>
              <div>
                <p className="kpi-card__label">Tamamlanan</p>
                <p className="kpi-card__value">{doneCount}</p>
              </div>
            </article>
            <article className="kpi-card">
              <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>
                ◷
              </span>
              <div>
                <p className="kpi-card__label">Bu sayfa</p>
                <p className="kpi-card__value">{filteredItems.length}</p>
              </div>
            </article>
          </div>

          <div className="entity-page__filters">
            <label className="entity-page__filter">
              <span className="entity-page__filter-label">Durum</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                aria-label="Durum filtresi"
              >
                <option value="all">Tümü</option>
                <option value="pending">Bekliyor</option>
                <option value="in_progress">Devam ediyor</option>
                <option value="done">Tamamlandı</option>
              </select>
            </label>
            <label className="entity-page__filter">
              <span className="entity-page__filter-label">Sahip</span>
              <select
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value as OwnerFilter)}
                aria-label="Sahip filtresi"
              >
                <option value="all">Tümü</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner === 'unassigned' ? 'Atanmamış' : 'Atanmış'}
                  </option>
                ))}
              </select>
            </label>
            <div className="entity-page__search-wrap">
              <span className="entity-page__search-icon" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                className="entity-page__search"
                placeholder="Görev veya ilişkili kayıt ara…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Görev ara"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon" aria-hidden>
                ⌕
              </span>
              <p>Filtrelere uygun görev bulunamadı.</p>
            </div>
          ) : (
            <div className="data-table-wrap data-table-wrap--flush">
              <table className="data-table data-table--premium" data-testid="task-list-items">
                <thead>
                  <tr>
                    <th className="data-table__col-check" aria-label="Seç" />
                    <th>Görev</th>
                    <th>Bitiş</th>
                    <th>Öncelik</th>
                    <th>Durum</th>
                    <th>İlişkili</th>
                    <th>Sahip</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((task) => (
                    <tr key={task.id} className="data-table__row" data-testid={`task-row-${task.id}`}>
                      <td className="data-table__col-check">
                        <input
                          type="checkbox"
                          disabled
                          checked={task.status === 'done'}
                          aria-label="Görev tamamlandı"
                        />
                      </td>
                      <td>
                        <span
                          className={
                            task.status === 'done'
                              ? 'data-table__muted data-table__done'
                              : 'data-table__link'
                          }
                        >
                          {task.title}
                        </span>
                      </td>
                      <td className="data-table__muted">
                        {task.dueAt
                          ? new Date(task.dueAt).toLocaleString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td>
                        <span className={taskPriorityClass(task.priority)}>
                          {taskPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={taskStatusClass(task.status)}>
                          {taskStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="data-table__muted">{relatedLabel(task)}</td>
                      <td className="data-table__muted">{ownerLabel(task)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="entity-footer">
            <p className="entity-footer__hint" data-testid="task-api-notice">
              Canlı API — toplu işlem kapalıdır.
            </p>
          </footer>
        </div>

        {renderSidebar()}
      </div>
    </section>
  );
}
