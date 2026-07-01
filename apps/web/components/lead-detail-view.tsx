'use client';

import { useMemo, useState } from 'react';
import {
  getMockLead,
  leadStatusLabel,
  leadStatusPillClass,
  scoreTone,
} from '../lib/mock/leads-mock';

interface LeadDetailViewProps {
  leadId: string;
  onClose?: () => void;
}

const MOCK_ACTIVITIES = [
  { id: 'a1', title: 'İlk e-posta gönderildi', meta: 'Selin Yılmaz · 2 gün önce' },
  { id: 'a2', title: 'Telefon görüşmesi yapıldı', meta: 'Selin Yılmaz · 1 gün önce' },
  { id: 'a3', title: 'Demo talebi alındı', meta: 'Sistem · 6 saat önce' },
];

const MOCK_TIMELINE = [
  { id: 't1', title: 'Lead oluşturuldu', meta: 'Web formu üzerinden' },
  { id: 't2', title: 'Skor güncellendi', meta: 'Otomatik skorlama: +12 puan' },
  { id: 't3', title: 'Atama yapıldı', meta: 'Selin Yılmaz\'a atandı' },
];

type DetailTab = 'info' | 'activities' | 'timeline' | 'ai';

export function LeadDetailView({ leadId, onClose }: LeadDetailViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const lead = useMemo(() => getMockLead(leadId), [leadId]);

  if (!lead) {
    return (
      <p className="state-message state-message--error" data-testid="lead-detail-missing">
        Lead bulunamadı.
      </p>
    );
  }

  const daysOpen = Math.max(
    1,
    Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  );
  const conversionProbability = Math.min(95, Math.round(lead.score * 0.85));

  return (
    <div className="customer-detail-slide" data-testid="lead-detail">
      <header className="customer-detail-hero">
        <div className="customer-detail-hero__identity">
          <span className="customer-detail-hero__avatar" aria-hidden>
            {lead.displayName.charAt(0).toUpperCase()}
          </span>
          <div>
            <h3 className="customer-detail-hero__name">{lead.displayName}</h3>
            <div className="customer-detail-hero__meta">
              <span className={leadStatusPillClass(lead.status)}>
                {leadStatusLabel(lead.status)}
              </span>
              <span className="customer-detail-hero__dot">·</span>
              <span className="customer-detail-hero__muted">{lead.company}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="detail-metrics detail-metrics--compact">
        <article className="detail-metric-card">
          <span className={`metric-gauge metric-gauge--${scoreTone(lead.score)}`}>
            <span className="metric-gauge__inner">{lead.score}</span>
          </span>
          <div>
            <p className="detail-metric-card__label">Lead skoru</p>
            <p className="detail-metric-card__value">Yüksek potansiyel</p>
          </div>
        </article>
        <article className="detail-metric-card">
          <span className="metric-gauge metric-gauge--blue">
            <span className="metric-gauge__inner">{daysOpen}g</span>
          </span>
          <div>
            <p className="detail-metric-card__label">Açık süre</p>
            <p className="detail-metric-card__value">{daysOpen} gün</p>
          </div>
        </article>
        <article className="detail-metric-card">
          <span className="metric-gauge metric-gauge--green">
            <span className="metric-gauge__inner">3</span>
          </span>
          <div>
            <p className="detail-metric-card__label">Aktivite</p>
            <p className="detail-metric-card__value">Bu hafta</p>
          </div>
        </article>
        <article className="detail-metric-card">
          <span className="metric-gauge metric-gauge--orange">
            <span className="metric-gauge__inner">%{conversionProbability}</span>
          </span>
          <div>
            <p className="detail-metric-card__label">Dönüşüm</p>
            <p className="detail-metric-card__value">AI tahmini</p>
          </div>
        </article>
      </div>

      <nav className="detail-tabs" aria-label="Lead detay sekmeleri">
        {(
          [
            ['info', 'Bilgi'],
            ['activities', 'Aktiviteler'],
            ['timeline', 'Zaman çizelgesi'],
            ['ai', 'AI'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={
              activeTab === id ? 'detail-tabs__tab detail-tabs__tab--active' : 'detail-tabs__tab'
            }
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="detail-tab-panel">
        {activeTab === 'info' && (
          <dl className="detail-info-grid" data-testid="lead-detail-info">
            <div>
              <dt>E-posta</dt>
              <dd>{lead.email}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{lead.phone}</dd>
            </div>
            <div>
              <dt>Kaynak</dt>
              <dd>{lead.source}</dd>
            </div>
            <div>
              <dt>Sahip</dt>
              <dd>{lead.owner}</dd>
            </div>
            <div>
              <dt>Etiketler</dt>
              <dd className="detail-tags">
                {lead.tags.map((tag) => (
                  <span key={tag} className="detail-tag">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Son güncelleme</dt>
              <dd>{new Date(lead.updatedAt).toLocaleDateString('tr-TR')}</dd>
            </div>
          </dl>
        )}

        {activeTab === 'activities' && (
          <ul className="detail-activity-list">
            {MOCK_ACTIVITIES.map((item) => (
              <li key={item.id} className="detail-activity-list__item">
                <span className="detail-activity-list__dot" aria-hidden />
                <div>
                  <p className="detail-activity-list__title">{item.title}</p>
                  <p className="detail-activity-list__meta">{item.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'timeline' && (
          <ul className="detail-timeline-list">
            {MOCK_TIMELINE.map((item) => (
              <li key={item.id} className="detail-timeline-list__item">
                <p className="detail-timeline-list__title">{item.title}</p>
                <p className="detail-timeline-list__meta">{item.meta}</p>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'ai' && (
          <div className="detail-ai-panel" data-testid="lead-detail-ai">
            <p className="detail-ai-panel__headline">
              Dönüşüm olasılığı: <strong>%{conversionProbability}</strong>
            </p>
            <p className="detail-ai-panel__text">
              Bu lead için önerilen sonraki adım: <strong>demo görüşmesi planla</strong>. Benzer
              profildeki leadlerin %68&apos;i 14 gün içinde nitelikli aşamaya geçti.
            </p>
            <button type="button" className="btn-accent-green btn-accent-green--compact" disabled>
              AI önerisini uygula
            </button>
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
