'use client';

import { useMemo, useState } from 'react';
import {
  MOCK_TICKETS,
  slaRisk,
  ticketPriorityClass,
  ticketPriorityLabel,
  ticketStatusClass,
  ticketStatusLabel,
  type TicketStatus,
} from '../lib/mock/tickets-mock';
import { MockPreviewBadge } from './mock-preview-badge';

type StatusFilter = 'all' | TicketStatus;

export function TicketListView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let result = MOCK_TICKETS;
    if (statusFilter !== 'all') {
      result = result.filter((ticket) => ticket.status === statusFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (ticket) =>
          ticket.number.toLowerCase().includes(query) ||
          ticket.customer.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query),
      );
    }
    return result;
  }, [searchQuery, statusFilter]);

  const openCount = MOCK_TICKETS.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const breachCount = MOCK_TICKETS.filter((t) => slaRisk(t.slaDueAt) === 'breach').length;

  return (
    <section className="workspace-card entity-page" data-testid="ticket-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Destek</h1>
          <span className="entity-page__count">{MOCK_TICKETS.length} talep</span>
        </div>
        <div className="entity-page__header-actions">
          <MockPreviewBadge />
          <button type="button" className="btn-accent-green" disabled title="Sprint-10 ile aktif olacak">
            + Yeni Talep
          </button>
        </div>
      </header>

      <div className="kpi-strip kpi-strip--compact">
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--blue" aria-hidden>⚑</span>
          <div>
            <p className="kpi-card__label">Açık</p>
            <p className="kpi-card__value">{openCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--orange" aria-hidden>!</span>
          <div>
            <p className="kpi-card__label">SLA riski</p>
            <p className="kpi-card__value">{breachCount}</p>
          </div>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__icon kpi-card__icon--green" aria-hidden>✓</span>
          <div>
            <p className="kpi-card__label">Çözülen</p>
            <p className="kpi-card__value">
              {MOCK_TICKETS.filter((t) => t.status === 'resolved').length}
            </p>
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
            <option value="open">Açık</option>
            <option value="in_progress">İşlemde</option>
            <option value="waiting">Beklemede</option>
            <option value="resolved">Çözüldü</option>
          </select>
        </label>
        <div className="entity-page__search-wrap">
          <span className="entity-page__search-icon" aria-hidden>⌕</span>
          <input
            type="search"
            className="entity-page__search"
            placeholder="Talep no, müşteri veya konu ara…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Talep ara"
          />
        </div>
      </div>

      <div className="data-table-wrap data-table-wrap--flush">
        <table className="data-table data-table--premium" data-testid="ticket-list-items">
          <thead>
            <tr>
              <th>Talep No</th>
              <th>Müşteri</th>
              <th>Konu</th>
              <th>Öncelik</th>
              <th>Durum</th>
              <th>SLA</th>
              <th>Sahip</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((ticket) => {
              const risk = slaRisk(ticket.slaDueAt);
              return (
                <tr key={ticket.id} className="data-table__row" data-testid={`ticket-row-${ticket.id}`}>
                  <td><span className="data-table__link">{ticket.number}</span></td>
                  <td className="data-table__muted">{ticket.customer}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className={ticketPriorityClass(ticket.priority)}>
                      {ticketPriorityLabel(ticket.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={ticketStatusClass(ticket.status)}>
                      {ticketStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`sla-badge sla-badge--${risk}`}>
                      {new Date(ticket.slaDueAt).toLocaleString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="data-table__muted">{ticket.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="ticket-mock-notice">
          Demo veri — destek detay ve AI yanıt önerisi Sprint-10 ile gelecek.
        </p>
      </footer>
    </section>
  );
}
