export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export interface MockLead {
  id: string;
  displayName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  owner: string;
  status: LeadStatus;
  score: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export const MOCK_LEADS: MockLead[] = [
  {
    id: 'lead-001',
    displayName: 'Elif Demir',
    company: 'Nova Enerji A.Ş.',
    email: 'elif.demir@novaenerji.com',
    phone: '+90 532 100 2201',
    source: 'Web formu',
    owner: 'Selin Yılmaz',
    status: 'new',
    score: 82,
    createdAt: '2026-06-18T09:12:00Z',
    updatedAt: '2026-06-20T14:30:00Z',
    tags: ['Kurumsal', 'Sıcak'],
  },
  {
    id: 'lead-002',
    displayName: 'Murat Kaya',
    company: 'Atlas Lojistik',
    email: 'murat@atlaslojistik.com',
    phone: '+90 533 441 8890',
    source: 'LinkedIn',
    owner: 'Ahmet Yılmaz',
    status: 'contacted',
    score: 74,
    createdAt: '2026-06-15T11:00:00Z',
    updatedAt: '2026-06-19T10:15:00Z',
    tags: ['Lojistik'],
  },
  {
    id: 'lead-003',
    displayName: 'Zeynep Arslan',
    company: 'Beta Yazılım',
    email: 'zeynep@betayazilim.io',
    phone: '+90 542 778 1200',
    source: 'Referans',
    owner: 'Selin Yılmaz',
    status: 'qualified',
    score: 91,
    createdAt: '2026-06-10T08:45:00Z',
    updatedAt: '2026-06-20T16:00:00Z',
    tags: ['SaaS', 'Yüksek skor'],
  },
  {
    id: 'lead-004',
    displayName: 'Can Öztürk',
    company: 'Delta Medikal',
    email: 'can.ozturk@deltamedikal.tr',
    phone: '+90 505 332 9911',
    source: 'Fuar',
    owner: 'Mehmet Ak',
    status: 'contacted',
    score: 68,
    createdAt: '2026-06-12T13:20:00Z',
    updatedAt: '2026-06-18T09:40:00Z',
    tags: ['Sağlık'],
  },
  {
    id: 'lead-005',
    displayName: 'Ayşe Çelik',
    company: 'Orion Finans',
    email: 'ayse.celik@orionfinans.com',
    phone: '+90 536 220 4455',
    source: 'Soğuk arama',
    owner: 'Ahmet Yılmaz',
    status: 'new',
    score: 55,
    createdAt: '2026-06-19T07:30:00Z',
    updatedAt: '2026-06-19T07:30:00Z',
    tags: ['Finans'],
  },
  {
    id: 'lead-006',
    displayName: 'Burak Şahin',
    company: 'TeknoPark İzmir',
    email: 'burak@teknoparkizmir.org',
    phone: '+90 554 881 0022',
    source: 'Web formu',
    owner: 'Selin Yılmaz',
    status: 'qualified',
    score: 88,
    createdAt: '2026-06-08T15:00:00Z',
    updatedAt: '2026-06-17T11:20:00Z',
    tags: ['Kamu', 'Demo istendi'],
  },
  {
    id: 'lead-007',
    displayName: 'Deniz Aydın',
    company: 'CloudNine Retail',
    email: 'deniz@cloudnineretail.com',
    phone: '+90 532 990 3311',
    source: 'LinkedIn',
    owner: 'Mehmet Ak',
    status: 'lost',
    score: 32,
    createdAt: '2026-05-28T10:00:00Z',
    updatedAt: '2026-06-14T17:00:00Z',
    tags: ['Perakende'],
  },
  {
    id: 'lead-008',
    displayName: 'Gizem Koç',
    company: 'Acme Teknoloji',
    email: 'gizem@acmetek.com',
    phone: '+90 541 220 7788',
    source: 'Referans',
    owner: 'Ahmet Yılmaz',
    status: 'qualified',
    score: 95,
    createdAt: '2026-06-05T12:10:00Z',
    updatedAt: '2026-06-20T08:50:00Z',
    tags: ['Enterprise', 'Öncelikli'],
  },
  {
    id: 'lead-009',
    displayName: 'Hakan Yıldız',
    company: 'Mavi Deniz Turizm',
    email: 'hakan@mavideniz.com',
    phone: '+90 530 112 4455',
    source: 'Fuar',
    owner: 'Selin Yılmaz',
    status: 'contacted',
    score: 61,
    createdAt: '2026-06-16T09:00:00Z',
    updatedAt: '2026-06-19T15:30:00Z',
    tags: ['Turizm'],
  },
  {
    id: 'lead-010',
    displayName: 'İrem Polat',
    company: 'Sigma İnşaat',
    email: 'irem@sigmainşaat.com',
    phone: '+90 535 667 8899',
    source: 'Web formu',
    owner: 'Mehmet Ak',
    status: 'new',
    score: 70,
    createdAt: '2026-06-20T06:45:00Z',
    updatedAt: '2026-06-20T06:45:00Z',
    tags: ['İnşaat'],
  },
];

export function getMockLead(id: string): MockLead | undefined {
  return MOCK_LEADS.find((lead) => lead.id === id);
}

export function leadStatusLabel(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'Yeni';
    case 'contacted':
      return 'İletişimde';
    case 'qualified':
      return 'Nitelikli';
    case 'lost':
      return 'Kayıp';
  }
}

export function leadStatusPillClass(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'status-pill status-pill--info';
    case 'contacted':
      return 'status-pill status-pill--warning';
    case 'qualified':
      return 'status-pill status-pill--success';
    case 'lost':
      return 'status-pill status-pill--danger';
  }
}

export function scoreTone(score: number): 'high' | 'mid' | 'low' {
  if (score >= 80) {
    return 'high';
  }
  if (score >= 60) {
    return 'mid';
  }
  return 'low';
}
