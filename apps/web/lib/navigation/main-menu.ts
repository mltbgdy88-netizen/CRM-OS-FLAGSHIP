export type NavItemStatus = 'live' | 'soon';

export interface MainMenuItem {
  id: string;
  label: string;
  href?: string;
  status: NavItemStatus;
  badge?: number;
  section: 'workspace' | 'crm' | 'operations' | 'intelligence' | 'admin';
}

/** Bitrix Space+-style main menu — CRM OS content mapping (inventory master). */
export const MAIN_MENU: MainMenuItem[] = [
  { id: 'dashboard', label: 'Gösterge Paneli', href: '/dashboard', status: 'live', section: 'workspace' },
  { id: 'customers', label: 'Müşteriler', href: '/customers', status: 'live', section: 'crm' },
  { id: 'leads', label: 'Leadler', href: '/leads', status: 'live', section: 'crm' },
  { id: 'pipeline', label: 'Pipeline', href: '/pipeline', status: 'live', section: 'crm' },
  { id: 'quotes', label: 'Teklifler', status: 'soon', section: 'crm' },
  { id: 'orders', label: 'Siparişler', status: 'soon', section: 'crm' },
  { id: 'tasks', label: 'Görevler', status: 'soon', section: 'operations' },
  { id: 'calendar', label: 'Takvim', status: 'soon', section: 'operations' },
  { id: 'inbox', label: 'Gelen Kutusu', status: 'soon', section: 'operations' },
  { id: 'tickets', label: 'Destek', status: 'soon', section: 'operations' },
  { id: 'reports', label: 'Raporlar', href: '/reports', status: 'soon', section: 'intelligence' },
  { id: 'ai', label: 'AI Copilot', href: '/ai', status: 'soon', section: 'intelligence' },
  { id: 'settings', label: 'Ayarlar', href: '/settings', status: 'soon', section: 'admin' },
];

export const MENU_SECTION_LABELS: Record<MainMenuItem['section'], string> = {
  workspace: 'Çalışma Alanı',
  crm: 'CRM',
  operations: 'Operasyon',
  intelligence: 'Analitik',
  admin: 'Yönetim',
};

export const NAV_ICONS: Record<string, string> = {
  dashboard: '◫',
  customers: '◎',
  leads: '◇',
  pipeline: '▣',
  quotes: '▤',
  orders: '▥',
  tasks: '☑',
  calendar: '▦',
  inbox: '✉',
  tickets: '⚑',
  reports: '▧',
  ai: '✦',
  settings: '⚙',
};
