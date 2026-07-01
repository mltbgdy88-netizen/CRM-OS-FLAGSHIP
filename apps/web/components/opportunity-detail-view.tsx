'use client';

import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getOpportunity,
  type OpportunityDetail,
} from '../lib/api/opportunities-client';
import { TableSkeleton } from './table-skeleton';

interface OpportunityDetailViewProps {
  opportunityId: string;
  onClose?: () => void;
  onLoaded?: (opportunity: OpportunityDetail) => void;
}

type DetailTab = 'products' | 'contacts' | 'activities' | 'notes';

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusLabel(status: string): string {
  if (status === 'won') {
    return 'Kazanıldı';
  }
  if (status === 'lost') {
    return 'Kaybedildi';
  }
  return 'Açık';
}

function statusPillClass(status: string): string {
  if (status === 'won') {
    return 'status-pill status-pill--success';
  }
  if (status === 'lost') {
    return 'status-pill status-pill--danger';
  }
  return 'status-pill status-pill--warning';
}

function contactName(contact: { firstName: string; lastName: string }): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

export function OpportunityDetailView({
  opportunityId,
  onClose,
  onLoaded,
}: OpportunityDetailViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('products');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await getOpportunity(opportunityId);
        if (cancelled) {
          return;
        }
        setOpportunity(result);
        onLoaded?.(result);
        setState('success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'not_found') {
          setErrorMessage('Fırsat bulunamadı.');
          setState('error');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Fırsat yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [opportunityId, onLoaded]);

  if (state === 'loading') {
    return (
      <div data-testid="opportunity-detail-loading">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (state === 'forbidden') {
    return (
      <p className="state-message state-message--forbidden" data-testid="opportunity-detail-forbidden">
        Fırsat detayını görüntüleme yetkiniz yok.
      </p>
    );
  }

  if (state === 'error' || !opportunity) {
    return (
      <p className="state-message state-message--error" data-testid="opportunity-detail-error">
        {errorMessage}
      </p>
    );
  }

  return (
    <div className="customer-detail-slide" data-testid="opportunity-detail">
      <header className="customer-detail-hero">
        <div className="customer-detail-hero__identity">
          <span className="customer-detail-hero__avatar" aria-hidden>
            {opportunity.title.charAt(0).toUpperCase()}
          </span>
          <div>
            <h3 className="customer-detail-hero__name">{opportunity.title}</h3>
            <div className="customer-detail-hero__meta">
              <span className={statusPillClass(opportunity.status)}>
                {statusLabel(opportunity.status)}
              </span>
              <span className="customer-detail-hero__dot">·</span>
              <span className="customer-detail-hero__muted">{opportunity.companyName}</span>
            </div>
          </div>
        </div>
      </header>

      <dl className="detail-info-grid" data-testid="opportunity-detail-info">
        <div>
          <dt>Pipeline</dt>
          <dd>{opportunity.pipeline.name}</dd>
        </div>
        <div>
          <dt>Aşama</dt>
          <dd>{opportunity.stage.name}</dd>
        </div>
        <div>
          <dt>Tutar</dt>
          <dd>{formatAmount(opportunity.amount)}</dd>
        </div>
        <div>
          <dt>Olasılık</dt>
          <dd>%{opportunity.probability}</dd>
        </div>
        <div>
          <dt>Sahip</dt>
          <dd>{opportunity.assignedUserId ? 'Atanmış' : 'Atanmamış'}</dd>
        </div>
        <div>
          <dt>Son güncelleme</dt>
          <dd>
            {opportunity.updatedAt
              ? new Date(opportunity.updatedAt).toLocaleDateString('tr-TR')
              : new Date(opportunity.createdAt).toLocaleDateString('tr-TR')}
          </dd>
        </div>
      </dl>

      <nav className="detail-tabs" aria-label="Fırsat detay sekmeleri">
        {(
          [
            ['products', 'Ürünler'],
            ['contacts', 'Kişiler'],
            ['activities', 'Aktiviteler'],
            ['notes', 'Notlar'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={
              activeTab === id ? 'detail-tabs__tab detail-tabs__tab--active' : 'detail-tabs__tab'
            }
            onClick={() => setActiveTab(id)}
            data-testid={`opportunity-tab-${id}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="detail-tab-panel">
        {activeTab === 'products' && (
          <div data-testid="opportunity-detail-products">
            {opportunity.products.length === 0 ? (
              <p className="detail-tab-panel__empty">Ürün kaydı yok.</p>
            ) : (
              <ul className="detail-activity-list">
                {opportunity.products.map((product) => (
                  <li key={product.id} className="detail-activity-list__item">
                    <span className="detail-activity-list__dot" aria-hidden />
                    <div>
                      <p className="detail-activity-list__title">{product.name}</p>
                      <p className="detail-activity-list__meta">
                        {product.sku ? `${product.sku} · ` : ''}
                        {product.quantity} × {formatAmount(product.unitPrice)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div data-testid="opportunity-detail-contacts">
            {opportunity.contacts.length === 0 ? (
              <p className="detail-tab-panel__empty">Kişi kaydı yok.</p>
            ) : (
              <ul className="detail-activity-list">
                {opportunity.contacts.map((contact) => (
                  <li key={contact.id} className="detail-activity-list__item">
                    <span className="detail-activity-list__dot" aria-hidden />
                    <div>
                      <p className="detail-activity-list__title">
                        {contactName(contact)}
                        {contact.isPrimary ? ' (Birincil)' : ''}
                      </p>
                      <p className="detail-activity-list__meta">
                        {contact.title ? `${contact.title} · ` : ''}
                        {contact.email}
                        {contact.phone ? ` · ${contact.phone}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div data-testid="opportunity-detail-activities">
            {opportunity.activities.length === 0 ? (
              <p className="detail-tab-panel__empty">Aktivite kaydı yok.</p>
            ) : (
              <ul className="detail-activity-list">
                {opportunity.activities.map((activity) => (
                  <li key={activity.id} className="detail-activity-list__item">
                    <span className="detail-activity-list__dot" aria-hidden />
                    <div>
                      <p className="detail-activity-list__title">{activity.title}</p>
                      <p className="detail-activity-list__meta">
                        {activity.activityType}
                        {activity.dueAt
                          ? ` · ${new Date(activity.dueAt).toLocaleDateString('tr-TR')}`
                          : ''}
                      </p>
                      {activity.body ? (
                        <p className="detail-activity-list__meta">{activity.body}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div data-testid="opportunity-detail-notes">
            {opportunity.notes.length === 0 ? (
              <p className="detail-tab-panel__empty">Not kaydı yok.</p>
            ) : (
              <ul className="detail-timeline-list">
                {opportunity.notes.map((note) => (
                  <li key={note.id} className="detail-timeline-list__item">
                    <p className="detail-timeline-list__title">
                      {note.title ?? 'Not'}
                    </p>
                    <p className="detail-timeline-list__meta">
                      {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="detail-timeline-list__meta">{note.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {onClose ? (
        <footer className="detail-slide-footer">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Kapat
          </button>
        </footer>
      ) : null}
    </div>
  );
}
