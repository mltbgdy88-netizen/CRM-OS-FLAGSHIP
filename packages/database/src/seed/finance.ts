import type { PoolClient } from 'pg';
import { SEED_FINANCE_PERMISSIONS, SEED_IDS } from './constants';

export async function seedFinanceData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_FINANCE_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_FINANCE_PERMISSIONS) {
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
      `INSERT INTO accounts (
         id, tenant_id, customer_id, name, code, balance, currency, status, created_by
       )
       VALUES ($1, $2, $3, 'Acme Corp Cari', 'ACME-001', 15000.00, 'TRY', 'active', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.accountDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO accounts (
         id, tenant_id, customer_id, name, code, balance, currency, status, created_by
       )
       VALUES ($1, $2, $3, 'Tenant B Account', 'TB-001', 8200.00, 'TRY', 'active', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.accountTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO account_transactions (
         id, tenant_id, account_id, transaction_type, amount, balance_after,
         reference_type, description, transaction_at, created_by
       )
       VALUES ($1, $2, $3, 'opening', 15000.00, 15000.00, 'seed', 'Opening balance', NOW(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.accountTransactionDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.accountDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO account_transactions (
         id, tenant_id, account_id, transaction_type, amount, balance_after,
         reference_type, description, transaction_at, created_by
       )
       VALUES ($1, $2, $3, 'opening', 8200.00, 8200.00, 'seed', 'Opening balance', NOW(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.accountTransactionTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.accountTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO credit_limits (id, tenant_id, account_id, limit_amount, currency, status, created_by)
       VALUES ($1, $2, $3, 50000.00, 'TRY', 'active', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.creditLimitDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.accountDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO credit_limits (id, tenant_id, account_id, limit_amount, currency, status, created_by)
       VALUES ($1, $2, $3, 25000.00, 'TRY', 'active', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.creditLimitTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.accountTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO risk_limits (id, tenant_id, account_id, risk_score, limit_amount, created_by)
       VALUES ($1, $2, $3, 25.00, 40000.00, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.riskLimitDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.accountDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO risk_limits (id, tenant_id, account_id, risk_score, limit_amount, created_by)
       VALUES ($1, $2, $3, 35.00, 20000.00, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.riskLimitTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.accountTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO invoices (
         id, tenant_id, account_id, invoice_number, status,
         subtotal, tax_amount, total_amount, currency, due_date, issued_at, created_by
       )
       VALUES ($1, $2, $3, 'INV-2026-001', 'issued', 10000.00, 2000.00, 12000.00, 'TRY', CURRENT_DATE + 30, NOW(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.invoiceDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.accountDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO invoices (
         id, tenant_id, account_id, invoice_number, status,
         subtotal, tax_amount, total_amount, currency, due_date, issued_at, created_by
       )
       VALUES ($1, $2, $3, 'INV-TB-001', 'issued', 5000.00, 1000.00, 6000.00, 'TRY', CURRENT_DATE + 30, NOW(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.invoiceTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.accountTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO invoice_items (
         id, tenant_id, invoice_id, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'Enterprise License', 1, 10000.00, 10000.00, 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.invoiceItemDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.invoiceDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO invoice_items (
         id, tenant_id, invoice_id, description, quantity, unit_price, line_total, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'Support Package', 1, 5000.00, 5000.00, 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.invoiceItemTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.invoiceTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
