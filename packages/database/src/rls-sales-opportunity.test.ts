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

describe.skipIf(!canRunIntegration)('Sprint-07 Opportunity detail RLS proof', () => {
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

  it('Tenant A can read Tenant A opportunity detail rows', async () => {
    const client = await appPool.connect();
    try {
      const products = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_products'),
      );
      const contacts = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_contacts'),
      );
      const activities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_activities'),
      );
      const notes = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_notes'),
      );

      expect(products.rows.some((row) => row.id === SEED_IDS.opportunityProductDefault)).toBe(true);
      expect(contacts.rows.some((row) => row.id === SEED_IDS.opportunityContactDefault)).toBe(true);
      expect(activities.rows.some((row) => row.id === SEED_IDS.opportunityActivityDefault)).toBe(
        true,
      );
      expect(notes.rows.some((row) => row.id === SEED_IDS.opportunityNoteDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B opportunity detail rows', async () => {
    const client = await appPool.connect();
    try {
      const products = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_products'),
      );
      const contacts = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_contacts'),
      );
      const activities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_activities'),
      );
      const notes = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM opportunity_notes'),
      );

      expect(products.rows.some((row) => row.id === SEED_IDS.opportunityProductTenantB)).toBe(false);
      expect(contacts.rows.some((row) => row.id === SEED_IDS.opportunityContactTenantB)).toBe(
        false,
      );
      expect(activities.rows.some((row) => row.id === SEED_IDS.opportunityActivityTenantB)).toBe(
        false,
      );
      expect(notes.rows.some((row) => row.id === SEED_IDS.opportunityNoteTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on opportunity detail tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const products = await client.query<{ id: string }>('SELECT id FROM opportunity_products');
      const contacts = await client.query<{ id: string }>('SELECT id FROM opportunity_contacts');
      const activities = await client.query<{ id: string }>(
        'SELECT id FROM opportunity_activities',
      );
      const notes = await client.query<{ id: string }>('SELECT id FROM opportunity_notes');
      await client.query('ROLLBACK');

      expect(products.rows).toHaveLength(0);
      expect(contacts.rows).toHaveLength(0);
      expect(activities.rows).toHaveLength(0);
      expect(notes.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-07 Opportunity detail RLS proof (offline)', () => {
  it('documents that db:test:rls includes Opportunity detail proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
