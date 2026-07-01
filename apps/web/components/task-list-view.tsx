'use client';

import { useMemo, useState } from 'react';
import {
  MOCK_TASKS,
  taskPriorityClass,
  taskPriorityLabel,
  taskStatusClass,
  taskStatusLabel,
  type TaskStatus,
} from '../lib/mock/tasks-mock';
import { MockPreviewBadge } from './mock-preview-badge';

type StatusFilter = 'all' | TaskStatus;

export function TaskListView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const owners = useMemo(
    () => [...new Set(MOCK_TASKS.map((task) => task.owner))].sort(),
    [],
  );

  const filteredItems = useMemo(() => {
    let result = MOCK_TASKS;
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }
    if (ownerFilter !== 'all') {
      result = result.filter((task) => task.owner === ownerFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.relatedTo.toLowerCase().includes(query),
      );
    }
    return result;
  }, [ownerFilter, searchQuery, statusFilter]);

  const pendingCount = MOCK_TASKS.filter((t) => t.status === 'pending').length;
  const overdueCount = MOCK_TASKS.filter(
    (t) => t.status !== 'done' && new Date(t.dueAt) < new Date(),
  ).length;
  const doneCount = MOCK_TASKS.filter((t) => t.status === 'done').length;

  return (
    <section className="workspace-card entity-page" data-testid="task-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Görevler</h1>
          <span className="entity-page__count">{MOCK_TASKS.length} kayıt</span>
        </div>
        <div className="entity-page__header-actions">
          <MockPreviewBadge />
          <button type="button" className="btn-accent-green" disabled title="Sprint-08 ile aktif olacak">
            + Yeni Görev
          </button>
        </div>
      </header>

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
            onChange={(event) => setOwnerFilter(event.target.value)}
            aria-label="Sahip filtresi"
          >
            <option value="all">Tümü</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
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
                        task.status === 'done' ? 'data-table__muted data-table__done' : 'data-table__link'
                      }
                    >
                      {task.title}
                    </span>
                  </td>
                  <td className="data-table__muted">
                    {new Date(task.dueAt).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
                  <td className="data-table__muted">{task.relatedTo}</td>
                  <td className="data-table__muted">{task.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="task-mock-notice">
          Demo veri — görev API Sprint-08 ile bağlanacak.
        </p>
      </footer>
    </section>
  );
}
