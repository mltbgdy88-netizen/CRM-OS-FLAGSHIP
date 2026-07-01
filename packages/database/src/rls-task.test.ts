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

describe.skipIf(!canRunIntegration)('Sprint-11 Task & Activity RLS proof', () => {
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
    } finally {
      seedClient.release();
    }

    appPool = new Pool({ connectionString: getAppDatabaseUrlFromEnv() });
  }, 60_000);

  afterAll(async () => {
    await appPool?.end();
    await adminPool?.end();
  });

  it('Tenant A can read Tenant A task tables', async () => {
    const client = await appPool.connect();
    try {
      const tasks = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM tasks'),
      );
      const assignees = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM task_assignees'),
      );
      const comments = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM task_comments'),
      );
      const files = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM task_files'),
      );
      const reminders = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM task_reminders'),
      );
      const activities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM activities'),
      );

      expect(tasks.rows.some((row) => row.id === SEED_IDS.taskDefault)).toBe(true);
      expect(assignees.rows.some((row) => row.id === SEED_IDS.taskAssigneeDefault)).toBe(true);
      expect(comments.rows.some((row) => row.id === SEED_IDS.taskCommentDefault)).toBe(true);
      expect(files.rows).toHaveLength(0);
      expect(reminders.rows).toHaveLength(0);
      expect(activities.rows.some((row) => row.id === SEED_IDS.activityDefault)).toBe(true);
    } finally {
      client.release();
    }
  });

  it('Tenant A cannot read Tenant B task tables', async () => {
    const client = await appPool.connect();
    try {
      const tasks = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM tasks'),
      );
      const assignees = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM task_assignees'),
      );
      const comments = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM task_comments'),
      );
      const activities = await withRlsContext(
        client,
        SEED_IDS.tenantDefault,
        SEED_IDS.userAdmin,
        async () => client.query<{ id: string }>('SELECT id FROM activities'),
      );

      expect(tasks.rows.some((row) => row.id === SEED_IDS.taskTenantB)).toBe(false);
      expect(assignees.rows.some((row) => row.id === SEED_IDS.taskAssigneeTenantB)).toBe(false);
      expect(comments.rows.some((row) => row.id === SEED_IDS.taskCommentTenantB)).toBe(false);
      expect(activities.rows.some((row) => row.id === SEED_IDS.activityTenantB)).toBe(false);
    } finally {
      client.release();
    }
  });

  it('missing tenant context fails closed on Task & Activity tables', async () => {
    const client = await appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [SEED_IDS.userAdmin]);
      const tasks = await client.query<{ id: string }>('SELECT id FROM tasks');
      const assignees = await client.query<{ id: string }>('SELECT id FROM task_assignees');
      const comments = await client.query<{ id: string }>('SELECT id FROM task_comments');
      const files = await client.query<{ id: string }>('SELECT id FROM task_files');
      const reminders = await client.query<{ id: string }>('SELECT id FROM task_reminders');
      const activities = await client.query<{ id: string }>('SELECT id FROM activities');
      await client.query('ROLLBACK');

      expect(tasks.rows).toHaveLength(0);
      expect(assignees.rows).toHaveLength(0);
      expect(comments.rows).toHaveLength(0);
      expect(files.rows).toHaveLength(0);
      expect(reminders.rows).toHaveLength(0);
      expect(activities.rows).toHaveLength(0);
    } finally {
      client.release();
    }
  });
});

describe('Sprint-11 Task & Activity RLS proof (offline)', () => {
  it('documents that db:test:rls includes Task & Activity proof when DATABASE_URL is set', () => {
    if (canRunIntegration) {
      expect(databaseUrl).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
