import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './config';
import { applyAllMigrations } from './migrate';
import { SEED_IDS } from './seed/constants';
import { seedCrmData, seedIamData } from './seed/index';
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

describe.skipIf(!canRunIntegration)('Sprint-03 CRM RLS proof', () => {
  let adminPool: Pool;
  let appPool: Pool;

  beforeAll(async () => {
    adminPool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });
    await applyAllMigrations(adminPool);

    const seedClient = await adminPool.connect();
    try {
      await seedIamData(seedClient);
      await seedCrmData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A customers', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customers'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.customerDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B customers', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customers'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.customerTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B customer notes', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_notes'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.noteTenantB)).toBe(false);
      expect(result.rows.some((row) => row.id === SEED_IDS.noteDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on CRM tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const customers = await client.query<{ id: string }>('SELECT id FROM customers');
      const notes = await client.query<{ id: string }>('SELECT id FROM customer_notes');
      const files = await client.query<{ id: string }>('SELECT id FROM customer_files');
      await client.query('ROLLBACK');

      expect(customers.rows).toHaveLength(0);
      expect(notes.rows).toHaveLength(0);
      expect(files.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });

  it('customer_files metadata is visible only within tenant context', async () => {
    const client = await appPool.connect();
    try {
      const tenantA = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM customer_files'),
      );

      expect(tenantA.rows.some((row) => row.id === SEED_IDS.fileDefault)).toBe(true);
      expect(tenantA.rows.some((row) => row.id === SEED_IDS.fileTenantB)).toBe(false);

      const tenantB = await withRlsContext(
        client,
        SEED_IDS.tenantB,
        SEED_IDS.userMemberB,
        async () => client.query<{ id: string }>('SELECT id FROM customer_files'),
      );

      expect(tenantB.rows.some((row) => row.id === SEED_IDS.fileTenantB)).toBe(true);
      expect(tenantB.rows.some((row) => row.id === SEED_IDS.fileDefault)).toBe(false);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-03 CRM RLS proof (offline)', () => {
  it('documents that db:test:rls includes CRM proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
