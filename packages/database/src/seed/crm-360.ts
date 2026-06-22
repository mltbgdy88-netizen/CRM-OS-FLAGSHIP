import type { PoolClient } from 'pg';
import { SEED_CUSTOMER_360_PERMISSIONS, SEED_IDS } from './constants';

export async function seedCrm360Data(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_CUSTOMER_360_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_CUSTOMER_360_PERMISSIONS) {
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
      `INSERT INTO customer_timeline_events (
         id, tenant_id, customer_id, event_type, title, summary, occurred_at, created_by
       )
       VALUES ($1, $2, $3, 'customer.created', 'Customer onboarded', 'Default tenant timeline seed.', NOW() - INTERVAL '7 days', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.timelineEventDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO customer_timeline_events (
         id, tenant_id, customer_id, event_type, title, summary, occurred_at, created_by
       )
       VALUES ($1, $2, $3, 'customer.created', 'Tenant B customer onboarded', 'Tenant B timeline seed.', NOW() - INTERVAL '3 days', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.timelineEventTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO customer_scores (
         id, tenant_id, customer_id, metric_code, score_value, recorded_at, created_by
       )
       VALUES ($1, $2, $3, 'engagement', 82.5000, NOW() - INTERVAL '1 day', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.scoreDefault, SEED_IDS.tenantDefault, SEED_IDS.customerDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO customer_scores (
         id, tenant_id, customer_id, metric_code, score_value, recorded_at, created_by
       )
       VALUES ($1, $2, $3, 'engagement', 64.2500, NOW() - INTERVAL '1 day', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.scoreTenantB, SEED_IDS.tenantB, SEED_IDS.customerTenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO customer_risk_scores (
         id, tenant_id, customer_id, risk_level, risk_score, assessed_at, created_by
       )
       VALUES ($1, $2, $3, 'low', 12.5000, NOW() - INTERVAL '2 days', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.riskScoreDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO customer_risk_scores (
         id, tenant_id, customer_id, risk_level, risk_score, assessed_at, created_by
       )
       VALUES ($1, $2, $3, 'medium', 48.7500, NOW() - INTERVAL '2 days', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.riskScoreTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO customer_lifetime_values (
         id, tenant_id, customer_id, currency, ltv_value, calculated_at, created_by
       )
       VALUES ($1, $2, $3, 'TRY', 125000.00, NOW() - INTERVAL '1 day', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.ltvDefault, SEED_IDS.tenantDefault, SEED_IDS.customerDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO customer_lifetime_values (
         id, tenant_id, customer_id, currency, ltv_value, calculated_at, created_by
       )
       VALUES ($1, $2, $3, 'TRY', 42000.00, NOW() - INTERVAL '1 day', $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.ltvTenantB, SEED_IDS.tenantB, SEED_IDS.customerTenantB, SEED_IDS.userMemberB],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
