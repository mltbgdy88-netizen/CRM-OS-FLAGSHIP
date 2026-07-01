export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'draft'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface MockOrder {
  id: string;
  number: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord-001',
    number: 'SIP-2026-0089',
    customer: 'Delta Medikal',
    total: 54_000,
    status: 'delivered',
    createdAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 'ord-002',
    number: 'SIP-2026-0085',
    customer: 'TeknoPark İzmir',
    total: 128_000,
    status: 'shipped',
    createdAt: '2026-06-10T14:20:00Z',
  },
  {
    id: 'ord-003',
    number: 'SIP-2026-0082',
    customer: 'Acme Teknoloji',
    total: 420_000,
    status: 'processing',
    createdAt: '2026-06-08T09:15:00Z',
  },
  {
    id: 'ord-004',
    number: 'SIP-2026-0078',
    customer: 'Beta Yazılım',
    total: 185_000,
    status: 'pending',
    createdAt: '2026-06-05T16:40:00Z',
  },
  {
    id: 'ord-005',
    number: 'SIP-2026-0071',
    customer: 'Atlas Lojistik',
    total: 72_000,
    status: 'cancelled',
    createdAt: '2026-05-28T11:30:00Z',
  },
];

export function formatTry(amount: number): string {
  if (amount >= 1_000_000) {
    return `₺${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `₺${Math.round(amount / 1_000)}K`;
}

export function orderStatusLabel(status: OrderStatus | string): string {
  switch (status) {
    case 'pending':
      return 'Bekliyor';
    case 'processing':
      return 'İşleniyor';
    case 'confirmed':
      return 'Onaylandı';
    case 'draft':
      return 'Taslak';
    case 'shipped':
      return 'Kargoda';
    case 'delivered':
      return 'Teslim';
    case 'cancelled':
      return 'İptal';
    default:
      return status;
  }
}

export function orderStatusClass(status: OrderStatus | string): string {
  switch (status) {
    case 'pending':
      return 'status-pill status-pill--info';
    case 'processing':
      return 'status-pill status-pill--warning';
    case 'confirmed':
      return 'status-pill status-pill--warning';
    case 'draft':
      return 'status-pill status-pill--info';
    case 'shipped':
      return 'status-pill status-pill--info';
    case 'delivered':
      return 'status-pill status-pill--success';
    case 'cancelled':
      return 'status-pill status-pill--danger';
    default:
      return 'status-pill';
  }
}
