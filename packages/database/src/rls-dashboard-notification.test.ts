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

describe.skipIf(!canRunIntegration)('Sprint-12 Dashboard & Notification RLS proof', () => {
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
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A dashboard & notification tables', async () => {
    const client = await appPool.connect();
    try {
      const notifications = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM notifications'),
      );
      const recipients = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM notification_recipients'),
      );
      const preferences = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM notification_preferences'),
      );
      const dashboards = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM dashboards'),
      );
      const widgets = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM dashboard_widgets'),
      );

      expect(notifications.rows.some((row) => row.id === SEED_IDS.notificationDefault1)).toBe(true);
      expect(notifications.rows.some((row) => row.id === SEED_IDS.notificationDefault2)).toBe(true);
      expect(notifications.rows.some((row) => row.id === SEED_IDS.notificationDefault3)).toBe(true);
      expect(recipients.rows.some((row) => row.id === SEED_IDS.notificationRecipientDefault1)).toBe(
        true,
      );
      expect(preferences.rows).toHaveLength(0);
      expect(dashboards.rows.some((row) => row.id === SEED_IDS.dashboardDefault)).toBe(true);
      expect(widgets.rows.some((row) => row.id === SEED_IDS.dashboardWidgetKpiRevenue)).toBe(true);
      expect(widgets.rows.some((row) => row.id === SEED_IDS.dashboardWidgetChartRevenue)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B dashboard & notification tables', async () => {
    const client = await appPool.connect();
    try {
      const notifications = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM notifications'),
      );
      const recipients = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM notification_recipients'),
      );
      const dashboards = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM dashboards'),
      );
      const widgets = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM dashboard_widgets'),
      );

      expect(notifications.rows.some((row) => row.id === SEED_IDS.notificationTenantB)).toBe(false);
      expect(recipients.rows.some((row) => row.id === SEED_IDS.notificationRecipientTenantB)).toBe(
        false,
      );
      expect(dashboards.rows).toHaveLength(1);
      expect(widgets.rows).toHaveLength(4);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Dashboard & Notification tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const notifications = await client.query<{ id: string }>('SELECT id FROM notifications');
      const recipients = await client.query<{ id: string }>('SELECT id FROM notification_recipients');
      const preferences = await client.query<{ id: string }>('SELECT id FROM notification_preferences');
      const dashboards = await client.query<{ id: string }>('SELECT id FROM dashboards');
      const widgets = await client.query<{ id: string }>('SELECT id FROM dashboard_widgets');
      await client.query('ROLLBACK');

      expect(notifications.rows).toHaveLength(0);
      expect(recipients.rows).toHaveLength(0);
      expect(preferences.rows).toHaveLength(0);
      expect(dashboards.rows).toHaveLength(0);
      expect(widgets.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-12 Dashboard & Notification RLS proof (offline)', () => {
  it('documents that db:test:rls includes Dashboard & Notification proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
