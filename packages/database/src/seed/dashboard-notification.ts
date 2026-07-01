import type { PoolClient } from 'pg';
import { SEED_DASHBOARD_NOTIFICATION_PERMISSIONS, SEED_IDS } from './constants';

export async function seedDashboardNotificationData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_DASHBOARD_NOTIFICATION_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_DASHBOARD_NOTIFICATION_PERMISSIONS) {
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
      `INSERT INTO dashboards (
         id, tenant_id, name, code, is_default, layout_json, created_by
       )
       VALUES ($1, $2, 'Default Dashboard', 'default', TRUE, '{"columns": 12}'::jsonb, $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.dashboardDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    const widgets = [
      {
        id: SEED_IDS.dashboardWidgetKpiRevenue,
        widgetType: 'kpi_revenue',
        title: 'Revenue KPI',
        sortOrder: 0,
      },
      {
        id: SEED_IDS.dashboardWidgetKpiPipeline,
        widgetType: 'kpi_pipeline',
        title: 'Pipeline KPI',
        sortOrder: 1,
      },
      {
        id: SEED_IDS.dashboardWidgetKpiTasks,
        widgetType: 'kpi_tasks',
        title: 'Tasks KPI',
        sortOrder: 2,
      },
      {
        id: SEED_IDS.dashboardWidgetChartRevenue,
        widgetType: 'chart_revenue',
        title: 'Revenue Chart',
        sortOrder: 3,
      },
    ] as const;

    for (const widget of widgets) {
      await client.query(
        `INSERT INTO dashboard_widgets (
           id, tenant_id, dashboard_id, widget_type, title, config_json, sort_order, created_by
         )
         VALUES ($1, $2, $3, $4, $5, '{}'::jsonb, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          widget.id,
          SEED_IDS.tenantDefault,
          SEED_IDS.dashboardDefault,
          widget.widgetType,
          widget.title,
          widget.sortOrder,
          SEED_IDS.userAdmin,
        ],
      );
    }

    const defaultNotifications = [
      {
        id: SEED_IDS.notificationDefault1,
        recipientId: SEED_IDS.notificationRecipientDefault1,
        title: 'Welcome to CRM OS',
        body: 'Your workspace dashboard is ready.',
        category: 'info',
        severity: 'normal',
      },
      {
        id: SEED_IDS.notificationDefault2,
        recipientId: SEED_IDS.notificationRecipientDefault2,
        title: 'Pipeline update',
        body: 'A new opportunity entered the proposal stage.',
        category: 'sales',
        severity: 'normal',
      },
      {
        id: SEED_IDS.notificationDefault3,
        recipientId: SEED_IDS.notificationRecipientDefault3,
        title: 'Task due soon',
        body: 'Follow up with default customer is due in 3 days.',
        category: 'task',
        severity: 'high',
      },
    ] as const;

    for (const notification of defaultNotifications) {
      await client.query(
        `INSERT INTO notifications (
           id, tenant_id, title, body, category, severity, created_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          notification.id,
          SEED_IDS.tenantDefault,
          notification.title,
          notification.body,
          notification.category,
          notification.severity,
          SEED_IDS.userAdmin,
        ],
      );

      await client.query(
        `INSERT INTO notification_recipients (
           id, tenant_id, notification_id, user_id, created_by
         )
         VALUES ($1, $2, $3, $4, $4)
         ON CONFLICT (id) DO NOTHING`,
        [
          notification.recipientId,
          SEED_IDS.tenantDefault,
          notification.id,
          SEED_IDS.userAdmin,
        ],
      );
    }

    await client.query(
      `INSERT INTO notifications (
         id, tenant_id, title, body, category, severity, created_by
       )
       VALUES ($1, $2, 'Tenant B onboarding', 'Complete your tenant B workspace setup.', 'info', 'normal', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.notificationTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO notification_recipients (
         id, tenant_id, notification_id, user_id, created_by
       )
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.notificationRecipientTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.notificationTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
