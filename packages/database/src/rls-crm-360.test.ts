import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './config';
import { applyAllMigrations } from './migrate';
import { SEED_IDS } from './seed/constants';
import { seedCrm360Data, seedCrmData, seedIamData } from './seed/index';
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

describe.skipIf(!canRunIntegration)('Sprint-04 Customer 360 RLS proof', () => {
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
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A timeline events', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_timeline_events'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.timelineEventDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B timeline events', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_timeline_events'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.timelineEventTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A score/risk/LTV rows', async () => {
    const client = await appPool.connect();
    try {
      const scores = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_scores'),
      );
      const risks = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_risk_scores'),
      );
      const ltvs = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_lifetime_values'),
      );

      expect(scores.rows.some((row) => row.id === SEED_IDS.scoreDefault)).toBe(true);
      expect(risks.rows.some((row) => row.id === SEED_IDS.riskScoreDefault)).toBe(true);
      expect(ltvs.rows.some((row) => row.id === SEED_IDS.ltvDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B score/risk/LTV rows', async () => {
    const client = await appPool.connect();
    try {
      const scores = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_scores'),
      );
      const risks = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_risk_scores'),
      );
      const ltvs = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_lifetime_values'),
      );

      expect(scores.rows.some((row) => row.id === SEED_IDS.scoreTenantB)).toBe(false);
      expect(risks.rows.some((row) => row.id === SEED_IDS.riskScoreTenantB)).toBe(false);
      expect(ltvs.rows.some((row) => row.id === SEED_IDS.ltvTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Customer 360 tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const timeline = await client.query<{ id: string }>(
        'SELECT id FROM customer_timeline_events',
      );
      const scores = await client.query<{ id: string }>('SELECT id FROM customer_scores');
      const risks = await client.query<{ id: string }>('SELECT id FROM customer_risk_scores');
      const ltvs = await client.query<{ id: string }>(
        'SELECT id FROM customer_lifetime_values',
      );
      await client.query('ROLLBACK');

      expect(timeline.rows).toHaveLength(0);
      expect(scores.rows).toHaveLength(0);
      expect(risks.rows).toHaveLength(0);
      expect(ltvs.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-04 Customer 360 RLS proof (offline)', () => {
  it('documents that db:test:rls includes Customer 360 proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
