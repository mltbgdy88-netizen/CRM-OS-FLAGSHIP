'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  listNotifications,
  markNotificationRead,
  type NotificationItem,
} from '../lib/api/notifications-client';
import { TableSkeleton } from './table-skeleton';

function categoryLabel(category: string): string {
  switch (category) {
    case 'info':
      return 'Bilgi';
    case 'sales':
      return 'Satış';
    case 'task':
      return 'Görev';
    default:
      return category;
  }
}

function severityLabel(severity: string): string {
  switch (severity) {
    case 'normal':
      return 'Normal';
    case 'high':
      return 'Yüksek';
    case 'low':
      return 'Düşük';
    default:
      return severity;
  }
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'az önce';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} dk önce`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} saat önce`;
  }

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface NotificationRowProps {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  markingId: string | null;
}

function NotificationRow({ item, onMarkRead, markingId }: NotificationRowProps) {
  const isMarking = markingId === item.id;

  return (
    <li>
      <button
        type="button"
        className={
          item.isRead
            ? 'notification-center__item notification-center__item--read'
            : 'notification-center__item'
        }
        onClick={() => onMarkRead(item.id)}
        disabled={isMarking}
        data-testid={`notification-item-${item.id}`}
        aria-pressed={item.isRead}
      >
        <div className="notification-center__item-head">
          <span className="notification-center__title">{item.title}</span>
          {!item.isRead ? (
            <span className="notification-center__unread-dot" aria-label="Okunmadı" />
          ) : null}
        </div>
        {item.body ? <p className="notification-center__body">{item.body}</p> : null}
        <div className="notification-center__meta">
          <span className="notification-center__chip">{categoryLabel(item.category)}</span>
          <span className="notification-center__chip">{severityLabel(item.severity)}</span>
          <time className="notification-center__time" dateTime={item.createdAt}>
            {formatRelativeTime(item.createdAt)}
          </time>
          {item.isRead ? <span className="notification-center__read-label">Okundu</span> : null}
        </div>
      </button>
    </li>
  );
}

export function NotificationCenter() {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setState('loading');
    try {
      const result = await listNotifications(1, 50);
      setItems(result.items);
      setTotal(result.total);
      setState(result.items.length === 0 ? 'empty' : 'success');
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Bildirimler yüklenemedi');
      setState('error');
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(id: string) {
    const existing = items.find((item) => item.id === id);
    if (!existing || existing.isRead) {
      return;
    }

    setMarkingId(id);
    try {
      const updated = await markNotificationRead(id);
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...updated } : item)),
      );
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Bildirim okundu olarak işaretlenemedi');
      setState('error');
    } finally {
      setMarkingId(null);
    }
  }

  const unreadCount = items.filter((item) => !item.isRead).length;

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="notification-center">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Bildirimler</h1>
          </div>
        </header>
        <TableSkeleton rows={5} columns={2} data-testid="notification-center-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="notification-center">
        <p
          className="state-message state-message--forbidden"
          data-testid="notification-center-forbidden"
        >
          Bildirimleri görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="notification-center">
        <p className="state-message state-message--error" data-testid="notification-center-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="workspace-card entity-page" data-testid="notification-center">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Bildirimler</h1>
            <span className="entity-page__count">0 kayıt</span>
          </div>
        </header>
        <div className="empty-state" data-testid="notification-center-empty">
          <span className="empty-state__icon" aria-hidden>
            ◉
          </span>
          <p>Henüz bildirim yok.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="notification-center">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Bildirimler</h1>
          <span className="entity-page__count">{total} kayıt</span>
          {unreadCount > 0 ? (
            <span className="entity-page__count" data-testid="notification-unread-count">
              {unreadCount} okunmamış
            </span>
          ) : null}
        </div>
      </header>

      <p className="entity-footer__hint" data-testid="notification-center-hint">
        Okunmamış bildirime tıklayarak okundu işaretleyin.
      </p>

      <ul className="notification-center__list" data-testid="notification-center-list">
        {items.map((item) => (
          <NotificationRow
            key={item.id}
            item={item}
            onMarkRead={handleMarkRead}
            markingId={markingId}
          />
        ))}
      </ul>
    </section>
  );
}
