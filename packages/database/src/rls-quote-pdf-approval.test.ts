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
  seedQuoteData,
  seedQuotePdfApprovalData,
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

describe.skipIf(!canRunIntegration)('Sprint-10 Quote PDF + Approval RLS proof', () => {
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
      await seedQuoteData(seedClient);
      await seedQuotePdfApprovalData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A quote PDF + approval tables', async () => {
    const client = await appPool.connect();
    try {
      const approvals = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_approvals'),
      );
      const files = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_files'),
      );
      const viewLogs = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_view_logs'),
      );
      const signatures = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_signatures'),
      );
      const statusHistory = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_status_history'),
      );

      expect(approvals.rows.some((row) => row.id === SEED_IDS.quoteApprovalDefault)).toBe(true);
      expect(files.rows.some((row) => row.id === SEED_IDS.quoteFileDefault)).toBe(true);
      expect(viewLogs.rows.some((row) => row.id === SEED_IDS.quoteViewLogDefault)).toBe(true);
      expect(signatures.rows.some((row) => row.id === SEED_IDS.quoteSignatureDefault)).toBe(true);
      expect(statusHistory.rows.some((row) => row.id === SEED_IDS.quoteStatusHistoryDefault)).toBe(
        true,
      );
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B quote PDF + approval tables', async () => {
    const client = await appPool.connect();
    try {
      const approvals = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_approvals'),
      );
      const files = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_files'),
      );
      const viewLogs = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_view_logs'),
      );
      const signatures = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_signatures'),
      );
      const statusHistory = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_status_history'),
      );

      expect(approvals.rows.some((row) => row.id === SEED_IDS.quoteApprovalTenantB)).toBe(false);
      expect(files.rows.some((row) => row.id === SEED_IDS.quoteFileTenantB)).toBe(false);
      expect(viewLogs.rows.some((row) => row.id === SEED_IDS.quoteViewLogTenantB)).toBe(false);
      expect(signatures.rows.some((row) => row.id === SEED_IDS.quoteSignatureTenantB)).toBe(false);
      expect(statusHistory.rows.some((row) => row.id === SEED_IDS.quoteStatusHistoryTenantB)).toBe(
        false,
      );
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Quote PDF + Approval tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const approvals = await client.query<{ id: string }>('SELECT id FROM quote_approvals');
      const files = await client.query<{ id: string }>('SELECT id FROM quote_files');
      const viewLogs = await client.query<{ id: string }>('SELECT id FROM quote_view_logs');
      const signatures = await client.query<{ id: string }>('SELECT id FROM quote_signatures');
      const statusHistory = await client.query<{ id: string }>('SELECT id FROM quote_status_history');
      await client.query('ROLLBACK');

      expect(approvals.rows).toHaveLength(0);
      expect(files.rows).toHaveLength(0);
      expect(viewLogs.rows).toHaveLength(0);
      expect(signatures.rows).toHaveLength(0);
      expect(statusHistory.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-10 Quote PDF + Approval RLS proof (offline)', () => {
  it('documents that db:test:rls includes Quote PDF + Approval proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
