export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface MockQuote {
  id: string;
  number: string;
  customer: string;
  amount: number;
  marginPercent: number;
  status: QuoteStatus;
  createdBy: string;
  createdAt: string;
}

export const MOCK_QUOTES: MockQuote[] = [
  {
    id: 'quote-001',
    number: 'TKL-2026-0142',
    customer: 'Acme Teknoloji',
    amount: 420_000,
    marginPercent: 28,
    status: 'sent',
    createdBy: 'Ahmet Yılmaz',
    createdAt: '2026-06-18T10:00:00Z',
  },
  {
    id: 'quote-002',
    number: 'TKL-2026-0138',
    customer: 'Beta Yazılım',
    amount: 185_000,
    marginPercent: 22,
    status: 'sent',
    createdBy: 'Selin Yılmaz',
    createdAt: '2026-06-16T14:30:00Z',
  },
  {
    id: 'quote-003',
    number: 'TKL-2026-0135',
    customer: 'Delta Medikal',
    amount: 54_000,
    marginPercent: 35,
    status: 'accepted',
    createdBy: 'Mehmet Ak',
    createdAt: '2026-06-14T09:15:00Z',
  },
  {
    id: 'quote-004',
    number: 'TKL-2026-0131',
    customer: 'Atlas Lojistik',
    amount: 72_000,
    marginPercent: 18,
    status: 'draft',
    createdBy: 'Mehmet Ak',
    createdAt: '2026-06-12T11:00:00Z',
  },
  {
    id: 'quote-005',
    number: 'TKL-2026-0128',
    customer: 'Nova Enerji A.Ş.',
    amount: 95_000,
    marginPercent: 24,
    status: 'draft',
    createdBy: 'Selin Yılmaz',
    createdAt: '2026-06-10T16:45:00Z',
  },
  {
    id: 'quote-006',
    number: 'TKL-2026-0120',
    customer: 'Orion Finans',
    amount: 210_000,
    marginPercent: 15,
    status: 'rejected',
    createdBy: 'Ahmet Yılmaz',
    createdAt: '2026-06-05T08:30:00Z',
  },
  {
    id: 'quote-007',
    number: 'TKL-2026-0115',
    customer: 'TeknoPark İzmir',
    amount: 128_000,
    marginPercent: 30,
    status: 'accepted',
    createdBy: 'Selin Yılmaz',
    createdAt: '2026-06-02T13:20:00Z',
  },
];

export function formatTry(amount: number): string {
  if (amount >= 1_000_000) {
    return `₺${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `₺${Math.round(amount / 1_000)}K`;
}

export function quoteStatusLabel(status: QuoteStatus): string {
  switch (status) {
    case 'draft':
      return 'Taslak';
    case 'sent':
      return 'Gönderildi';
    case 'accepted':
      return 'Kabul';
    case 'rejected':
      return 'Reddedildi';
  }
}

export function quoteStatusClass(status: QuoteStatus): string {
  switch (status) {
    case 'draft':
      return 'status-pill status-pill--muted';
    case 'sent':
      return 'status-pill status-pill--info';
    case 'accepted':
      return 'status-pill status-pill--success';
    case 'rejected':
      return 'status-pill status-pill--danger';
  }
}
