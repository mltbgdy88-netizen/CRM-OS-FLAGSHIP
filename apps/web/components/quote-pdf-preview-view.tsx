'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { fetchQuotePdf } from '../lib/api/quotes-client';
import { TableSkeleton } from './table-skeleton';

interface QuotePdfPreviewViewProps {
  quoteId: string;
}

export function QuotePdfPreviewView({ quoteId }: QuotePdfPreviewViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      setState('loading');
      setPdfUrl(null);
      try {
        const blob = await fetchQuotePdf(quoteId);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
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
          setErrorMessage('Teklif PDF bulunamadı.');
          setState('error');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'PDF yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [quoteId]);

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-pdf-preview">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">PDF Önizleme</h1>
          </div>
        </header>
        <TableSkeleton rows={8} testId="quote-pdf-preview-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-pdf-preview">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">PDF Önizleme</h1>
          </div>
          <div className="entity-page__header-actions">
            <Link href={`/quotes/${quoteId}`} className="btn-ghost">
              ← Teklife dön
            </Link>
          </div>
        </header>
        <p
          className="state-message state-message--forbidden"
          data-testid="quote-pdf-preview-forbidden"
        >
          Teklif PDF görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="quote-pdf-preview">
        <header className="entity-page__header">
          <div className="entity-page__title-block">
            <h1 className="entity-page__title">PDF Önizleme</h1>
          </div>
          <div className="entity-page__header-actions">
            <Link href={`/quotes/${quoteId}`} className="btn-ghost">
              ← Teklife dön
            </Link>
          </div>
        </header>
        <p className="state-message state-message--error" data-testid="quote-pdf-preview-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="quote-pdf-preview">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">PDF Önizleme</h1>
        </div>
        <div className="entity-page__header-actions">
          <Link href={`/quotes/${quoteId}`} className="btn-ghost">
            ← Teklife dön
          </Link>
        </div>
      </header>

      {pdfUrl ? (
        <object
          data={pdfUrl}
          type="application/pdf"
          style={{ width: '100%', minHeight: '70vh', border: 'none' }}
          data-testid="quote-pdf-preview-object"
          aria-label="Teklif PDF önizlemesi"
        >
          <iframe
            src={pdfUrl}
            title="Teklif PDF"
            style={{ width: '100%', minHeight: '70vh', border: 'none' }}
            data-testid="quote-pdf-preview-iframe"
          />
        </object>
      ) : null}
    </section>
  );
}
