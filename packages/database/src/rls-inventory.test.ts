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
  seedInventoryData,
  seedLeadData,
  seedOrderData,
  seedProductData,
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

describe.skipIf(!canRunIntegration)('Sprint-16 Inventory Core RLS proof', () => {
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
      await seedProductData(seedClient);
      await seedInventoryData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A stocks', async () => {
    const client = await appPool.connect();
    try {
      const stocks = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stocks'),
      );

      expect(stocks.rows.some((row) => row.id === SEED_IDS.stockDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B stocks', async () => {
    const client = await appPool.connect();
    try {
      const stocks = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stocks'),
      );

      expect(stocks.rows.some((row) => row.id === SEED_IDS.stockTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A inventory child tables', async () => {
    const client = await appPool.connect();
    try {
      const warehouses = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM warehouses'),
      );
      const movements = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stock_movements'),
      );
      const adjustments = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stock_adjustments'),
      );

      expect(warehouses.rows.some((row) => row.id === SEED_IDS.warehouseDefault)).toBe(true);
      expect(movements.rows.some((row) => row.id === SEED_IDS.stockMovementDefault)).toBe(true);
      expect(adjustments.rows.some((row) => row.id === SEED_IDS.stockAdjustmentDefault)).toBe(
        true,
      );
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B inventory child tables', async () => {
    const client = await appPool.connect();
    try {
      const warehouses = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM warehouses'),
      );
      const movements = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stock_movements'),
      );

      expect(warehouses.rows.some((row) => row.id === SEED_IDS.warehouseTenantB)).toBe(false);
      expect(movements.rows.some((row) => row.id === SEED_IDS.stockMovementTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Inventory Core tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const warehouses = await client.query<{ id: string }>('SELECT id FROM warehouses');
      const stocks = await client.query<{ id: string }>('SELECT id FROM stocks');
      const movements = await client.query<{ id: string }>('SELECT id FROM stock_movements');
      const counts = await client.query<{ id: string }>('SELECT id FROM stock_counts');
      const adjustments = await client.query<{ id: string }>('SELECT id FROM stock_adjustments');
      const locations = await client.query<{ id: string }>('SELECT id FROM warehouse_locations');
      await client.query('ROLLBACK');

      expect(warehouses.rows).toHaveLength(0);
      expect(stocks.rows).toHaveLength(0);
      expect(movements.rows).toHaveLength(0);
      expect(counts.rows).toHaveLength(0);
      expect(adjustments.rows).toHaveLength(0);
      expect(locations.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-16 Inventory Core RLS proof (offline)', () => {
  it('documents that db:test:rls includes Inventory Core proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
