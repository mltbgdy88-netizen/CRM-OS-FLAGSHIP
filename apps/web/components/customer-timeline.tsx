'use client';

import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getCustomerTimeline,
  type CustomerTimelineEventView,
} from '../lib/api/customer-360-client';

interface CustomerTimelineSectionProps {
  customerId: string;
  variant?: 'card' | 'feed';
}

type TimelineState = 'loading' | 'error' | 'forbidden' | 'empty' | 'success';

function eventIcon(eventType: string) {
  if (eventType.includes('call')) return '📞';
  if (eventType.includes('email')) return '✉';
  if (eventType.includes('meeting')) return '📅';
  if (eventType.includes('created')) return '✦';
  return '•';
}

export function CustomerTimelineSection({
  customerId,
  variant = 'card',
}: CustomerTimelineSectionProps) {
  const [state, setState] = useState<TimelineState>('loading');
  const [events, setEvents] = useState<CustomerTimelineEventView[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await getCustomerTimeline(customerId, page, pageSize);
        if (cancelled) {
          return;
        }
        setEvents(result.items);
        setTotal(result.total);
        setState(result.items.length === 0 ? 'empty' : 'success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load timeline');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [customerId, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const sectionClass = variant === 'feed' ? 'timeline-feed' : 'card timeline-card';

  return (
    <section className={sectionClass} data-testid="customer-timeline-section">
      <h2>Timeline</h2>

      {state === 'loading' && (
        <p className="state-message" data-testid="customer-timeline-loading">
          Loading timeline…
        </p>
      )}

      {state === 'forbidden' && (
        <p className="state-message state-message--error" data-testid="customer-timeline-forbidden">
          You do not have permission to view this customer timeline.
        </p>
      )}

      {state === 'error' && (
        <p className="state-message state-message--error" data-testid="customer-timeline-error">
          {errorMessage}
        </p>
      )}

      {state === 'empty' && (
        <p className="state-message" data-testid="customer-timeline-empty">
          No timeline events yet.
        </p>
      )}

      {state === 'success' && (
        <>
          <ol className="timeline-feed__list" data-testid="customer-timeline-list">
            {events.map((event) => (
              <li key={event.id} className="timeline-feed__item" data-testid="customer-timeline-row">
                <span className="timeline-feed__icon" aria-hidden>
                  {eventIcon(event.eventType)}
                </span>
                <div className="timeline-feed__body">
                  <p className="timeline-feed__title">{event.title}</p>
                  <p className="timeline-feed__meta">
                    {event.eventType} · {new Date(event.occurredAt).toLocaleString()}
                  </p>
                  {event.summary ? <p className="timeline-feed__summary">{event.summary}</p> : null}
                </div>
              </li>
            ))}
          </ol>
          <div className="pagination" data-testid="customer-timeline-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
