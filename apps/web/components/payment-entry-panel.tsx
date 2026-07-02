'use client';

import { useState } from 'react';
import type { AccountSummary } from '../lib/api/finance-client';
import { formatCurrency } from '../lib/api/finance-client';

interface PaymentEntryPanelProps {
  accounts: AccountSummary[];
  embedded?: boolean;
}

export function PaymentEntryPanel({ accounts, embedded = false }: PaymentEntryPanelProps) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedAccount = accounts.find((account) => account.id === accountId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      className={embedded ? 'entity-section' : 'workspace-card entity-page'}
      data-testid="payment-entry-panel"
    >
      {!embedded && <h2 className="entity-section__title">Tahsilat Girişi</h2>}
      <p className="entity-page__subtitle">
        Tahsilat kaydı arayüzü — ödeme API&apos;si sonraki sprintte eklenecek.
      </p>

      {accounts.length === 0 ? (
        <p className="state-message state-message--empty" data-testid="payment-entry-empty">
          Tahsilat girişi için cari hesap bulunamadı.
        </p>
      ) : (
        <form className="entity-form" onSubmit={handleSubmit}>
          <label className="entity-form__field">
            <span>Cari Hesap</span>
            <select
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value);
                setSubmitted(false);
              }}
              data-testid="payment-entry-account"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.code})
                </option>
              ))}
            </select>
          </label>

          {selectedAccount && (
            <p className="entity-form__hint" data-testid="payment-entry-balance">
              Güncel bakiye: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
            </p>
          )}

          <label className="entity-form__field">
            <span>Tutar</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setSubmitted(false);
              }}
              data-testid="payment-entry-amount"
              required
            />
          </label>

          <label className="entity-form__field">
            <span>Referans / Açıklama</span>
            <input
              type="text"
              value={reference}
              onChange={(event) => {
                setReference(event.target.value);
                setSubmitted(false);
              }}
              data-testid="payment-entry-reference"
            />
          </label>

          <button type="submit" className="btn btn--primary" data-testid="payment-entry-submit">
            Tahsilat Kaydet (Önizleme)
          </button>

          {submitted && amount && (
            <p className="state-message state-message--success" data-testid="payment-entry-preview">
              Önizleme: {formatCurrency(Number(amount))} — {reference || 'Tahsilat'} (
              {selectedAccount?.name})
            </p>
          )}
        </form>
      )}
    </section>
  );
}
