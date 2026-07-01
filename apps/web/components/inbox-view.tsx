'use client';

import { useMemo, useState } from 'react';
import {
  channelIcon,
  channelLabel,
  MOCK_INBOX,
  MOCK_THREAD,
  type InboxChannel,
} from '../lib/mock/inbox-mock';
import { MockPreviewBadge } from './mock-preview-badge';

type ChannelFilter = 'all' | InboxChannel;

export function InboxView() {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>('inb-001');

  const filteredItems = useMemo(() => {
    if (channelFilter === 'all') {
      return MOCK_INBOX;
    }
    return MOCK_INBOX.filter((item) => item.channel === channelFilter);
  }, [channelFilter]);

  const selected = MOCK_INBOX.find((item) => item.id === selectedId);
  const thread = selectedId ? MOCK_THREAD[selectedId] ?? [] : [];
  const unreadCount = MOCK_INBOX.filter((item) => item.unread).length;

  return (
    <section className="workspace-card inbox-page" data-testid="inbox-page">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Gelen Kutusu</h1>
          <span className="entity-page__count">{unreadCount} okunmamış</span>
        </div>
        <MockPreviewBadge />
      </header>

      <nav className="inbox-channels" aria-label="Kanal filtreleri">
        {(['all', 'email', 'whatsapp', 'chat', 'sms'] as const).map((channel) => (
          <button
            key={channel}
            type="button"
            className={
              channelFilter === channel
                ? 'inbox-channels__tab inbox-channels__tab--active'
                : 'inbox-channels__tab'
            }
            onClick={() => setChannelFilter(channel)}
          >
            {channel === 'all' ? 'Tümü' : channelLabel(channel)}
          </button>
        ))}
      </nav>

      <div className="inbox-layout">
        <ul className="inbox-list" data-testid="inbox-list">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  selectedId === item.id
                    ? 'inbox-list__item inbox-list__item--selected'
                    : item.unread
                      ? 'inbox-list__item inbox-list__item--unread'
                      : 'inbox-list__item'
                }
                onClick={() => setSelectedId(item.id)}
                data-testid={`inbox-item-${item.id}`}
              >
                <span className="inbox-list__channel" aria-hidden>
                  {channelIcon(item.channel)}
                </span>
                <div className="inbox-list__body">
                  <div className="inbox-list__top">
                    <strong>{item.customer}</strong>
                    <time dateTime={item.lastAt}>
                      {new Date(item.lastAt).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p className="inbox-list__preview">{item.preview}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className="inbox-thread" data-testid="inbox-thread">
          {selected ? (
            <>
              <header className="inbox-thread__header">
                <h2>{selected.customer}</h2>
                <span className="status-pill status-pill--info">{channelLabel(selected.channel)}</span>
              </header>
              <div className="inbox-thread__messages">
                {thread.map((message, index) => (
                  <article
                    key={`${selectedId}-${index}`}
                    className={
                      message.from === 'customer'
                        ? 'inbox-message inbox-message--customer'
                        : 'inbox-message inbox-message--agent'
                    }
                  >
                    <p>{message.text}</p>
                    <time dateTime={message.at}>
                      {new Date(message.at).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </article>
                ))}
              </div>
              <div className="inbox-thread__ai">
                <p>AI önerisi: Revize teklif PDF&apos;ini ekleyerek yanıtlayın.</p>
                <button type="button" className="btn-ghost btn-ghost--compact" disabled>
                  Taslak kullan
                </button>
              </div>
            </>
          ) : (
            <p className="inbox-thread__empty">Bir konuşma seçin</p>
          )}
        </div>
      </div>
    </section>
  );
}
