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

describe.skipIf(!canRunIntegration)('Sprint-09 Quote RLS proof', () => {
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
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A quotes', async () => {
    const client = await appPool.connect();
    try {
      const quotes = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quotes'),
      );

      expect(quotes.rows.some((row) => row.id === SEED_IDS.quoteDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B quotes', async () => {
    const client = await appPool.connect();
    try {
      const quotes = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quotes'),
      );

      expect(quotes.rows.some((row) => row.id === SEED_IDS.quoteTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('Tenant A can read Tenant A quote child tables', async () => {
    const client = await appPool.connect();
    try {
      const versions = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_versions'),
      );
      const items = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_items'),
      );
      const discounts = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_discounts'),
      );
      const taxes = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_taxes'),
      );

      expect(versions.rows.some((row) => row.id === SEED_IDS.quoteVersionDefault)).toBe(true);
      expect(items.rows.some((row) => row.id === SEED_IDS.quoteItemDefault)).toBe(true);
      expect(discounts.rows.some((row) => row.id === SEED_IDS.quoteDiscountDefault)).toBe(true);
      expect(taxes.rows.some((row) => row.id === SEED_IDS.quoteTaxDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B quote child tables', async () => {
    const client = await appPool.connect();
    try {
      const versions = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_versions'),
      );
      const items = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_items'),
      );
      const discounts = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_discounts'),
      );
      const taxes = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM quote_taxes'),
      );

      expect(versions.rows.some((row) => row.id === SEED_IDS.quoteVersionTenantB)).toBe(false);
      expect(items.rows.some((row) => row.id === SEED_IDS.quoteItemTenantB)).toBe(false);
      expect(discounts.rows.some((row) => row.id === SEED_IDS.quoteDiscountTenantB)).toBe(false);
      expect(taxes.rows.some((row) => row.id === SEED_IDS.quoteTaxTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Quote tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const quotes = await client.query<{ id: string }>('SELECT id FROM quotes');
      const versions = await client.query<{ id: string }>('SELECT id FROM quote_versions');
      const items = await client.query<{ id: string }>('SELECT id FROM quote_items');
      const discounts = await client.query<{ id: string }>('SELECT id FROM quote_discounts');
      const taxes = await client.query<{ id: string }>('SELECT id FROM quote_taxes');
      await client.query('ROLLBACK');

      expect(quotes.rows).toHaveLength(0);
      expect(versions.rows).toHaveLength(0);
      expect(items.rows).toHaveLength(0);
      expect(discounts.rows).toHaveLength(0);
      expect(taxes.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-09 Quote RLS proof (offline)', () => {
  it('documents that db:test:rls includes Quote proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
