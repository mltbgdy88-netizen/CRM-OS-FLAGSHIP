import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import {
  SEED_ADMIN_PASSWORD,
  SEED_IDS,
  SEED_PERMISSIONS,
} from './constants';

export { seedCrm360Data } from './crm-360';
export { seedCrmData } from './crm';
export { seedLeadData } from './lead';
export { seedQuoteData } from './quote';
export { seedQuotePdfApprovalData } from './quote-pdf-approval';
export { seedSalesData } from './sales';
export { seedTaskData } from './task';
export { seedDashboardNotificationData } from './dashboard-notification';
export { seedOrderData } from './order';
export { seedProductData } from './product';
export { seedInventoryData } from './inventory';
export { seedStockReservationData } from './stock-reservation';
export {
  SEED_CUSTOMER_360_PERMISSIONS,
  SEED_CUSTOMER_PERMISSIONS,
  SEED_IDS,
  SEED_LEAD_PERMISSIONS,
  SEED_PERMISSIONS,
  SEED_QUOTE_PERMISSIONS,
  SEED_QUOTE_PDF_PERMISSIONS,
  SEED_SALES_PERMISSIONS,
  SEED_TASK_PERMISSIONS,
  SEED_DASHBOARD_NOTIFICATION_PERMISSIONS,
  SEED_ORDER_PERMISSIONS,
  SEED_PRODUCT_PERMISSIONS,
  SEED_INVENTORY_PERMISSIONS,
} from './constants';

function hashPassword(password: string): string {
  // Sprint-02 placeholder hash for local seed only; backend auth replaces with bcrypt.
  return createHash('sha256').update(password).digest('hex');
}

export async function seedIamData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    await client.query(
      `INSERT INTO tenants (id, name, slug, status)
       VALUES ($1, 'Default Workspace', 'default', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.tenantDefault],
    );

    await client.query(
      `INSERT INTO tenants (id, name, slug, status)
       VALUES ($1, 'Tenant B Workspace', 'tenant-b', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.tenantB],
    );

    await client.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, status)
       VALUES ($1, 'admin@default.local', $2, 'Default', 'Admin', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.userAdmin, hashPassword(SEED_ADMIN_PASSWORD)],
    );

    await client.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, status)
       VALUES ($1, 'member@tenant-b.local', $2, 'Tenant', 'Member', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.userMemberB, hashPassword(SEED_ADMIN_PASSWORD)],
    );

    await client.query(
      `INSERT INTO tenant_members (id, tenant_id, user_id, status, joined_at)
       VALUES ($1, $2, $3, 'active', NOW())
       ON CONFLICT (tenant_id, user_id) DO NOTHING`,
      [SEED_IDS.memberAdmin, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO tenant_members (id, tenant_id, user_id, status, joined_at)
       VALUES ($1, $2, $3, 'active', NOW())
       ON CONFLICT (tenant_id, user_id) DO NOTHING`,
      [SEED_IDS.memberB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO roles (id, tenant_id, code, name, is_system)
       VALUES ($1, $2, 'tenant_admin', 'Tenant Admin', TRUE)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.roleAdmin, SEED_IDS.tenantDefault],
    );

    await client.query(
      `INSERT INTO roles (id, tenant_id, code, name, is_system)
       VALUES ($1, $2, 'tenant_admin', 'Tenant B Admin', TRUE)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.roleTenantB, SEED_IDS.tenantB],
    );

    for (const permission of SEED_PERMISSIONS) {
      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantDefault, SEED_IDS.roleAdmin, permission.id],
      );
    }

    await client.query(
      `INSERT INTO member_roles (tenant_id, tenant_member_id, role_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [SEED_IDS.tenantDefault, SEED_IDS.memberAdmin, SEED_IDS.roleAdmin],
    );

    await client.query(
      `INSERT INTO audit_logs (id, tenant_id, actor_user_id, action, entity_type, entity_id, payload)
       VALUES ($1, $2, $3, 'seed.created', 'tenant', $2, '{"source":"sprint-02-seed"}'::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.auditDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO audit_logs (id, tenant_id, actor_user_id, action, entity_type, entity_id, payload)
       VALUES ($1, $2, $3, 'seed.created', 'tenant', $2, '{"source":"sprint-02-seed"}'::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.auditTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
