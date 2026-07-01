export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved';

export interface MockTicket {
  id: string;
  number: string;
  customer: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaDueAt: string;
  owner: string;
}

export const MOCK_TICKETS: MockTicket[] = [
  {
    id: 'tkt-001',
    number: 'DST-2026-0341',
    customer: 'Acme Teknoloji',
    subject: 'Entegrasyon API hatası',
    priority: 'urgent',
    status: 'in_progress',
    slaDueAt: '2026-06-21T12:00:00Z',
    owner: 'Mehmet Ak',
  },
  {
    id: 'tkt-002',
    number: 'DST-2026-0338',
    customer: 'Beta Yazılım',
    subject: 'Fatura düzeltme talebi',
    priority: 'high',
    status: 'open',
    slaDueAt: '2026-06-22T09:00:00Z',
    owner: 'Selin Yılmaz',
  },
  {
    id: 'tkt-003',
    number: 'DST-2026-0332',
    customer: 'Nova Enerji A.Ş.',
    subject: 'Kullanıcı yetkilendirme',
    priority: 'normal',
    status: 'waiting',
    slaDueAt: '2026-06-23T17:00:00Z',
    owner: 'Ahmet Yılmaz',
  },
  {
    id: 'tkt-004',
    number: 'DST-2026-0325',
    customer: 'Delta Medikal',
    subject: 'Raporlama modülü sorusu',
    priority: 'low',
    status: 'resolved',
    slaDueAt: '2026-06-19T15:00:00Z',
    owner: 'Mehmet Ak',
  },
  {
    id: 'tkt-005',
    number: 'DST-2026-0319',
    customer: 'CloudNine Retail',
    subject: 'Mobil uygulama giriş sorunu',
    priority: 'high',
    status: 'open',
    slaDueAt: '2026-06-21T18:00:00Z',
    owner: 'Selin Yılmaz',
  },
];

export function ticketPriorityLabel(priority: TicketPriority): string {
  switch (priority) {
    case 'urgent':
      return 'Acil';
    case 'high':
      return 'Yüksek';
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Düşük';
  }
}

export function ticketPriorityClass(priority: TicketPriority): string {
  switch (priority) {
    case 'urgent':
      return 'status-pill status-pill--danger';
    case 'high':
      return 'status-pill status-pill--warning';
    case 'normal':
      return 'status-pill status-pill--info';
    case 'low':
      return 'status-pill status-pill--muted';
  }
}

export function ticketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return 'Açık';
    case 'in_progress':
      return 'İşlemde';
    case 'waiting':
      return 'Beklemede';
    case 'resolved':
      return 'Çözüldü';
  }
}

export function ticketStatusClass(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return 'status-pill status-pill--info';
    case 'in_progress':
      return 'status-pill status-pill--warning';
    case 'waiting':
      return 'status-pill status-pill--muted';
    case 'resolved':
      return 'status-pill status-pill--success';
  }
}

export function slaRisk(dueAt: string): 'breach' | 'warning' | 'ok' {
  const hoursLeft = (new Date(dueAt).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0) {
    return 'breach';
  }
  if (hoursLeft < 4) {
    return 'warning';
  }
  return 'ok';
}
