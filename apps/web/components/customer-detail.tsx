'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getCustomer360,
  type Customer360View,
} from '../lib/api/customer-360-client';
import { getCustomer, type CustomerDetail } from '../lib/api/customers-client';
import { AiAssistDock } from './ai-assist-dock';
import { CustomerTimelineSection } from './customer-timeline';

interface CustomerDetailViewProps {
  customerId: string;
  variant?: 'page' | 'slide-over';
  onClose?: () => void;
  onLoaded?: (customer: CustomerDetail) => void;
}

type View360State = 'loading' | 'error' | 'forbidden' | 'empty' | 'success';

function statusLabelTr(status: string) {
  if (status === 'active') {
    return 'Aktif';
  }
  if (status === 'inactive' || status === 'lost') {
    return 'Pasif';
  }
  return 'Potansiyel';
}

function statusPillClass(status: string) {
  if (status === 'active') {
    return 'status-pill status-pill--success';
  }
  if (status === 'inactive' || status === 'lost') {
    return 'status-pill status-pill--danger';
  }
  return 'status-pill status-pill--warning';
}

function relationshipDays(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function primaryScore(customer360: Customer360View | null) {
  const score = customer360?.scores[0]?.scoreValue;
  return typeof score === 'number' ? Math.round(score) : null;
}

export function CustomerDetailView({
  customerId,
  variant = 'page',
  onClose,
  onLoaded,
}: CustomerDetailViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [view360State, setView360State] = useState<View360State>('loading');
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [customer360, setCustomer360] = useState<Customer360View | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [view360Error, setView360Error] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      setView360State('loading');

      try {
        const [coreResult, view360Result] = await Promise.allSettled([
          getCustomer(customerId),
          getCustomer360(customerId),
        ]);

        if (cancelled) {
          return;
        }

        if (coreResult.status === 'rejected') {
          const error = coreResult.reason;
          if (error instanceof ApiClientError && error.kind === 'forbidden') {
            setState('forbidden');
            return;
          }
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load customer');
          setState('error');
          return;
        }

        setCustomer(coreResult.value);
        onLoaded?.(coreResult.value);
        setState('success');

        if (view360Result.status === 'fulfilled') {
          setCustomer360(view360Result.value);
          const has360Data =
            view360Result.value.scores.length > 0 ||
            view360Result.value.riskScore !== null ||
            view360Result.value.lifetimeValue !== null ||
            view360Result.value.notes.length > 0 ||
            view360Result.value.files.length > 0 ||
            view360Result.value.timelinePreview.length > 0;
          setView360State(has360Data ? 'success' : 'empty');
        } else {
          const error = view360Result.reason;
          if (error instanceof ApiClientError && error.kind === 'forbidden') {
            setView360State('forbidden');
          } else {
            setView360Error(
              error instanceof Error ? error.message : 'Failed to load customer 360 view',
            );
            setView360State('error');
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load customer');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [customerId, onLoaded]);

  if (state === 'loading') {
    return (
      <p className="state-message" data-testid="customer-detail-loading">
        Müşteri yükleniyor…
      </p>
    );
  }

  if (state === 'forbidden') {
    return (
      <p className="state-message state-message--error" data-testid="customer-detail-forbidden">
        Bu müşteriyi görüntüleme yetkiniz yok.
      </p>
    );
  }

  if (state === 'error' || !customer) {
    return (
      <p className="state-message state-message--error" data-testid="customer-detail-error">
        {errorMessage}
      </p>
    );
  }

  const notes = customer360?.notes ?? customer.notes;
  const files = customer360?.files ?? customer.files;

  const layoutClass =
    variant === 'slide-over'
      ? 'customer-detail-layout customer-detail-layout--bitrix360'
      : 'customer-detail-layout';

  if (variant === 'slide-over') {
    const scoreValue = primaryScore(customer360);
    const scorePercent = scoreValue ?? 0;

    return (
      <section className="customer-detail-slide" data-testid="customer-detail">
        <header className="customer-detail-hero">
          <div className="customer-detail-hero__identity">
            <span className="customer-detail-hero__avatar" aria-hidden>
              {customer.displayName.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="customer-detail-hero__name">{customer.displayName}</h2>
              <div className="customer-detail-hero__meta">
                <span className={statusPillClass(customer.status)}>{statusLabelTr(customer.status)}</span>
                <span className="customer-detail-hero__dot">·</span>
                <span className="customer-detail-hero__muted">
                  {customer.email ?? 'E-posta yok'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="detail-metrics">
          <article className="detail-metric-card">
            <div
              className="metric-gauge"
              style={{
                background: `conic-gradient(var(--crm-accent) ${scorePercent * 3.6}deg, var(--crm-border) 0)`,
              }}
            >
              <span className="metric-gauge__inner">{scoreValue ?? '—'}</span>
            </div>
            <div>
              <p className="detail-metric-card__label">360° Skor</p>
              <p className="detail-metric-card__value">{scoreValue != null ? `${scoreValue}/100` : 'Veri yok'}</p>
            </div>
          </article>
          <article className="detail-metric-card">
            <p className="detail-metric-card__label">Risk seviyesi</p>
            <p className="detail-metric-card__value" data-testid="customer-360-risk">
              {customer360?.riskScore
                ? `${customer360.riskScore.riskLevel} · ${customer360.riskScore.riskScore}`
                : 'Düşük'}
            </p>
          </article>
          <article className="detail-metric-card">
            <p className="detail-metric-card__label">Tahmini LTV</p>
            <p className="detail-metric-card__value" data-testid="customer-360-ltv">
              {customer360?.lifetimeValue
                ? `${customer360.lifetimeValue.ltvValue.toLocaleString('tr-TR')} ${customer360.lifetimeValue.currency}`
                : '—'}
            </p>
          </article>
          <article className="detail-metric-card">
            <p className="detail-metric-card__label">İlişki süresi</p>
            <p className="detail-metric-card__value">{relationshipDays(customer.createdAt)} gün</p>
          </article>
        </div>

        <nav className="detail-tabs" aria-label="Müşteri sekmeleri">
          <span className="detail-tabs__tab detail-tabs__tab--active">Genel Bakış</span>
          <span className="detail-tabs__tab">Aktiviteler</span>
          <span className="detail-tabs__tab detail-tabs__tab--soon">Notlar</span>
          <span className="detail-tabs__tab detail-tabs__tab--soon">Dosyalar</span>
        </nav>

        <section className={layoutClass}>
        <aside className="customer-360__left" data-testid="customer-360-contacts">
          <h3 className="customer-360__section-title">İletişim bilgileri</h3>
          <dl className="customer-360__facts">
            <div>
              <dt>E-posta</dt>
              <dd>{customer.email ?? '—'}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{customer.phone ?? '—'}</dd>
            </div>
            <div>
              <dt>Durum</dt>
              <dd>
                <span className={statusPillClass(customer.status)}>
                  {statusLabelTr(customer.status)}
                </span>
              </dd>
            </div>
          </dl>
          <section className="customer-360__block" data-testid="customer-360-tags">
            <h3>Etiketler</h3>
            {customer.tags.length === 0 ? (
              <p className="customer-360__empty">Etiket yok</p>
            ) : (
              <div className="tag-list">
                {customer.tags.map((tag) => (
                  <span key={tag.id} className="tag-list__item">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </section>
          <section className="customer-360__block" data-testid="customer-360-notes">
            <h3>Notlar</h3>
            {notes.length === 0 ? (
              <p className="customer-360__empty">Not yok</p>
            ) : (
              <ul className="customer-360__list">
                {notes.map((note) => (
                  <li key={note.id}>
                    <strong>{note.title ?? 'Not'}</strong>
                    <p>{note.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <div className="customer-360__center">
          <h3 className="customer-360__section-title">Son aktiviteler</h3>
          <CustomerTimelineSection customerId={customerId} variant="feed" />
        </div>

        <aside className="customer-360__right">
          <section className="card customer-360__insights" data-testid="customer-360-panel">
            <h3>Müşteri 360</h3>
            {view360State === 'success' && customer360 ? (
              <ul className="insight-list">
                {customer360.scores.map((score) => (
                  <li key={score.id} data-testid="customer-360-scores">
                    <span>{score.metricCode}</span>
                    <strong>{score.scoreValue}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="customer-360__empty" data-testid="customer-360-empty">
                Henüz analitik veri yok.
              </p>
            )}
          </section>
          <AiAssistDock />
          {onClose ? (
            <button type="button" className="btn-ghost btn-ghost--full" onClick={onClose}>
              Listeye dön
            </button>
          ) : null}
        </aside>
        </section>
      </section>
    );
  }

  return (
    <section className={layoutClass} data-testid="customer-detail">
      <div className="customer-detail-layout__workspace">
        <p className="customer-detail-layout__breadcrumb">
          <Link href="/customers">Customers</Link> / {customer.displayName}
        </p>
        <h1>{customer.displayName}</h1>
        <p>
          {customer.email ?? '—'} · {customer.phone ?? '—'} · {customer.status}
        </p>

      <section className="card" data-testid="customer-360-panel">
        <h2>Customer 360</h2>

        {view360State === 'loading' && (
          <p className="state-message" data-testid="customer-360-loading">
            Loading customer 360…
          </p>
        )}

        {view360State === 'forbidden' && (
          <p className="state-message state-message--error" data-testid="customer-360-forbidden">
            You do not have permission to view customer 360 data.
          </p>
        )}

        {view360State === 'error' && (
          <p className="state-message state-message--error" data-testid="customer-360-error">
            {view360Error}
          </p>
        )}

        {view360State === 'empty' && (
          <p className="state-message" data-testid="customer-360-empty">
            No customer 360 analytics data yet.
          </p>
        )}

        {view360State === 'success' && customer360 && (
          <>
            <section data-testid="customer-360-scores">
              <h3>Scores</h3>
              {customer360.scores.length === 0 ? (
                <p>No scores</p>
              ) : (
                <ul>
                  {customer360.scores.map((score) => (
                    <li key={score.id}>
                      {score.metricCode}: {score.scoreValue}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section data-testid="customer-360-risk">
              <h3>Risk</h3>
              {customer360.riskScore ? (
                <p>
                  {customer360.riskScore.riskLevel} · {customer360.riskScore.riskScore}
                </p>
              ) : (
                <p>No risk score</p>
              )}
            </section>

            <section data-testid="customer-360-ltv">
              <h3>Lifetime value</h3>
              {customer360.lifetimeValue ? (
                <p>
                  {customer360.lifetimeValue.ltvValue} {customer360.lifetimeValue.currency}
                </p>
              ) : (
                <p>No lifetime value</p>
              )}
            </section>

            <section data-testid="customer-360-timeline-preview">
              <h3>Timeline preview</h3>
              {customer360.timelinePreview.length === 0 ? (
                <p>No timeline preview</p>
              ) : (
                <ul>
                  {customer360.timelinePreview.map((event) => (
                    <li key={event.id}>
                      {event.title} · {event.eventType} · {event.occurredAt}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </section>

      <section className="card" data-testid="customer-360-contacts">
        <h2>Contacts</h2>
        {customer.contacts.length === 0 ? (
          <p>No contacts</p>
        ) : (
          <ul>
            {customer.contacts.map((contact) => (
              <li key={contact.id}>
                {contact.firstName} {contact.lastName} · {contact.email ?? '—'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-addresses">
        <h2>Addresses</h2>
        {customer.addresses.length === 0 ? (
          <p>No addresses</p>
        ) : (
          <ul>
            {customer.addresses.map((address) => (
              <li key={address.id}>
                {address.line1}, {address.city ?? '—'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-tags">
        <h2>Tags</h2>
        {customer.tags.length === 0 ? (
          <p>No tags</p>
        ) : (
          <ul>
            {customer.tags.map((tag) => (
              <li key={tag.id}>{tag.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-notes">
        <h2>Notes</h2>
        {notes.length === 0 ? (
          <p>No notes</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title ?? 'Note'}</strong>: {note.body}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" data-testid="customer-360-files">
        <h2>Files (metadata only)</h2>
        {files.length === 0 ? (
          <p>No files</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file.id}>
                {file.fileName} · {file.mimeType ?? 'unknown'} · {file.byteSize ?? 0} bytes
              </li>
            ))}
          </ul>
        )}
        <p data-testid="no-file-upload-control">Upload not available in Sprint-03.</p>
      </section>

      <CustomerTimelineSection customerId={customerId} />
      </div>
      <AiAssistDock />
    </section>
  );
}
