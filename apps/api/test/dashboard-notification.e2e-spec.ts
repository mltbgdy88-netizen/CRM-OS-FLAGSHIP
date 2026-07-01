import { createHash } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  applyMigrationFromEnv,
  disconnectPrismaClient,
  getAppDatabaseUrlFromEnv,
  getPrismaClient,
  SEED_ADMIN_PASSWORD,
  SEED_IDS,
  seedIamFromEnv,
} from '@crm-os/database';
import { AppModule } from '../src/app.module';
import { DomainEventPublisher } from '../src/modules/iam/services/audit.service';

const DASHBOARD_READ_ONLY_USER = {
  id: '69000000-0000-4000-8000-000000000001',
  memberId: '69000000-0000-4000-8000-000000000002',
  roleId: '69000000-0000-4000-8000-000000000003',
  email: 'dashboard-read-only@default.local',
};

const NOTIFICATION_READ_ONLY_USER = {
  id: '69000000-0000-4000-8000-000000000011',
  memberId: '69000000-0000-4000-8000-000000000012',
  roleId: '69000000-0000-4000-8000-000000000013',
  email: 'notification-read-only@default.local',
};

const TENANT_B_NOTIFICATION_USER = {
  id: '69000000-0000-4000-8000-000000000031',
  memberId: '69000000-0000-4000-8000-000000000032',
  roleId: '69000000-0000-4000-8000-000000000033',
  email: 'notification-read@tenant-b.local',
};

const TENANT_B_NOTIFICATION_RECIPIENT_ID = '68400000-0000-4000-8000-000000000005';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeDashboardNotification = hasDatabase ? describe : describe.skip;

async function seedDedicatedDashboardNotificationUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: DASHBOARD_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'dashboard_read_only',
      roleName: 'Dashboard Read Only',
      permissionIds: [SEED_IDS.permissionDashboardRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: NOTIFICATION_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'notification_read_only',
      roleName: 'Notification Read Only',
      permissionIds: [SEED_IDS.permissionNotificationRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_NOTIFICATION_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'notification_read_tenant_b',
      roleName: 'Notification Read Tenant B',
      permissionIds: [SEED_IDS.permissionNotificationRead],
      createdBy: SEED_IDS.userMemberB,
    },
  ] as const;

  for (const entry of dedicatedUsers) {
    await prisma.user.upsert({
      where: { id: entry.user.id },
      update: {
        email: entry.user.email,
        passwordHash,
        firstName: entry.roleName.split(' ')[0],
        lastName: entry.roleName.split(' ').slice(1).join(' ') || 'User',
        status: 'active',
      },
      create: {
        id: entry.user.id,
        email: entry.user.email,
        passwordHash,
        firstName: entry.roleName.split(' ')[0],
        lastName: entry.roleName.split(' ').slice(1).join(' ') || 'User',
        status: 'active',
      },
    });

    const membership = await prisma.tenantMember.upsert({
      where: {
        tenantId_userId: {
          tenantId: entry.tenantId,
          userId: entry.user.id,
        },
      },
      update: { status: 'active' },
      create: {
        id: entry.user.memberId,
        tenantId: entry.tenantId,
        userId: entry.user.id,
        status: 'active',
        joinedAt: new Date(),
      },
    });

    const role = await prisma.role.upsert({
      where: {
        tenantId_code: {
          tenantId: entry.tenantId,
          code: entry.roleCode,
        },
      },
      update: { name: entry.roleName, deletedAt: null, deletedBy: null },
      create: {
        id: entry.user.roleId,
        tenantId: entry.tenantId,
        code: entry.roleCode,
        name: entry.roleName,
        isSystem: false,
        createdBy: entry.createdBy,
      },
    });

    for (const permissionId of entry.permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        update: { tenantId: entry.tenantId },
        create: {
          tenantId: entry.tenantId,
          roleId: role.id,
          permissionId,
        },
      });
    }

    await prisma.memberRole.upsert({
      where: {
        tenantMemberId_roleId: {
          tenantMemberId: membership.id,
          roleId: role.id,
        },
      },
      update: { tenantId: entry.tenantId },
      create: {
        tenantId: entry.tenantId,
        tenantMemberId: membership.id,
        roleId: role.id,
      },
    });
  }

  await prisma.notificationRecipient.upsert({
    where: { id: TENANT_B_NOTIFICATION_RECIPIENT_ID },
    update: {
      tenantId: SEED_IDS.tenantB,
      notificationId: SEED_IDS.notificationTenantB,
      userId: TENANT_B_NOTIFICATION_USER.id,
      deletedAt: null,
    },
    create: {
      id: TENANT_B_NOTIFICATION_RECIPIENT_ID,
      tenantId: SEED_IDS.tenantB,
      notificationId: SEED_IDS.notificationTenantB,
      userId: TENANT_B_NOTIFICATION_USER.id,
      createdBy: TENANT_B_NOTIFICATION_USER.id,
    },
  });
}

describeDashboardNotification('Dashboard & Notifications (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let eventPublisher: DomainEventPublisher;

  beforeAll(async () => {
    process.env.DATABASE_APP_URL =
      process.env.DATABASE_APP_URL ?? getAppDatabaseUrlFromEnv();
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-local-only';

    await applyMigrationFromEnv();
    await seedIamFromEnv();

    const passwordHash = createHash('sha256').update(SEED_ADMIN_PASSWORD).digest('hex');
    await seedDedicatedDashboardNotificationUsers(passwordHash);

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    eventPublisher = app.get(DomainEventPublisher);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@default.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    accessToken = loginResponse.body.data.accessToken;
  }, 120_000);

  beforeEach(() => {
    eventPublisher.clear();
  });

  afterAll(async () => {
    await app?.close();
    await disconnectPrismaClient();
  });

  it('GET /api/v1/dashboard requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/dashboard').expect(401);
  });

  it('GET /api/v1/dashboard requires dashboard.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: NOTIFICATION_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/dashboard returns default dashboard with live KPIs for admin', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const dashboard = response.body.data;
    expect(dashboard.id).toBe(SEED_IDS.dashboardDefault);
    expect(dashboard.isDefault).toBe(true);
    expect(dashboard.widgets.length).toBeGreaterThanOrEqual(4);
    expect(dashboard.kpis.customers).toBeGreaterThanOrEqual(1);
    expect(dashboard.kpis.openOpportunities).toBeGreaterThanOrEqual(1);
    expect(dashboard.kpis.pendingTasks).toBeGreaterThanOrEqual(1);
    expect(Number(dashboard.kpis.quoteTotal)).toBeGreaterThan(0);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'dashboard.viewed',
        entityId: SEED_IDS.dashboardDefault,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();

    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'DashboardViewed'),
    ).toBe(true);
  });

  it('GET /api/v1/notifications requires notification.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: DASHBOARD_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/notifications returns paginated notifications for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(total).toBeGreaterThanOrEqual(3);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.notificationDefault1)).toBe(
      true,
    );
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.notificationTenantB)).toBe(
      false,
    );
    expect(items[0]).toHaveProperty('isRead');
    expect(items[0]).toHaveProperty('readAt');
  });

  it('PATCH /api/v1/notifications/:id/read marks notification read with audit', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/notifications/${SEED_IDS.notificationDefault1}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.notificationDefault1);
    expect(response.body.data.isRead).toBe(true);
    expect(response.body.data.readAt).toBeTruthy();

    const prisma = getPrismaClient();
    const recipient = await prisma.notificationRecipient.findUnique({
      where: { id: SEED_IDS.notificationRecipientDefault1 },
    });
    expect(recipient?.isRead).toBe(true);
    expect(recipient?.readAt).toBeTruthy();

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'notification.read',
        entityId: SEED_IDS.notificationDefault1,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();
  });

  it('GET /api/v1/notifications isolates tenant-b data', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_NOTIFICATION_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.notificationDefault1)).toBe(
      false,
    );
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.notificationTenantB)).toBe(
      true,
    );
  });

  it('dedicated dashboard-read-only user can view dashboard but not notifications', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: DASHBOARD_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('dedicated notification-read-only user can list notifications but not dashboard', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: NOTIFICATION_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});

describe('Dashboard & Notifications (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
