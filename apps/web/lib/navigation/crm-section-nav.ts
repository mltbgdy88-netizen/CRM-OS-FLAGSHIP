export type CrmSectionStatus = 'live' | 'soon';

export interface CrmSectionItem {
  id: string;
  label: string;
  href?: string;
  status: CrmSectionStatus;
}

/** Bitrix24 CRM horizontal section menu (Space+ pattern). */
export const CRM_SECTION_NAV: CrmSectionItem[] = [
  { id: 'deals', label: 'Deals', status: 'soon' },
  { id: 'inventory', label: 'Inventory', href: '/inventory', status: 'live' },
  { id: 'customers', label: 'Customers', href: '/customers', status: 'live' },
  { id: 'sales', label: 'Sales', status: 'soon' },
  { id: 'analytics', label: 'Analytics', status: 'soon' },
  { id: 'more', label: 'More', status: 'soon' },
];

export const CRM_CUSTOMER_SUBNAV: CrmSectionItem[] = [
  { id: 'contacts', label: 'Contacts', href: '/customers', status: 'live' },
  { id: 'companies', label: 'Companies', status: 'soon' },
  { id: 'vendors', label: 'Vendors', status: 'soon' },
];
