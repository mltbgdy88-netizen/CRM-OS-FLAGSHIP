'use client';

import { useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import {
  formatCurrency,
  getFinanceOverview,
  listAccountTransactions,
  listAccounts,
  type AccountSummary,
  type AccountTransactionItem,
  type FinanceOverview,
} from '../lib/api/finance-client';
import { PaymentEntryPanel } from './payment-entry-panel';
import { TableSkeleton } from './table-skeleton';

type TabId = 'overview' | 'receivables' | 'payment';

export function FinanceOverviewView() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [transactions, setTransactions] = useState<AccountTransactionItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const [overviewResult, accountsResult, transactionsResult] = await Promise.all([
          getFinanceOverview(),
          listAccounts(),
          listAccountTransactions(),
        ]);
        if (cancelled) {
          return;
        }
        setOverview(overviewResult);
        setAccounts(accountsResult.items);
        setTransactions(transactionsResult.items);
        setState(overviewResult.totalAccounts === 0 ? 'empty' : 'success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Finans verileri yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="finance-overview">
        <header className="entity-page__header">
          <h1 className="entity-page__title">Finans</h1>
        </header>
        <TableSkeleton rows={4} testId="finance-overview-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="finance-overview">
        <p
          className="state-message state-message--forbidden"
          data-testid="finance-overview-forbidden"
        >
          Finans görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="finance-overview">
        <p className="state-message state-message--error" data-testid="finance-overview-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  const receivableAccounts = accounts.filter((account) => account.balance > 0);

  return (
    <section className="workspace-card entity-page" data-testid="finance-overview">
      <header className="entity-page__header">
        <div>
          <h1 className="entity-page__title">Finans</h1>
          <p className="entity-page__subtitle">Cari hesaplar, alacaklar ve tahsilat</p>
        </div>
      </header>

      <nav className="entity-tabs" aria-label="Finans sekmeleri">
        {(
          [
            { id: 'overview', label: 'Hesap Özeti' },
            { id: 'receivables', label: 'Alacaklar' },
            { id: 'payment', label: 'Tahsilat Girişi' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`entity-tabs__tab${activeTab === tab.id ? ' entity-tabs__tab--active' : ''}`}
            data-testid={`finance-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div data-testid="finance-overview-content">
          {state === 'empty' ? (
            <p className="state-message state-message--empty" data-testid="finance-overview-empty">
              Henüz cari hesap kaydı yok.
            </p>
          ) : (
            overview && (
              <>
                <div className="kpi-row" data-testid="finance-kpi-row">
                  <div className="kpi-card">
                    <span className="kpi-card__label">Cari Hesap</span>
                    <strong className="kpi-card__value">{overview.totalAccounts}</strong>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-card__label">Toplam Alacak</span>
                    <strong className="kpi-card__value">
                      {formatCurrency(overview.totalReceivables)}
                    </strong>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-card__label">Kredi Limiti</span>
                    <strong className="kpi-card__value">
                      {formatCurrency(overview.totalCreditLimit)}
                    </strong>
                  </div>
                </div>

                <section className="entity-section">
                  <h2 className="entity-section__title">Cari Hesaplar</h2>
                  <div className="data-table-wrap">
                    <table className="data-table data-table--premium">
                      <thead>
                        <tr>
                          <th>Hesap</th>
                          <th>Kod</th>
                          <th>Müşteri</th>
                          <th>Bakiye</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody data-testid="finance-account-rows">
                        {accounts.map((account) => (
                          <tr key={account.id} data-testid={`finance-account-${account.id}`}>
                            <td>{account.name}</td>
                            <td>{account.code}</td>
                            <td>{account.customer?.displayName ?? '—'}</td>
                            <td>{formatCurrency(account.balance, account.currency)}</td>
                            <td>{account.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="entity-section">
                  <h2 className="entity-section__title">Son Hareketler</h2>
                  <div className="data-table-wrap">
                    <table className="data-table data-table--premium">
                      <thead>
                        <tr>
                          <th>Tarih</th>
                          <th>Hesap</th>
                          <th>Tip</th>
                          <th>Tutar</th>
                          <th>Bakiye</th>
                        </tr>
                      </thead>
                      <tbody data-testid="finance-recent-transactions">
                        {overview.recentTransactions.map((tx) => (
                          <tr key={tx.id} data-testid={`finance-transaction-${tx.id}`}>
                            <td>{new Date(tx.transactionAt).toLocaleString('tr-TR')}</td>
                            <td>{tx.account.name}</td>
                            <td>{tx.transactionType}</td>
                            <td>{formatCurrency(tx.amount)}</td>
                            <td>{formatCurrency(tx.balanceAfter)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )
          )}
        </div>
      )}

      {activeTab === 'receivables' && (
        <div data-testid="finance-receivables-content">
          {receivableAccounts.length === 0 ? (
            <p className="state-message state-message--empty" data-testid="finance-receivables-empty">
              Açık alacak bulunmuyor.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table data-table--premium">
                <thead>
                  <tr>
                    <th>Hesap</th>
                    <th>Kod</th>
                    <th>Bakiye</th>
                    <th>Kredi Limiti</th>
                  </tr>
                </thead>
                <tbody data-testid="finance-receivable-rows">
                  {receivableAccounts.map((account) => (
                    <tr key={account.id} data-testid={`finance-receivable-${account.id}`}>
                      <td>{account.name}</td>
                      <td>{account.code}</td>
                      <td>{formatCurrency(account.balance, account.currency)}</td>
                      <td>
                        {account.creditLimit
                          ? formatCurrency(account.creditLimit.limitAmount, account.creditLimit.currency)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <section className="entity-section">
            <h2 className="entity-section__title">Hesap Hareketleri</h2>
            <div className="data-table-wrap">
              <table className="data-table data-table--premium">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Hesap</th>
                    <th>Açıklama</th>
                    <th>Tutar</th>
                  </tr>
                </thead>
                <tbody data-testid="finance-transaction-rows">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.transactionAt).toLocaleString('tr-TR')}</td>
                      <td>{tx.account.name}</td>
                      <td>{tx.description ?? tx.transactionType}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'payment' && <PaymentEntryPanel accounts={accounts} embedded />}
    </section>
  );
}
