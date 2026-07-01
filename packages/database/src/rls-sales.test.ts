import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './config';
import { applyAllMigrations } from './migrate';
import { SEED_IDS } from './seed/constants';
import {
  seedCrm360Data,
  seedCrmData,
  seedIamData,
  seedLeadData,
  seedSalesData,
} from './seed/index';
import { getAppDatabaseUrlFromEnv } from './tenant-context';

async function withRlsContext<T>(
  client: PoolClient,
  tenantId: string,
  userId: string,
  fn: () => Promise<T>,
): Promise<T> {
  await client.query('BEGIN');
  try {
    await client.query(`SELECT set_config('app.tenant_id', $1, true)`, [tenantId]);
    await client.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);
    const result = await fn();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

const databaseUrl = process.env.DATABASE_URL;
const canRunIntegration = Boolean(databaseUrl);

describe.skipIf(!canRunIntegration)('Sprint-06 Sales RLS proof', () => {
  let adminPool: Pool;
  let appPool: Pool;

  beforeAll(async () => {
    adminPool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });
    await applyAllMigrations(adminPool);

    const seedClient = await adminPool.connect();
    try {
      await seedIamData(seedClient);
      await seedCrmData(seedClient);
      await seedCrm360Data(seedClient);
      await seedLeadData(seedClient);
      await seedSalesData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A pipelines and opportunities', async () => {
    const client = await appPool.connect();
    try {
      const pipelines = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM pipelines'),
      );
      const opportunities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunities'),
      );

      expect(pipelines.rows.some((row) => row.id === SEED_IDS.pipelineDefault)).toBe(true);
      expect(opportunities.rows.some((row) => row.id === SEED_IDS.opportunityDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B pipelines and opportunities', async () => {
    const client = await appPool.connect();
    try {
      const pipelines = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM pipelines'),
      );
      const opportunities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunities'),
      );

      expect(pipelines.rows.some((row) => row.id === SEED_IDS.pipelineTenantB)).toBe(false);
      expect(opportunities.rows.some((row) => row.id === SEED_IDS.opportunityTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A sales child tables', async () => {
    const client = await appPool.connect();
    try {
      const stages = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM pipeline_stages'),
      );
      const conversionLogs = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_conversion_logs'),
      );
      const stageHistory = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_stage_history'),
      );

      expect(stages.rows.some((row) => row.id === SEED_IDS.pipelineStageDefaultNew)).toBe(true);
      expect(conversionLogs.rows.some((row) => row.id === SEED_IDS.leadConversionLogDefault)).toBe(
        true,
      );
      expect(
        stageHistory.rows.some((row) => row.id === SEED_IDS.opportunityStageHistoryDefault),
      ).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B sales child tables', async () => {
    const client = await appPool.connect();
    try {
      const stages = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM pipeline_stages'),
      );
      const conversionLogs = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_conversion_logs'),
      );
      const stageHistory = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_stage_history'),
      );

      expect(stages.rows.some((row) => row.id === SEED_IDS.pipelineStageTenantBNew)).toBe(false);
      expect(conversionLogs.rows.some((row) => row.id === SEED_IDS.leadConversionLogTenantB)).toBe(
        false,
      );
      expect(
        stageHistory.rows.some((row) => row.id === SEED_IDS.opportunityStageHistoryTenantB),
      ).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Sales tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const pipelines = await client.query<{ id: string }>('SELECT id FROM pipelines');
      const stages = await client.query<{ id: string }>('SELECT id FROM pipeline_stages');
      const opportunities = await client.query<{ id: string }>('SELECT id FROM opportunities');
      const conversionLogs = await client.query<{ id: string }>('SELECT id FROM lead_conversion_logs');
      const stageHistory = await client.query<{ id: string }>(
        'SELECT id FROM opportunity_stage_history',
      );
      await client.query('ROLLBACK');

      expect(pipelines.rows).toHaveLength(0);
      expect(stages.rows).toHaveLength(0);
      expect(opportunities.rows).toHaveLength(0);
      expect(conversionLogs.rows).toHaveLength(0);
      expect(stageHistory.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-06 Sales RLS proof (offline)', () => {
  it('documents that db:test:rls includes Sales proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
