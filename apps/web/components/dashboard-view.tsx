'use client';

import {
  formatCurrencyShort,
  RevenueAreaChart,
  SparklineChart,
  useAnimatedMetric,
  type RevenueMonth,
} from './dashboard-charts';

const KPI_CARDS = [
  {
    id: 'revenue',
    label: 'Toplam Gelir',
    target: 2_400_000,
    format: 'currency' as const,
    trend: '+12.5%',
    trendUp: true,
    icon: '₺',
    tone: 'orange' as const,
    spark: [1.52, 1.58, 1.61, 1.72, 1.78, 1.85, 1.92, 2.05, 2.12, 2.28, 2.35, 2.4],
  },
  {
    id: 'opportunities',
    label: 'Açık Fırsatlar',
    target: 48,
    format: 'number' as const,
    trend: '+8.2%',
    trendUp: true,
    icon: '◆',
    tone: 'blue' as const,
    spark: [28, 31, 30, 34, 36, 35, 39, 41, 43, 44, 46, 48],
  },
  {
    id: 'winrate',
    label: 'Kazanma Oranı',
    target: 34,
    format: 'percent' as const,
    trend: '-2.1%',
    trendUp: false,
    icon: '◎',
    tone: 'green' as const,
    spark: [38, 37, 36, 35, 36, 35, 34, 35, 34, 33, 34, 34],
  },
  {
    id: 'tasks',
    label: 'Bekleyen Görevler',
    target: 17,
    format: 'number' as const,
    trend: '+3',
    trendUp: true,
    icon: '☑',
    tone: 'purple' as const,
    spark: [9, 10, 11, 12, 11, 13, 14, 15, 14, 16, 15, 17],
  },
];

const REVENUE_MONTHLY: RevenueMonth[] = [
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

const PIPELINE_STAGES = [
  { label: 'Yeni Lead', value: 24, amount: '₺840K', color: '#3b82f6' },
  { label: 'İletişimde', value: 18, amount: '₺620K', color: '#60a5fa' },
  { label: 'Teklif', value: 12, amount: '₺1.1M', color: '#ff6a00' },
  { label: 'Pazarlık', value: 8, amount: '₺480K', color: '#a855f7' },
  { label: 'Kazanıldı', value: 6, amount: '₺320K', color: '#22c55e' },
];

const RECENT_ACTIVITIES = [
  { id: '1', title: 'Yeni müşteri eklendi', meta: 'Acme Teknoloji · 15 dk önce', icon: '◎' },
  { id: '2', title: 'Teklif gönderildi', meta: 'Beta Yazılım · 1 saat önce', icon: '▤' },
  { id: '3', title: 'Toplantı planlandı', meta: 'Selin Yılmaz · 2 saat önce', icon: '▦' },
  { id: '4', title: 'Ödeme alındı', meta: '₺45.000 · 3 saat önce', icon: '₺' },
];

const UPCOMING_EVENTS = [
  { id: '1', time: '10:00', title: 'Demo görüşmesi', customer: 'Acme Teknoloji' },
  { id: '2', time: '14:30', title: 'Sözleşme yenileme', customer: 'Beta Yazılım' },
  { id: '3', time: '16:00', title: 'Haftalık pipeline', customer: 'Ekip' },
];

function KpiCard({
  label,
  target,
  format,
  trend,
  trendUp,
  icon,
  tone,
  spark,
}: (typeof KPI_CARDS)[number]) {
  const animated = useAnimatedMetric(target);
  const displayValue =
    format === 'currency'
      ? formatCurrencyShort(animated)
      : format === 'percent'
        ? `%${Math.round(animated)}`
        : String(Math.round(animated));

  return (
    <article className={`dashboard-kpi dashboard-kpi--${tone}`}>
      <div className="dashboard-kpi__main">
        <div className="dashboard-kpi__top">
          <span className="dashboard-kpi__icon" aria-hidden>
            {icon}
          </span>
          <span
            className={
              trendUp ? 'dashboard-kpi__trend dashboard-kpi__trend--up' : 'dashboard-kpi__trend dashboard-kpi__trend--down'
            }
          >
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        </div>
        <p className="dashboard-kpi__label">{label}</p>
        <p className="dashboard-kpi__value">{displayValue}</p>
        <p className="dashboard-kpi__period">Son 30 gün</p>
      </div>
      <SparklineChart values={spark} tone={tone} className="dashboard-kpi__spark" />
    </article>
  );
}

export function DashboardView() {
  const maxPipeline = Math.max(...PIPELINE_STAGES.map((s) => s.value));

  return (
    <section className="workspace-card dashboard-page" data-testid="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__greeting">Hoş geldiniz, Ahmet!</p>
          <h1 className="dashboard-page__title">Gösterge Paneli</h1>
          <p className="dashboard-page__subtitle">Canlı satış özeti · güncellenme: az önce</p>
        </div>
        <span className="dashboard-page__live-badge">
          <span className="dashboard-page__live-dot" aria-hidden />
          Canlı önizleme
        </span>
      </header>

      <div className="dashboard-kpi-grid">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.id} {...card} />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-card--wide dashboard-card--chart">
          <header className="dashboard-card__header">
            <div>
              <h2>Gelir Trendi</h2>
              <p className="dashboard-card__hint">Aylık kapanan gelir · TRY</p>
            </div>
            <div className="dashboard-card__legend">
              <span className="dashboard-card__legend-item dashboard-card__legend-item--primary">
                Gelir
              </span>
              <span className="dashboard-card__legend-item">Hedef: ₺2.5M</span>
            </div>
          </header>
          <RevenueAreaChart data={REVENUE_MONTHLY} />
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <h2>Satış Pipeline</h2>
          </header>
          <div className="dashboard-pipeline" data-testid="dashboard-pipeline">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.label} className="dashboard-pipeline__row">
                <span className="dashboard-pipeline__label">{stage.label}</span>
                <div className="dashboard-pipeline__bar-wrap">
                  <div
                    className="dashboard-pipeline__bar"
                    style={{
                      width: `${(stage.value / maxPipeline) * 100}%`,
                      background: stage.color,
                    }}
                  />
                </div>
                <span className="dashboard-pipeline__meta">
                  {stage.value} · {stage.amount}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <h2>Son Aktiviteler</h2>
          </header>
          <ul className="dashboard-feed">
            {RECENT_ACTIVITIES.map((item) => (
              <li key={item.id} className="dashboard-feed__item">
                <span className="dashboard-feed__icon" aria-hidden>
                  {item.icon}
                </span>
                <div>
                  <p className="dashboard-feed__title">{item.title}</p>
                  <p className="dashboard-feed__meta">{item.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <h2>Yaklaşan Etkinlikler</h2>
          </header>
          <ul className="dashboard-events">
            {UPCOMING_EVENTS.map((event) => (
              <li key={event.id} className="dashboard-events__item">
                <time className="dashboard-events__time">{event.time}</time>
                <div>
                  <p className="dashboard-events__title">{event.title}</p>
                  <p className="dashboard-events__meta">{event.customer}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--ai">
          <header className="dashboard-card__header">
            <span className="dashboard-ai__avatar" aria-hidden>
              ✦
            </span>
            <div>
              <h2>AI Asistan</h2>
              <p className="dashboard-card__hint">Hızlı öngörüler</p>
            </div>
          </header>
          <p className="dashboard-ai__text">
            Bu hafta 3 yüksek potansiyelli lead takip bekliyor. Pipeline&apos;daki teklif aşamasındaki
            2 fırsat için demo planlamanız önerilir.
          </p>
          <div className="dashboard-ai__actions">
            <button type="button" className="btn-ghost btn-ghost--compact" disabled>
              Lead analizi
            </button>
            <button type="button" className="btn-accent-green btn-accent-green--compact" disabled>
              Önerileri gör
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
