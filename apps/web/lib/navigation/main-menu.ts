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
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', status: 'soon', section: 'workspace' },
  { id: 'customers', label: 'Customers', href: '/customers', status: 'live', section: 'crm' },
  { id: 'leads', label: 'Leads', status: 'soon', section: 'crm' },
  { id: 'pipeline', label: 'Deals', status: 'soon', section: 'crm' },
  { id: 'quotes', label: 'Quotes', status: 'soon', section: 'crm' },
  { id: 'orders', label: 'Orders', status: 'soon', section: 'crm' },
  { id: 'tasks', label: 'Tasks', status: 'soon', section: 'operations' },
  { id: 'calendar', label: 'Calendar', status: 'soon', section: 'operations' },
  { id: 'inbox', label: 'Inbox', status: 'soon', section: 'operations' },
  { id: 'tickets', label: 'Tickets', status: 'soon', section: 'operations' },
  { id: 'reports', label: 'Reports', href: '/reports', status: 'soon', section: 'intelligence' },
  { id: 'ai', label: 'AI Copilot', href: '/ai', status: 'soon', section: 'intelligence' },
  { id: 'settings', label: 'Settings', href: '/settings', status: 'soon', section: 'admin' },
];

export const MENU_SECTION_LABELS: Record<MainMenuItem['section'], string> = {
  workspace: 'Workspace',
  crm: 'CRM',
  operations: 'Operations',
  intelligence: 'Intelligence',
  admin: 'Administration',
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
