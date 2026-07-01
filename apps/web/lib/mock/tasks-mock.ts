export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface MockTask {
  id: string;
  title: string;
  dueAt: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedTo: string;
  owner: string;
}

export const MOCK_TASKS: MockTask[] = [
  {
    id: 'task-001',
    title: 'Acme demo görüşmesi hazırlığı',
    dueAt: '2026-06-21T10:00:00Z',
    priority: 'high',
    status: 'in_progress',
    relatedTo: 'Acme Teknoloji',
    owner: 'Ahmet Yılmaz',
  },
  {
    id: 'task-002',
    title: 'Beta Yazılım teklif revizyonu',
    dueAt: '2026-06-22T14:00:00Z',
    priority: 'high',
    status: 'pending',
    relatedTo: 'Beta Yazılım',
    owner: 'Selin Yılmaz',
  },
  {
    id: 'task-003',
    title: 'Nova Enerji lead takip araması',
    dueAt: '2026-06-21T09:30:00Z',
    priority: 'medium',
    status: 'pending',
    relatedTo: 'Nova Enerji A.Ş.',
    owner: 'Selin Yılmaz',
  },
  {
    id: 'task-004',
    title: 'Haftalık pipeline özeti',
    dueAt: '2026-06-23T16:00:00Z',
    priority: 'medium',
    status: 'pending',
    relatedTo: 'Ekip',
    owner: 'Ahmet Yılmaz',
  },
  {
    id: 'task-005',
    title: 'Delta Medikal sözleşme gönderimi',
    dueAt: '2026-06-20T17:00:00Z',
    priority: 'high',
    status: 'done',
    relatedTo: 'Delta Medikal',
    owner: 'Mehmet Ak',
  },
  {
    id: 'task-006',
    title: 'Atlas Lojistik ihtiyaç analizi notları',
    dueAt: '2026-06-24T11:00:00Z',
    priority: 'low',
    status: 'in_progress',
    relatedTo: 'Atlas Lojistik',
    owner: 'Mehmet Ak',
  },
  {
    id: 'task-007',
    title: 'CloudNine keşif toplantısı',
    dueAt: '2026-06-25T15:00:00Z',
    priority: 'medium',
    status: 'pending',
    relatedTo: 'CloudNine Retail',
    owner: 'Ahmet Yılmaz',
  },
  {
    id: 'task-008',
    title: 'Müşteri geri bildirimleri özeti',
    dueAt: '2026-06-26T12:00:00Z',
    priority: 'low',
    status: 'pending',
    relatedTo: 'Genel',
    owner: 'Selin Yılmaz',
  },
];

export function taskPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'Yüksek';
    case 'medium':
      return 'Orta';
    case 'low':
      return 'Düşük';
  }
}

export function taskPriorityClass(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'status-pill status-pill--danger';
    case 'medium':
      return 'status-pill status-pill--warning';
    case 'low':
      return 'status-pill status-pill--muted';
  }
}

export function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return 'Bekliyor';
    case 'in_progress':
      return 'Devam ediyor';
    case 'done':
      return 'Tamamlandı';
  }
}

export function taskStatusClass(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return 'status-pill status-pill--info';
    case 'in_progress':
      return 'status-pill status-pill--warning';
    case 'done':
      return 'status-pill status-pill--success';
  }
}
