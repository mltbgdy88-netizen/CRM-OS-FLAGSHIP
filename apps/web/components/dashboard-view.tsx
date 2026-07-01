'use client';

const KPI_CARDS = [
  {
    id: 'revenue',
    label: 'Toplam Gelir',
    value: '₺2.4M',
    trend: '+12.5%',
    trendUp: true,
    icon: '₺',
    tone: 'orange',
  },
  {
    id: 'opportunities',
    label: 'Açık Fırsatlar',
    value: '48',
    trend: '+8.2%',
    trendUp: true,
    icon: '◆',
    tone: 'blue',
  },
  {
    id: 'winrate',
    label: 'Kazanma Oranı',
    value: '%34',
    trend: '-2.1%',
    trendUp: false,
    icon: '◎',
    tone: 'green',
  },
  {
    id: 'tasks',
    label: 'Bekleyen Görevler',
    value: '17',
    trend: '+3',
    trendUp: true,
    icon: '☑',
    tone: 'purple',
  },
] as const;

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

const REVENUE_POINTS = [42, 58, 45, 72, 68, 85, 78, 92, 88, 95, 82, 100];

export function DashboardView() {
  const maxPipeline = Math.max(...PIPELINE_STAGES.map((s) => s.value));

  return (
    <section className="workspace-card dashboard-page" data-testid="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__greeting">Hoş geldiniz, Ahmet!</p>
          <h1 className="dashboard-page__title">Gösterge Paneli</h1>
          <p className="dashboard-page__subtitle">Bugünkü özet ve satış performansı</p>
        </div>
        <span className="dashboard-page__mock-badge">MOCK veri</span>
      </header>

      <div className="dashboard-kpi-grid">
        {KPI_CARDS.map((card) => (
          <article key={card.id} className={`dashboard-kpi dashboard-kpi--${card.tone}`}>
            <div className="dashboard-kpi__top">
              <span className="dashboard-kpi__icon" aria-hidden>
                {card.icon}
              </span>
              <span
                className={
                  card.trendUp ? 'dashboard-kpi__trend dashboard-kpi__trend--up' : 'dashboard-kpi__trend dashboard-kpi__trend--down'
                }
              >
                {card.trend}
              </span>
            </div>
            <p className="dashboard-kpi__label">{card.label}</p>
            <p className="dashboard-kpi__value">{card.value}</p>
            <div className="dashboard-kpi__spark" aria-hidden>
              {REVENUE_POINTS.slice(0, 8).map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-card--wide">
          <header className="dashboard-card__header">
            <h2>Gelir Trendi</h2>
            <span className="dashboard-card__hint">Son 12 ay</span>
          </header>
          <div className="dashboard-chart" data-testid="dashboard-revenue-chart">
            <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="dashboard-chart__svg">
              <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.45)" />
                  <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                </linearGradient>
              </defs>
              <polygon
                fill="url(#revenue-fill)"
                points={`0,120 ${REVENUE_POINTS.map((v, i) => `${(i / (REVENUE_POINTS.length - 1)) * 400},${120 - v}`).join(' ')} 400,120`}
              />
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                points={REVENUE_POINTS.map((v, i) => `${(i / (REVENUE_POINTS.length - 1)) * 400},${120 - v}`).join(' ')}
              />
            </svg>
          </div>
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
