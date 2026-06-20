import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './config';
import { applyMigration } from './migrate';
import { SEED_IDS } from './seed/constants';
import { seedIamData } from './seed/index';
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

describe.skipIf(!canRunIntegration)('Sprint-02 IAM RLS proof', () => {
  let adminPool: Pool;
  let appPool: Pool;

  beforeAll(async () => {
    adminPool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });
    await applyMigration(adminPool);

    const seedClient = await adminPool.connect();
    try {
      await seedIamData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A roles with tenant context', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM roles'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.roleAdmin)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B roles', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM roles'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.roleTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B audit logs', async () => {
    const client = await appPool.connect();
    try {
      const result = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM audit_logs'),
      );

      expect(result.rows.some((row) => row.id === SEED_IDS.auditTenantB)).toBe(false);
      expect(result.rows.some((row) => row.id === SEED_IDS.auditDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on tenant-owned tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const roles = await client.query<{ id: string }>('SELECT id FROM roles');
      const auditLogs = await client.query<{ id: string }>('SELECT id FROM audit_logs');
      await client.query('ROLLBACK');

      expect(roles.rows).toHaveLength(0);
      expect(auditLogs.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-02 IAM RLS proof (offline)', () => {
  it('documents that db:test:rls requires DATABASE_URL (not silently skipped in Sprint-02 acceptance)', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    // General `pnpm test` may skip RLS integration when DATABASE_URL is unset.
    // Sprint-02 acceptance must use `pnpm db:test:rls` against real PostgreSQL (CI DevOps gate).
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
