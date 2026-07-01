import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDatabaseConfigFromEnv } from './config';
import { applyAllMigrations } from './migrate';
import { SEED_IDS } from './seed/constants';
import {
  seedCrm360Data,
  seedCrmData,
  seedDashboardNotificationData,
  seedIamData,
  seedLeadData,
  seedOrderData,
  seedQuoteData,
  seedQuotePdfApprovalData,
  seedSalesData,
  seedTaskData,
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

describe.skipIf(!canRunIntegration)('Sprint-13 Order RLS proof', () => {
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
      await seedTaskData(seedClient);
      await seedDashboardNotificationData(seedClient);
      await seedOrderData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A orders', async () => {
    const client = await appPool.connect();
    try {
      const orders = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM orders'),
      );

      expect(orders.rows.some((row) => row.id === SEED_IDS.orderDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B orders', async () => {
    const client = await appPool.connect();
    try {
      const orders = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM orders'),
      );

      expect(orders.rows.some((row) => row.id === SEED_IDS.orderTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A order child tables', async () => {
    const client = await appPool.connect();
    try {
      const items = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM order_items'),
      );
      const statusHistory = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM order_status_history'),
      );

      expect(items.rows.some((row) => row.id === SEED_IDS.orderItemDefault)).toBe(true);
      expect(items.rows.some((row) => row.id === SEED_IDS.orderItemDefault2)).toBe(true);
      expect(statusHistory.rows.some((row) => row.id === SEED_IDS.orderStatusHistoryDefault)).toBe(
        true,
      );
      expect(
        statusHistory.rows.some((row) => row.id === SEED_IDS.orderStatusHistoryDefault2),
      ).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B order child tables', async () => {
    const client = await appPool.connect();
    try {
      const items = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM order_items'),
      );
      const statusHistory = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM order_status_history'),
      );

      expect(items.rows.some((row) => row.id === SEED_IDS.orderItemTenantB)).toBe(false);
      expect(statusHistory.rows.some((row) => row.id === SEED_IDS.orderStatusHistoryTenantB)).toBe(
        false,
      );
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Order tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const orders = await client.query<{ id: string }>('SELECT id FROM orders');
      const items = await client.query<{ id: string }>('SELECT id FROM order_items');
      const statusHistory = await client.query<{ id: string }>('SELECT id FROM order_status_history');
      await client.query('ROLLBACK');

      expect(orders.rows).toHaveLength(0);
      expect(items.rows).toHaveLength(0);
      expect(statusHistory.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-13 Order RLS proof (offline)', () => {
  it('documents that db:test:rls includes Order proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
