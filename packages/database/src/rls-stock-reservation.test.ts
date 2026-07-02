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
  seedStockReservationData,
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

describe.skipIf(!canRunIntegration)('Sprint-17 Stock Reservation RLS proof', () => {
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
      await seedStockReservationData(seedClient);
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A stock reservations', async () => {
    const client = await appPool.connect();
    try {
      const reservations = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stock_reservations'),
      );

      expect(
        reservations.rows.some((row) => row.id === SEED_IDS.stockReservationDefault),
      ).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B stock reservations', async () => {
    const client = await appPool.connect();
    try {
      const reservations = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM stock_reservations'),
      );

      expect(
        reservations.rows.some((row) => row.id === SEED_IDS.stockReservationTenantB),
      ).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on reservation tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const stockReservations = await client.query<{ id: string }>(
        'SELECT id FROM stock_reservations',
      );
      const orderReservations = await client.query<{ id: string }>(
        'SELECT id FROM order_reservations',
      );
      await client.query('ROLLBACK');

      expect(stockReservations.rows).toHaveLength(0);
      expect(orderReservations.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-17 Stock Reservation RLS proof (offline)', () => {
  it('documents that db:test:rls includes Stock Reservation proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
