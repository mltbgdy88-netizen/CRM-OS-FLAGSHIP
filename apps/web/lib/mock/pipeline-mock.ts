export interface MockPipelineStage {
  id: string;
  name: string;
  color: string;
}

export interface MockOpportunity {
  id: string;
  title: string;
  company: string;
  amount: number;
  probability: number;
  owner: string;
  stageId: string;
  nextActivityAt: string;
  nextActivityLabel: string;
}

export const MOCK_PIPELINE_STAGES: MockPipelineStage[] = [
  { id: 'new', name: 'Yeni Lead', color: '#3b82f6' },
  { id: 'qualified', name: 'Nitelikli', color: '#60a5fa' },
  { id: 'proposal', name: 'Teklif', color: '#ff6a00' },
  { id: 'negotiation', name: 'Pazarlık', color: '#a855f7' },
  { id: 'won', name: 'Kazanıldı', color: '#22c55e' },
  { id: 'lost', name: 'Kaybedildi', color: '#ef4444' },
];

export const MOCK_OPPORTUNITIES: MockOpportunity[] = [
  {
    id: 'opp-001',
    title: 'Kurumsal CRM lisansı',
    company: 'Acme Teknoloji',
    amount: 420_000,
    probability: 75,
    owner: 'Ahmet Yılmaz',
    stageId: 'proposal',
    nextActivityAt: '2026-06-21T10:00:00Z',
    nextActivityLabel: 'Demo görüşmesi',
  },
  {
    id: 'opp-002',
    title: 'Saha satış modülü',
    company: 'Beta Yazılım',
    amount: 185_000,
    probability: 60,
    owner: 'Selin Yılmaz',
    stageId: 'negotiation',
    nextActivityAt: '2026-06-22T14:30:00Z',
    nextActivityLabel: 'Fiyat görüşmesi',
  },
  {
    id: 'opp-003',
    title: 'Entegrasyon paketi',
    company: 'Nova Enerji A.Ş.',
    amount: 95_000,
    probability: 45,
    owner: 'Selin Yılmaz',
    stageId: 'new',
    nextActivityAt: '2026-06-21T09:00:00Z',
    nextActivityLabel: 'İlk arama',
  },
  {
    id: 'opp-004',
    title: 'Yıllık bakım sözleşmesi',
    company: 'Atlas Lojistik',
    amount: 72_000,
    probability: 80,
    owner: 'Mehmet Ak',
    stageId: 'qualified',
    nextActivityAt: '2026-06-23T11:00:00Z',
    nextActivityLabel: 'İhtiyaç analizi',
  },
  {
    id: 'opp-005',
    title: 'Çoklu şube rollout',
    company: 'CloudNine Retail',
    amount: 310_000,
    probability: 35,
    owner: 'Ahmet Yılmaz',
    stageId: 'new',
    nextActivityAt: '2026-06-24T15:00:00Z',
    nextActivityLabel: 'Keşif toplantısı',
  },
  {
    id: 'opp-006',
    title: 'AI Copilot eklentisi',
    company: 'TeknoPark İzmir',
    amount: 128_000,
    probability: 55,
    owner: 'Selin Yılmaz',
    stageId: 'proposal',
    nextActivityAt: '2026-06-20T16:00:00Z',
    nextActivityLabel: 'Teklif gönderimi',
  },
  {
    id: 'opp-007',
    title: 'Destek portalı',
    company: 'Delta Medikal',
    amount: 54_000,
    probability: 90,
    owner: 'Mehmet Ak',
    stageId: 'won',
    nextActivityAt: '2026-06-19T10:00:00Z',
    nextActivityLabel: 'Sözleşme imzası',
  },
  {
    id: 'opp-008',
    title: 'Mobil saha uygulaması',
    company: 'Orion Finans',
    amount: 210_000,
    probability: 25,
    owner: 'Ahmet Yılmaz',
    stageId: 'lost',
    nextActivityAt: '2026-06-15T12:00:00Z',
    nextActivityLabel: 'Kapandı — bütçe',
  },
  {
    id: 'opp-009',
    title: 'Pipeline otomasyonu',
    company: 'Sigma İnşaat',
    amount: 88_000,
    probability: 50,
    owner: 'Mehmet Ak',
    stageId: 'qualified',
    nextActivityAt: '2026-06-22T09:30:00Z',
    nextActivityLabel: 'Teknik sunum',
  },
  {
    id: 'opp-010',
    title: 'Raporlama paketi',
    company: 'Mavi Deniz Turizm',
    amount: 46_000,
    probability: 65,
    owner: 'Selin Yılmaz',
    stageId: 'negotiation',
    nextActivityAt: '2026-06-21T13:00:00Z',
    nextActivityLabel: 'Son teklif',
  },
  {
    id: 'opp-011',
    title: 'Enterprise upgrade',
    company: 'Acme Teknoloji',
    amount: 520_000,
    probability: 70,
    owner: 'Ahmet Yılmaz',
    stageId: 'proposal',
    nextActivityAt: '2026-06-25T10:00:00Z',
    nextActivityLabel: 'Yönetim sunumu',
  },
];

export function getMockOpportunity(id: string): MockOpportunity | undefined {
  return MOCK_OPPORTUNITIES.find((opp) => opp.id === id);
}

export function formatTryAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `₺${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₺${Math.round(amount / 1_000)}K`;
  }
  return `₺${amount}`;
}

export function stageTotalAmount(stageId: string): number {
  return MOCK_OPPORTUNITIES.filter((opp) => opp.stageId === stageId).reduce(
    (sum, opp) => sum + opp.amount,
    0,
  );
}
