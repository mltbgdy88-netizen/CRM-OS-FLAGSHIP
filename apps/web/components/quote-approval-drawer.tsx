'use client';

import { useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { approveQuote } from '../lib/api/quotes-client';
import { SlideOver } from './slide-over';

interface QuoteApprovalDrawerProps {
  quoteId: string;
  open: boolean;
  onClose: () => void;
  onDecision?: (decision: 'approved' | 'rejected') => void;
}

export function QuoteApprovalDrawer({
  quoteId,
  open,
  onClose,
  onDecision,
}: QuoteApprovalDrawerProps) {
  const [notes, setNotes] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'error' | 'forbidden'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(decision: 'approved' | 'rejected') {
    setState('submitting');
    setErrorMessage('');
    try {
      await approveQuote(quoteId, {
        decision,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      setState('idle');
      onDecision?.(decision);
      onClose();
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Onay işlemi başarısız');
      setState('error');
    }
  }

  function handleClose() {
    if (state === 'submitting') {
      return;
    }
    setNotes('');
    setState('idle');
    setErrorMessage('');
    onClose();
  }

  return (
    <SlideOver
      open={open}
      title="Teklif Onayı"
      onClose={handleClose}
      testId="quote-approval-drawer"
    >
      <div className="customer-create-form" data-testid="quote-approval-form">
        {state === 'forbidden' ? (
          <p className="state-message state-message--forbidden" data-testid="quote-approval-forbidden">
            Teklif onaylama yetkiniz yok.
          </p>
        ) : (
          <>
            <p className="detail-tab-panel__empty">
              Bu teklif için onay veya red kararı verin. İsteğe bağlı not ekleyebilirsiniz.
            </p>
            <label>
              Not
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Onay veya red gerekçesi…"
                disabled={state === 'submitting'}
                aria-label="Onay notu"
                data-testid="quote-approval-notes"
              />
            </label>
            {state === 'error' ? (
              <p className="state-message state-message--error" data-testid="quote-approval-error">
                {errorMessage}
              </p>
            ) : null}
            <footer className="detail-slide-footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleClose}
                disabled={state === 'submitting'}
              >
                İptal
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => void submit('rejected')}
                disabled={state === 'submitting'}
                data-testid="quote-approval-reject"
              >
                Reddet
              </button>
              <button
                type="button"
                className="btn-accent-green"
                onClick={() => void submit('approved')}
                disabled={state === 'submitting'}
                data-testid="quote-approval-approve"
              >
                {state === 'submitting' ? 'Kaydediliyor…' : 'Onayla'}
              </button>
            </footer>
          </>
        )}
      </div>
    </SlideOver>
  );
}
