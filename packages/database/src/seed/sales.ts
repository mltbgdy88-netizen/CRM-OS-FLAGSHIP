import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_SALES_PERMISSIONS } from './constants';

const DEFAULT_PIPELINE_STAGES = [
  {
    id: SEED_IDS.pipelineStageDefaultNew,
    code: 'new',
    name: 'Yeni Lead',
    sortOrder: 1,
    color: '#3b82f6',
  },
  {
    id: SEED_IDS.pipelineStageDefaultQualified,
    code: 'qualified',
    name: 'Nitelikli',
    sortOrder: 2,
    color: '#60a5fa',
  },
  {
    id: SEED_IDS.pipelineStageDefaultProposal,
    code: 'proposal',
    name: 'Teklif',
    sortOrder: 3,
    color: '#ff6a00',
  },
  {
    id: SEED_IDS.pipelineStageDefaultNegotiation,
    code: 'negotiation',
    name: 'Pazarlık',
    sortOrder: 4,
    color: '#a855f7',
  },
  {
    id: SEED_IDS.pipelineStageDefaultWon,
    code: 'won',
    name: 'Kazanıldı',
    sortOrder: 5,
    color: '#22c55e',
  },
  {
    id: SEED_IDS.pipelineStageDefaultLost,
    code: 'lost',
    name: 'Kaybedildi',
    sortOrder: 6,
    color: '#ef4444',
  },
] as const;

const TENANT_B_PIPELINE_STAGES = [
  {
    id: SEED_IDS.pipelineStageTenantBNew,
    code: 'new',
    name: 'Yeni Lead',
    sortOrder: 1,
    color: '#3b82f6',
  },
  {
    id: SEED_IDS.pipelineStageTenantBQualified,
    code: 'qualified',
    name: 'Nitelikli',
    sortOrder: 2,
    color: '#60a5fa',
  },
  {
    id: SEED_IDS.pipelineStageTenantBProposal,
    code: 'proposal',
    name: 'Teklif',
    sortOrder: 3,
    color: '#ff6a00',
  },
  {
    id: SEED_IDS.pipelineStageTenantBNegotiation,
    code: 'negotiation',
    name: 'Pazarlık',
    sortOrder: 4,
    color: '#a855f7',
  },
  {
    id: SEED_IDS.pipelineStageTenantBWon,
    code: 'won',
    name: 'Kazanıldı',
    sortOrder: 5,
    color: '#22c55e',
  },
  {
    id: SEED_IDS.pipelineStageTenantBLost,
    code: 'lost',
    name: 'Kaybedildi',
    sortOrder: 6,
    color: '#ef4444',
  },
] as const;

async function seedPipelineStages(
  client: PoolClient,
  tenantId: string,
  pipelineId: string,
  createdBy: string,
  stages: ReadonlyArray<{
    id: string;
    code: string;
    name: string;
    sortOrder: number;
    color: string;
  }>,
): Promise<void> {
  for (const stage of stages) {
    await client.query(
      `INSERT INTO pipeline_stages (
         id, tenant_id, pipeline_id, name, code, sort_order, color, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [stage.id, tenantId, pipelineId, stage.name, stage.code, stage.sortOrder, stage.color, createdBy],
    );
  }
}

export async function seedSalesData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_SALES_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_SALES_PERMISSIONS) {
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
      `INSERT INTO pipelines (id, tenant_id, name, code, is_default, created_by)
       VALUES ($1, $2, 'Default Pipeline', 'default', TRUE, $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.pipelineDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO pipelines (id, tenant_id, name, code, is_default, created_by)
       VALUES ($1, $2, 'Tenant B Pipeline', 'default', TRUE, $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.pipelineTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await seedPipelineStages(
      client,
      SEED_IDS.tenantDefault,
      SEED_IDS.pipelineDefault,
      SEED_IDS.userAdmin,
      DEFAULT_PIPELINE_STAGES,
    );

    await seedPipelineStages(
      client,
      SEED_IDS.tenantB,
      SEED_IDS.pipelineTenantB,
      SEED_IDS.userMemberB,
      TENANT_B_PIPELINE_STAGES,
    );

    await client.query(
      `INSERT INTO opportunities (
         id, tenant_id, pipeline_id, stage_id, lead_id, customer_id, title, company_name,
         amount, probability, status, assigned_user_id, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'Default Lead Opportunity', 'Default Lead Co', 95000, 45, 'open', $7, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.opportunityDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.pipelineDefault,
        SEED_IDS.pipelineStageDefaultNew,
        SEED_IDS.leadDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO opportunities (
         id, tenant_id, pipeline_id, stage_id, lead_id, customer_id, title, company_name,
         amount, probability, status, assigned_user_id, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'Tenant B Lead Opportunity', 'Tenant B Lead Co', 128000, 55, 'open', $7, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.opportunityTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.pipelineTenantB,
        SEED_IDS.pipelineStageTenantBNew,
        SEED_IDS.leadTenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO lead_conversion_logs (
         id, tenant_id, lead_id, opportunity_id, customer_id, converted_at, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, NOW(), 'Seed conversion for default tenant.', $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.leadConversionLogDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.leadDefault,
        SEED_IDS.opportunityDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO lead_conversion_logs (
         id, tenant_id, lead_id, opportunity_id, customer_id, converted_at, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, NOW(), 'Seed conversion for tenant B.', $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.leadConversionLogTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.leadTenantB,
        SEED_IDS.opportunityTenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO opportunity_stage_history (
         id, tenant_id, opportunity_id, from_stage_id, to_stage_id, changed_at, created_by
       )
       VALUES ($1, $2, $3, NULL, $4, NOW(), $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.opportunityStageHistoryDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.opportunityDefault,
        SEED_IDS.pipelineStageDefaultNew,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO opportunity_stage_history (
         id, tenant_id, opportunity_id, from_stage_id, to_stage_id, changed_at, created_by
       )
       VALUES ($1, $2, $3, NULL, $4, NOW(), $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.opportunityStageHistoryTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.opportunityTenantB,
        SEED_IDS.pipelineStageTenantBNew,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
