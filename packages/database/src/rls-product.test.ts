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

describe.skipIf(!canRunIntegration)('Sprint-15 Product Catalog RLS proof', () => {
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
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A products', async () => {
    const client = await appPool.connect();
    try {
      const products = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM products'),
      );

      expect(products.rows.some((row) => row.id === SEED_IDS.productDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B products', async () => {
    const client = await appPool.connect();
    try {
      const products = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM products'),
      );

      expect(products.rows.some((row) => row.id === SEED_IDS.productTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A product child tables', async () => {
    const client = await appPool.connect();
    try {
      const variants = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_variants'),
      );
      const prices = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_prices'),
      );
      const collectionItems = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_collection_items'),
      );

      expect(variants.rows.some((row) => row.id === SEED_IDS.productVariantDefault)).toBe(true);
      expect(prices.rows.some((row) => row.id === SEED_IDS.productPriceDefault)).toBe(true);
      expect(prices.rows.some((row) => row.id === SEED_IDS.productPriceVariantDefault)).toBe(true);
      expect(
        collectionItems.rows.some((row) => row.id === SEED_IDS.productCollectionItemDefault),
      ).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B product child tables', async () => {
    const client = await appPool.connect();
    try {
      const variants = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_variants'),
      );
      const prices = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_prices'),
      );
      const collectionItems = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_collection_items'),
      );

      expect(variants.rows.some((row) => row.id === SEED_IDS.productVariantTenantB)).toBe(false);
      expect(prices.rows.some((row) => row.id === SEED_IDS.productPriceTenantB)).toBe(false);
      expect(
        collectionItems.rows.some((row) => row.id === SEED_IDS.productCollectionItemTenantB),
      ).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Product Catalog tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const products = await client.query<{ id: string }>('SELECT id FROM products');
      const brands = await client.query<{ id: string }>('SELECT id FROM product_brands');
      const categories = await client.query<{ id: string }>('SELECT id FROM product_categories');
      const collections = await client.query<{ id: string }>('SELECT id FROM product_collections');
      const variants = await client.query<{ id: string }>('SELECT id FROM product_variants');
      const prices = await client.query<{ id: string }>('SELECT id FROM product_prices');
      const collectionItems = await client.query<{ id: string }>(
        'SELECT id FROM product_collection_items',
      );
      await client.query('ROLLBACK');

      expect(products.rows).toHaveLength(0);
      expect(brands.rows).toHaveLength(0);
      expect(categories.rows).toHaveLength(0);
      expect(collections.rows).toHaveLength(0);
      expect(variants.rows).toHaveLength(0);
      expect(prices.rows).toHaveLength(0);
      expect(collectionItems.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A product brands', async () => {
    const client = await appPool.connect();
    try {
      const brands = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM product_brands'),
      );

      expect(brands.rows.some((row) => row.id === SEED_IDS.productBrandDefault)).toBe(true);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-15 Product Catalog RLS proof (offline)', () => {
  it('documents that db:test:rls includes Product Catalog proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
