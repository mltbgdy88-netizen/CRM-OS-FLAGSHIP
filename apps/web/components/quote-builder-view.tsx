'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  getQuote,
  sendQuote,
  type QuoteDetail,
} from '../lib/api/quotes-client';
import { quoteStatusClass, quoteStatusLabel } from '../lib/mock/quotes-mock';
import { QuoteApprovalDrawer } from './quote-approval-drawer';
import { TableSkeleton } from './table-skeleton';

interface QuoteBuilderViewProps {
  quoteId: string;
}

function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QuoteBuilderView({ quoteId }: QuoteBuilderViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'forbidden'>(
    'idle',
  );
  const [sendError, setSendError] = useState('');

  const loadQuote = useCallback(async () => {
    setState('loading');
    try {
      const result = await getQuote(quoteId);
      setQuote(result);
      setState('success');
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      if (error instanceof ApiClientError && error.kind === 'not_found') {
        setErrorMessage('Teklif bulunamadı.');
        setState('error');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Teklif yüklenemedi');
      setState('error');
    }
  }, [quoteId]);

  useEffect(() => {
    void loadQuote();
  }, [loadQuote]);

  async function handleSend() {
    setSendState('sending');
    setSendError('');
    try {
      const updated = await sendQuote(quoteId);
      setQuote((current) => (current ? { ...current, ...updated } : current));
      setSendState('sent');
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setSendState('forbidden');
        return;
      }
      setSendError(error instanceof Error ? error.message : 'Teklif gönderilemedi');
      setSendState('error');
    }
  }

  function handleApprovalDecision() {
    void loadQuote();
  }

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-builder">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">Teklif Oluşturucu</h1>
          </div>
        </header>
        <TableSkeleton rows={6} testId="quote-builder-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-builder">
        <p className="state-message state-message--forbidden" data-testid="quote-builder-forbidden">
          Teklif detayını görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error' || !quote) {
    return (
      <section className="workspace-card entity-page" data-testid="quote-builder">
        <p className="state-message state-message--error" data-testid="quote-builder-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="quote-builder">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">{quote.number}</h1>
          <span className={quoteStatusClass(quote.status)}>{quoteStatusLabel(quote.status)}</span>
        </div>
        <div className="entity-page__header-actions">
          <Link href="/quotes" className="btn-ghost">
            ← Liste
          </Link>
          <Link
            href={`/quotes/${quoteId}/preview`}
            className="btn-ghost"
            data-testid="quote-preview-link"
          >
            PDF Önizleme
          </Link>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setApprovalOpen(true)}
            data-testid="quote-approval-open"
          >
            Onay
          </button>
          <button
            type="button"
            className="btn-accent-green"
            onClick={() => void handleSend()}
            disabled={sendState === 'sending' || quote.status !== 'draft'}
            data-testid="quote-send-button"
          >
            {sendState === 'sending' ? 'Gönderiliyor…' : 'Gönder'}
          </button>
        </div>
      </header>

      {sendState === 'forbidden' ? (
        <p className="state-message state-message--forbidden" data-testid="quote-send-forbidden">
          Teklif gönderme yetkiniz yok.
        </p>
      ) : null}
      {sendState === 'error' ? (
        <p className="state-message state-message--error" data-testid="quote-send-error">
          {sendError}
        </p>
      ) : null}
      {sendState === 'sent' ? (
        <p className="state-message" data-testid="quote-send-success">
          Teklif gönderildi.
        </p>
      ) : null}

      <dl className="detail-info-grid" data-testid="quote-builder-header">
        <div>
          <dt>Müşteri</dt>
          <dd>{quote.customerName}</dd>
        </div>
        <div>
          <dt>Para birimi</dt>
          <dd>{quote.currencyCode}</dd>
        </div>
        <div>
          <dt>Marj</dt>
          <dd>%{quote.marginPercent}</dd>
        </div>
        <div>
          <dt>Oluşturulma</dt>
          <dd>{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</dd>
        </div>
      </dl>

      <h2 className="customer-360__section-title">Kalemler</h2>
      {quote.items.length === 0 ? (
        <p className="detail-tab-panel__empty" data-testid="quote-builder-items-empty">
          Kalem kaydı yok.
        </p>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="quote-builder-items">
            <thead>
              <tr>
                <th>Ürün / Hizmet</th>
                <th>Miktar</th>
                <th>Birim fiyat</th>
                <th>Satır toplamı</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} data-testid={`quote-item-${item.id}`}>
                  <td>
                    <span className="data-table__primary">{item.name}</span>
                    {item.description ? (
                      <span className="data-table__muted"> — {item.description}</span>
                    ) : null}
                  </td>
                  <td>{item.quantity}</td>
                  <td className="data-table__muted">
                    {formatAmount(item.unitPrice, quote.currencyCode)}
                  </td>
                  <td className="data-table__primary">
                    {formatAmount(item.lineTotal, quote.currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="customer-360__section-title">Fiyat özeti</h2>
      <dl className="detail-info-grid" data-testid="quote-builder-summary">
        <div>
          <dt>Ara toplam</dt>
          <dd>{formatAmount(quote.subtotal, quote.currencyCode)}</dd>
        </div>
        <div>
          <dt>İndirim</dt>
          <dd>{formatAmount(quote.discountTotal, quote.currencyCode)}</dd>
        </div>
        <div>
          <dt>Vergi</dt>
          <dd>{formatAmount(quote.taxTotal, quote.currencyCode)}</dd>
        </div>
        <div>
          <dt>Genel toplam</dt>
          <dd className="data-table__primary">
            {formatAmount(quote.total, quote.currencyCode)}
          </dd>
        </div>
      </dl>

      {quote.notes ? (
        <>
          <h2 className="customer-360__section-title">Notlar</h2>
          <p className="detail-tab-panel__empty" data-testid="quote-builder-notes">
            {quote.notes}
          </p>
        </>
      ) : null}

      <QuoteApprovalDrawer
        quoteId={quoteId}
        open={approvalOpen}
        onClose={() => setApprovalOpen(false)}
        onDecision={handleApprovalDecision}
      />
    </section>
  );
}
