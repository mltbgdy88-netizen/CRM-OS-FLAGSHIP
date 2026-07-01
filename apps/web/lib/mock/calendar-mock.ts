export interface MockCalendarEvent {
  id: string;
  title: string;
  customer: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color: string;
}

export const MOCK_CALENDAR_EVENTS: MockCalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Demo görüşmesi',
    customer: 'Acme Teknoloji',
    startHour: 10,
    startMinute: 0,
    durationMinutes: 60,
    color: '#ff6a00',
  },
  {
    id: 'evt-002',
    title: 'Teklif sunumu',
    customer: 'Beta Yazılım',
    startHour: 14,
    startMinute: 30,
    durationMinutes: 45,
    color: '#3b82f6',
  },
  {
    id: 'evt-003',
    title: 'Haftalık pipeline',
    customer: 'Ekip',
    startHour: 16,
    startMinute: 0,
    durationMinutes: 30,
    color: '#a855f7',
  },
  {
    id: 'evt-004',
    title: 'Müşteri takip araması',
    customer: 'Nova Enerji A.Ş.',
    startHour: 11,
    startMinute: 30,
    durationMinutes: 30,
    color: '#22c55e',
  },
];

export const MOCK_SIDEBAR_TASKS = [
  { id: 'st-1', title: 'Acme demo hazırlığı', done: false },
  { id: 'st-2', title: 'Beta teklif revizyonu', done: false },
  { id: 'st-3', title: 'Delta sözleşme gönderimi', done: true },
];

export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
