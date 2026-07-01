import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_LEAD_PERMISSIONS } from './constants';

export async function seedLeadData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_LEAD_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_LEAD_PERMISSIONS) {
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
      `INSERT INTO lead_sources (id, tenant_id, name, code, created_by)
       VALUES ($1, $2, 'Web Form', 'web-form', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadSourceDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO lead_sources (id, tenant_id, name, code, created_by)
       VALUES ($1, $2, 'Partner Referral', 'partner-referral', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadSourceTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO leads (
         id, tenant_id, full_name, company_name, email, phone, source_id, status, score,
         assigned_user_id, customer_id, created_by
       )
       VALUES ($1, $2, 'Default Lead', 'Default Lead Co', 'lead@default.local', '+905551230000', $3, 'new', 72, $4, $5, $4)
       ON CONFLICT (id) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           company_name = EXCLUDED.company_name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           source_id = EXCLUDED.source_id,
           status = EXCLUDED.status,
           score = EXCLUDED.score,
           assigned_user_id = EXCLUDED.assigned_user_id,
           customer_id = EXCLUDED.customer_id,
           deleted_at = NULL`,
      [
        SEED_IDS.leadDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.leadSourceDefault,
        SEED_IDS.userAdmin,
        SEED_IDS.customerDefault,
      ],
    );

    await client.query(
      `INSERT INTO leads (
         id, tenant_id, full_name, company_name, email, phone, source_id, status, score,
         assigned_user_id, customer_id, created_by
       )
       VALUES ($1, $2, 'Tenant B Lead', 'Tenant B Lead Co', 'lead@tenant-b.local', '+905552340000', $3, 'qualified', 88, $4, $5, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.leadTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.leadSourceTenantB,
        SEED_IDS.userMemberB,
        SEED_IDS.customerTenantB,
      ],
    );

    await client.query(
      `INSERT INTO lead_tags (id, tenant_id, lead_id, name, created_by)
       VALUES ($1, $2, $3, 'priority', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadTagDefault, SEED_IDS.tenantDefault, SEED_IDS.leadDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO lead_tags (id, tenant_id, lead_id, name, created_by)
       VALUES ($1, $2, $3, 'partner', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadTagTenantB, SEED_IDS.tenantB, SEED_IDS.leadTenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO lead_scores (id, tenant_id, lead_id, score_value, created_by)
       VALUES ($1, $2, $3, 72, $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadScoreDefault, SEED_IDS.tenantDefault, SEED_IDS.leadDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO lead_scores (id, tenant_id, lead_id, score_value, created_by)
       VALUES ($1, $2, $3, 88, $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadScoreTenantB, SEED_IDS.tenantB, SEED_IDS.leadTenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO lead_assignments (id, tenant_id, lead_id, assigned_user_id, created_by)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.leadAssignmentDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.leadDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO lead_assignments (id, tenant_id, lead_id, assigned_user_id, created_by)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.leadAssignmentTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.leadTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO lead_activities (id, tenant_id, lead_id, activity_type, title, body, created_by)
       VALUES ($1, $2, $3, 'created', 'Lead created', 'Default tenant lead seed.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadActivityDefault, SEED_IDS.tenantDefault, SEED_IDS.leadDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO lead_activities (id, tenant_id, lead_id, activity_type, title, body, created_by)
       VALUES ($1, $2, $3, 'qualified', 'Lead qualified', 'Tenant B lead seed.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.leadActivityTenantB, SEED_IDS.tenantB, SEED_IDS.leadTenantB, SEED_IDS.userMemberB],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
