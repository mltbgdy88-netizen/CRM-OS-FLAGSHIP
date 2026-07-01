'use client';

import { useState } from 'react';
import {
  formatCurrencyShort,
  RevenueAreaChart,
  SparklineChart,
  type RevenueMonth,
} from './dashboard-charts';
import { MockPreviewBadge } from './mock-preview-badge';

type ReportTab = 'sales' | 'team' | 'performance';

const REVENUE_DATA: RevenueMonth[] = [
  { month: 'Oca', value: 1.62 },
  { month: 'Şub', value: 1.74 },
  { month: 'Mar', value: 1.68 },
  { month: 'Nis', value: 1.86 },
  { month: 'May', value: 1.92 },
  { month: 'Haz', value: 2.05 },
  { month: 'Tem', value: 1.98 },
  { month: 'Ağu', value: 2.14 },
  { month: 'Eyl', value: 2.08 },
  { month: 'Eki', value: 2.22 },
  { month: 'Kas', value: 2.31 },
  { month: 'Ara', value: 2.4 },
];

const SOURCE_BREAKDOWN = [
  { label: 'Referans', value: 34, color: '#ff6a00' },
  { label: 'Web', value: 28, color: '#3b82f6' },
  { label: 'LinkedIn', value: 18, color: '#60a5fa' },
  { label: 'Fuar', value: 12, color: '#a855f7' },
  { label: 'Diğer', value: 8, color: '#64748b' },
];

const TEAM_ROWS = [
  { name: 'Ahmet Yılmaz', deals: 12, revenue: '₺920K', winRate: '%38' },
  { name: 'Selin Yılmaz', deals: 15, revenue: '₺1.1M', winRate: '%42' },
  { name: 'Mehmet Ak', deals: 9, revenue: '₺640K', winRate: '%31' },
];

function DonutChart() {
  const total = SOURCE_BREAKDOWN.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="reports-donut" data-testid="reports-donut">
      <svg viewBox="0 0 140 140" className="reports-donut__svg" aria-hidden>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {SOURCE_BREAKDOWN.map((segment) => {
          const length = (segment.value / total) * circumference;
          const dasharray = `${length} ${circumference - length}`;
          const dashoffset = -offset;
          offset += length;
          return (
            <circle
              key={segment.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="16"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 70 70)"
            />
          );
        })}
      </svg>
      <ul className="reports-donut__legend">
        {SOURCE_BREAKDOWN.map((segment) => (
          <li key={segment.label}>
            <span className="reports-donut__swatch" style={{ background: segment.color }} />
            {segment.label} · %{segment.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportsView() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');

  return (
    <section className="workspace-card reports-page" data-testid="reports-page">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Raporlar</h1>
          <span className="entity-page__count">Analitik özet</span>
        </div>
        <MockPreviewBadge />
      </header>

      <nav className="reports-tabs" aria-label="Rapor kategorileri">
        {(
          [
            ['sales', 'Satış'],
            ['team', 'Ekip'],
            ['performance', 'Performans'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? 'reports-tabs__tab reports-tabs__tab--active' : 'reports-tabs__tab'}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="reports-kpi-grid">
        <article className="dashboard-kpi dashboard-kpi--orange">
          <div className="dashboard-kpi__main">
            <p className="dashboard-kpi__label">Gelir (YTD)</p>
            <p className="dashboard-kpi__value">{formatCurrencyShort(2_400_000)}</p>
            <p className="dashboard-kpi__period">▲ %12.5</p>
          </div>
          <SparklineChart
            values={[1.52, 1.58, 1.72, 1.85, 1.92, 2.05, 2.14, 2.22, 2.31, 2.4]}
            tone="orange"
            className="dashboard-kpi__spark"
          />
        </article>
        <article className="dashboard-kpi dashboard-kpi--blue">
          <div className="dashboard-kpi__main">
            <p className="dashboard-kpi__label">Açık pipeline</p>
            <p className="dashboard-kpi__value">₺1.9M</p>
            <p className="dashboard-kpi__period">11 fırsat</p>
          </div>
          <SparklineChart values={[28, 31, 34, 36, 39, 41, 43, 44, 46, 48]} tone="blue" className="dashboard-kpi__spark" />
        </article>
        <article className="dashboard-kpi dashboard-kpi--green">
          <div className="dashboard-kpi__main">
            <p className="dashboard-kpi__label">Kazanma oranı</p>
            <p className="dashboard-kpi__value">%34</p>
            <p className="dashboard-kpi__period">Son 90 gün</p>
          </div>
          <SparklineChart values={[38, 37, 36, 35, 34, 35, 34, 33, 34, 34]} tone="green" className="dashboard-kpi__spark" />
        </article>
        <article className="dashboard-kpi dashboard-kpi--purple">
          <div className="dashboard-kpi__main">
            <p className="dashboard-kpi__label">Ort. döngü</p>
            <p className="dashboard-kpi__value">42g</p>
            <p className="dashboard-kpi__period">Lead → kapanış</p>
          </div>
          <SparklineChart values={[52, 48, 46, 45, 44, 43, 42, 43, 42, 42]} tone="purple" className="dashboard-kpi__spark" />
        </article>
      </div>

      {activeTab === 'sales' && (
        <div className="reports-grid">
          <article className="dashboard-card dashboard-card--wide dashboard-card--chart">
            <header className="dashboard-card__header">
              <h2>Gelir Trendi</h2>
              <p className="dashboard-card__hint">Aylık kapanan gelir</p>
            </header>
            <RevenueAreaChart data={REVENUE_DATA} />
          </article>
          <article className="dashboard-card">
            <header className="dashboard-card__header">
              <h2>Fırsat Kaynakları</h2>
            </header>
            <DonutChart />
          </article>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="data-table-wrap data-table-wrap--flush" data-testid="reports-team-table">
          <table className="data-table data-table--premium">
            <thead>
              <tr>
                <th>Satış temsilcisi</th>
                <th>Fırsat</th>
                <th>Gelir</th>
                <th>Kazanma</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_ROWS.map((row) => (
                <tr key={row.name} className="data-table__row">
                  <td className="data-table__primary">{row.name}</td>
                  <td>{row.deals}</td>
                  <td>{row.revenue}</td>
                  <td>{row.winRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="reports-performance">
          <article className="dashboard-card">
            <h2>SLA &amp; Hizmet</h2>
            <ul className="reports-metric-list">
              <li>
                <span>Ort. yanıt süresi</span>
                <strong>2.4 saat</strong>
              </li>
              <li>
                <span>Çözüm oranı</span>
                <strong>%91</strong>
              </li>
              <li>
                <span>Açık destek talebi</span>
                <strong>7</strong>
              </li>
            </ul>
          </article>
          <article className="dashboard-card">
            <h2>Satış verimliliği</h2>
            <ul className="reports-metric-list">
              <li>
                <span>Teklif → kapanış</span>
                <strong>%28</strong>
              </li>
              <li>
                <span>Ort. teklif marjı</span>
                <strong>%24</strong>
              </li>
              <li>
                <span>Aktif görev</span>
                <strong>17</strong>
              </li>
            </ul>
          </article>
        </div>
      )}

      <footer className="entity-footer">
        <p className="entity-footer__hint" data-testid="reports-mock-notice">
          Demo analitik — export kapalı (canon). Gerçek rapor API Sprint-09 ile gelecek.
        </p>
      </footer>
    </section>
  );
}
