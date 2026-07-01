import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_ORDER_PERMISSIONS } from './constants';

export async function seedOrderData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_ORDER_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_ORDER_PERMISSIONS) {
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
      `INSERT INTO orders (
         id, tenant_id, number, customer_id, quote_id, status,
         subtotal, tax_total, total, currency_code, notes, created_by
       )
       VALUES ($1, $2, 'O-2026-0001', $3, $4, 'confirmed', 95000, 17100, 112100, 'TRY',
               'Seed order converted from default tenant quote.', $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO orders (
         id, tenant_id, number, customer_id, quote_id, status,
         subtotal, tax_total, total, currency_code, notes, created_by
       )
       VALUES ($1, $2, 'O-2026-0001', $3, NULL, 'pending', 64000, 12800, 76800, 'TRY',
               'Seed order for tenant B customer.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO order_items (
         id, tenant_id, order_id, name, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'CRM OS Enterprise License', 'Annual subscription license', 1, 95000, 95000, 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderItemDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.orderDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO order_items (
         id, tenant_id, order_id, name, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'Implementation Services', 'Onboarding and setup package', 1, 0, 0, 2, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderItemDefault2,
        SEED_IDS.tenantDefault,
        SEED_IDS.orderDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO order_items (
         id, tenant_id, order_id, name, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'Tenant B Platform Bundle', 'Two-seat platform bundle', 2, 32000, 64000, 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderItemTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.orderTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO order_status_history (
         id, tenant_id, order_id, from_status, to_status, reason, created_by
       )
       VALUES ($1, $2, $3, 'pending', 'confirmed', 'Quote accepted and order created.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderStatusHistoryDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.orderDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO order_status_history (
         id, tenant_id, order_id, from_status, to_status, reason, created_by
       )
       VALUES ($1, $2, $3, 'draft', 'pending', 'Order submitted for fulfillment review.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderStatusHistoryDefault2,
        SEED_IDS.tenantDefault,
        SEED_IDS.orderDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO order_status_history (
         id, tenant_id, order_id, from_status, to_status, reason, created_by
       )
       VALUES ($1, $2, $3, 'draft', 'pending', 'Initial order created from customer request.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.orderStatusHistoryTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.orderTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
