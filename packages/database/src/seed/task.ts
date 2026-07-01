import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_TASK_PERMISSIONS } from './constants';

export async function seedTaskData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_TASK_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_TASK_PERMISSIONS) {
      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantDefault, SEED_IDS.roleAdmin, permission.id],
      );

      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantB, SEED_IDS.roleTenantB, permission.id],
      );
    }

    await client.query(
      `INSERT INTO tasks (
         id, tenant_id, title, description, priority, status, due_at,
         related_type, related_id, assigned_user_id, created_by
       )
       VALUES ($1, $2, 'Follow up with default customer', 'Schedule renewal discussion.',
               'high', 'pending', NOW() + INTERVAL '3 days',
               'customer', $3, $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.taskDefault, SEED_IDS.tenantDefault, SEED_IDS.customerDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO tasks (
         id, tenant_id, title, description, priority, status, due_at,
         related_type, related_id, assigned_user_id, created_by
       )
       VALUES ($1, $2, 'Tenant B customer check-in', 'Confirm onboarding completion.',
               'medium', 'pending', NOW() + INTERVAL '5 days',
               'customer', $3, $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.taskTenantB, SEED_IDS.tenantB, SEED_IDS.customerTenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO task_assignees (id, tenant_id, task_id, user_id, is_primary, created_by)
       VALUES ($1, $2, $3, $4, TRUE, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.taskAssigneeDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.taskDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO task_assignees (id, tenant_id, task_id, user_id, is_primary, created_by)
       VALUES ($1, $2, $3, $4, TRUE, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.taskAssigneeTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.taskTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO task_comments (id, tenant_id, task_id, body, author_user_id, created_by)
       VALUES ($1, $2, $3, 'Customer requested a call next week.', $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.taskCommentDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.taskDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO task_comments (id, tenant_id, task_id, body, author_user_id, created_by)
       VALUES ($1, $2, $3, 'Onboarding docs sent to customer.', $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.taskCommentTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.taskTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO activities (
         id, tenant_id, activity_type, title, body,
         related_type, related_id, task_id, created_by
       )
       VALUES ($1, $2, 'call', 'Initial follow-up call',
               'Logged call activity for default customer.', 'customer', $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.activityDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.customerDefault,
        SEED_IDS.taskDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO activities (
         id, tenant_id, activity_type, title, body,
         related_type, related_id, task_id, created_by
       )
       VALUES ($1, $2, 'note', 'Onboarding check-in',
               'Logged onboarding activity for tenant B customer.', 'customer', $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.activityTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.customerTenantB,
        SEED_IDS.taskTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
