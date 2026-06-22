import type { PoolClient } from 'pg';
import { SEED_CUSTOMER_PERMISSIONS, SEED_IDS } from './constants';

export async function seedCrmData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_CUSTOMER_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_CUSTOMER_PERMISSIONS) {
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
      `INSERT INTO customers (id, tenant_id, display_name, email, phone, status, created_by)
       VALUES ($1, $2, 'Default Demo Customer', 'demo@default.local', '+905551110000', 'active', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.customerDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO customers (id, tenant_id, display_name, email, phone, status, created_by)
       VALUES ($1, $2, 'Tenant B Demo Customer', 'demo@tenant-b.local', '+905552220000', 'active', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.customerTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO customer_notes (id, tenant_id, customer_id, title, body, created_by)
       VALUES ($1, $2, $3, 'Welcome note', 'Default tenant onboarding note.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.noteDefault, SEED_IDS.tenantDefault, SEED_IDS.customerDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO customer_notes (id, tenant_id, customer_id, title, body, created_by)
       VALUES ($1, $2, $3, 'Tenant B note', 'Tenant B only note for RLS proof.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.noteTenantB, SEED_IDS.tenantB, SEED_IDS.customerTenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO customer_files (id, tenant_id, customer_id, file_name, mime_type, byte_size, created_by)
       VALUES ($1, $2, $3, 'contract-default.pdf', 'application/pdf', 2048, $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.fileDefault, SEED_IDS.tenantDefault, SEED_IDS.customerDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO customer_files (id, tenant_id, customer_id, file_name, mime_type, byte_size, created_by)
       VALUES ($1, $2, $3, 'contract-tenant-b.pdf', 'application/pdf', 4096, $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.fileTenantB, SEED_IDS.tenantB, SEED_IDS.customerTenantB, SEED_IDS.userMemberB],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
