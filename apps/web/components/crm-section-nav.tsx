'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CRM_CUSTOMER_SUBNAV, CRM_SECTION_NAV } from '../lib/navigation/crm-section-nav';

export function CrmSectionNav() {
  const pathname = usePathname();
  const isCustomerArea = pathname.startsWith('/customers');

  return (
    <nav className="crm-section-nav" aria-label="CRM sections" data-testid="crm-section-nav">
      <div className="crm-section-nav__primary">
        {CRM_SECTION_NAV.map((item) => {
          const isActive = item.href ? pathname.startsWith(item.href) : false;
          const isDisabled = item.status === 'soon' || !item.href;

          if (isDisabled) {
            return (
              <span key={item.id} className="crm-section-nav__item crm-section-nav__item--soon" title="Coming soon">
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href!}
              className={
                isActive
                  ? 'crm-section-nav__item crm-section-nav__item--active'
                  : 'crm-section-nav__item'
              }
              data-testid={`crm-section-${item.id}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {isCustomerArea ? (
        <div className="crm-section-nav__secondary" data-testid="crm-customer-subnav">
          {CRM_CUSTOMER_SUBNAV.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : false;
            const isDisabled = item.status === 'soon' || !item.href;

            if (isDisabled) {
              return (
                <span key={item.id} className="crm-subnav-chip crm-subnav-chip--soon">
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                className={isActive ? 'crm-subnav-chip crm-subnav-chip--active' : 'crm-subnav-chip'}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
