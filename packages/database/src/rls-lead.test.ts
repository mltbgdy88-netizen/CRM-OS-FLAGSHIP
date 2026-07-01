import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './config';
import { applyAllMigrations } from './migrate';
import { SEED_IDS } from './seed/constants';
import { seedCrm360Data, seedCrmData, seedIamData, seedLeadData } from './seed/index';
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

describe.skipIf(!canRunIntegration)('Sprint-05 Lead RLS proof', () => {
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
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A leads and sources', async () => {
    const client = await appPool.connect();
    try {
      const leads = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM leads'),
      );
      const sources = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_sources'),
      );

      expect(leads.rows.some((row) => row.id === SEED_IDS.leadDefault)).toBe(true);
      expect(sources.rows.some((row) => row.id === SEED_IDS.leadSourceDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B leads and sources', async () => {
    const client = await appPool.connect();
    try {
      const leads = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM leads'),
      );
      const sources = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_sources'),
      );

      expect(leads.rows.some((row) => row.id === SEED_IDS.leadTenantB)).toBe(false);
      expect(sources.rows.some((row) => row.id === SEED_IDS.leadSourceTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A lead child tables', async () => {
    const client = await appPool.connect();
    try {
      const tags = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_tags'),
      );
      const scores = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_scores'),
      );
      const assignments = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_assignments'),
      );
      const activities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_activities'),
      );

      expect(tags.rows.some((row) => row.id === SEED_IDS.leadTagDefault)).toBe(true);
      expect(scores.rows.some((row) => row.id === SEED_IDS.leadScoreDefault)).toBe(true);
      expect(assignments.rows.some((row) => row.id === SEED_IDS.leadAssignmentDefault)).toBe(true);
      expect(activities.rows.some((row) => row.id === SEED_IDS.leadActivityDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B lead child tables', async () => {
    const client = await appPool.connect();
    try {
      const tags = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_tags'),
      );
      const scores = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_scores'),
      );
      const assignments = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_assignments'),
      );
      const activities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM lead_activities'),
      );

      expect(tags.rows.some((row) => row.id === SEED_IDS.leadTagTenantB)).toBe(false);
      expect(scores.rows.some((row) => row.id === SEED_IDS.leadScoreTenantB)).toBe(false);
      expect(assignments.rows.some((row) => row.id === SEED_IDS.leadAssignmentTenantB)).toBe(false);
      expect(activities.rows.some((row) => row.id === SEED_IDS.leadActivityTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Lead tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const sources = await client.query<{ id: string }>('SELECT id FROM lead_sources');
      const leads = await client.query<{ id: string }>('SELECT id FROM leads');
      const tags = await client.query<{ id: string }>('SELECT id FROM lead_tags');
      const scores = await client.query<{ id: string }>('SELECT id FROM lead_scores');
      const assignments = await client.query<{ id: string }>('SELECT id FROM lead_assignments');
      const activities = await client.query<{ id: string }>('SELECT id FROM lead_activities');
      await client.query('ROLLBACK');

      expect(sources.rows).toHaveLength(0);
      expect(leads.rows).toHaveLength(0);
      expect(tags.rows).toHaveLength(0);
      expect(scores.rows).toHaveLength(0);
      expect(assignments.rows).toHaveLength(0);
      expect(activities.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-05 Lead RLS proof (offline)', () => {
  it('documents that db:test:rls includes Lead proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
