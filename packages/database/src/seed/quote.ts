import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_QUOTE_PERMISSIONS } from './constants';

export async function seedQuoteData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_QUOTE_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_QUOTE_PERMISSIONS) {
      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantDefault, SEED_IDS.roleAdmin, permission.id],
      );

      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantB, SEED_IDS.roleTenantB, permission.id],
      );
    }

    await client.query(
      `INSERT INTO quotes (
         id, tenant_id, number, customer_id, opportunity_id, status,
         subtotal, discount_total, tax_total, total, margin_percent, currency_code, notes, created_by
       )
       VALUES ($1, $2, 'Q-2026-0001', $3, $4, 'draft', 95000, 9500, 17100, 102600, 35, 'TRY',
               'Seed quote for default tenant opportunity.', $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.opportunityDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quotes (
         id, tenant_id, number, customer_id, opportunity_id, status,
         subtotal, discount_total, tax_total, total, margin_percent, currency_code, notes, created_by
       )
       VALUES ($1, $2, 'Q-2026-0001', $3, $4, 'draft', 128000, 6400, 24320, 145920, 28, 'TRY',
               'Seed quote for tenant B opportunity.', $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.opportunityTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_versions (
         id, tenant_id, quote_id, version_number, label, is_current, created_by
       )
       VALUES ($1, $2, $3, 1, 'Initial', TRUE, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteVersionDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_versions (
         id, tenant_id, quote_id, version_number, label, is_current, created_by
       )
       VALUES ($1, $2, $3, 1, 'Initial', TRUE, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteVersionTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_items (
         id, tenant_id, quote_id, name, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'CRM OS Enterprise License', 'Annual subscription license', 1, 95000, 95000, 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteItemDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_items (
         id, tenant_id, quote_id, name, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'Tenant B Platform Bundle', 'Two-seat platform bundle', 2, 64000, 128000, 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteItemTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_discounts (
         id, tenant_id, quote_id, name, discount_type, value, created_by
       )
       VALUES ($1, $2, $3, 'Volume discount', 'percent', 10, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteDiscountDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_discounts (
         id, tenant_id, quote_id, name, discount_type, value, created_by
       )
       VALUES ($1, $2, $3, 'Partner rebate', 'percent', 5, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteDiscountTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_taxes (
         id, tenant_id, quote_id, name, rate_percent, amount, created_by
       )
       VALUES ($1, $2, $3, 'KDV', 20, 17100, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteTaxDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_taxes (
         id, tenant_id, quote_id, name, rate_percent, amount, created_by
       )
       VALUES ($1, $2, $3, 'KDV', 20, 24320, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteTaxTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
