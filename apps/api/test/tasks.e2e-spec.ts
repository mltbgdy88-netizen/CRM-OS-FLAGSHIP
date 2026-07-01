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

const TASK_READ_ONLY_USER = {
  id: '61000000-0000-4000-8000-000000000001',
  memberId: '61000000-0000-4000-8000-000000000002',
  roleId: '61000000-0000-4000-8000-000000000003',
  email: 'task-read-only@default.local',
};

const TASK_CREATE_ONLY_USER = {
  id: '61000000-0000-4000-8000-000000000011',
  memberId: '61000000-0000-4000-8000-000000000012',
  roleId: '61000000-0000-4000-8000-000000000013',
  email: 'task-create-only@default.local',
};

const ACTIVITY_CREATE_ONLY_USER = {
  id: '61000000-0000-4000-8000-000000000021',
  memberId: '61000000-0000-4000-8000-000000000022',
  roleId: '61000000-0000-4000-8000-000000000023',
  email: 'activity-create-only@default.local',
};

const TENANT_B_TASK_USER = {
  id: '61000000-0000-4000-8000-000000000031',
  memberId: '61000000-0000-4000-8000-000000000032',
  roleId: '61000000-0000-4000-8000-000000000033',
  email: 'task-read@tenant-b.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeTasks = hasDatabase ? describe : describe.skip;

async function seedDedicatedTaskUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: TASK_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'task_read_only',
      roleName: 'Task Read Only',
      permissionIds: [SEED_IDS.permissionTaskRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TASK_CREATE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'task_create_only',
      roleName: 'Task Create Only',
      permissionIds: [SEED_IDS.permissionTaskCreate],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: ACTIVITY_CREATE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'activity_create_only',
      roleName: 'Activity Create Only',
      permissionIds: [SEED_IDS.permissionActivityCreate],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_TASK_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'task_read_tenant_b',
      roleName: 'Task Read Tenant B',
      permissionIds: [SEED_IDS.permissionTaskRead],
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
}

describeTasks('Tasks & Activities (e2e)', () => {
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
    await seedDedicatedTaskUsers(passwordHash);

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

  it('GET /api/v1/tasks requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/tasks').expect(401);
  });

  it('GET /api/v1/tasks requires task.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TASK_CREATE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/tasks returns paginated tenant tasks for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.taskDefault)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.taskTenantB)).toBe(false);
    expect(items[0]).toHaveProperty('assignees');
  });

  it('POST /api/v1/tasks requires task.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TASK_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ title: 'Forbidden task' })
      .expect(403);
  });

  it('POST /api/v1/tasks creates task with audit and TaskCreated event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Created Task ${Date.now()}`,
        description: 'Follow up on renewal',
        priority: 'high',
        relatedType: 'customer',
        relatedId: SEED_IDS.customerDefault,
        assignees: [{ userId: SEED_IDS.userAdmin, isPrimary: true }],
      })
      .expect(201);

    expect(response.body.data.title).toContain('Created Task');
    expect(response.body.data.assignees).toHaveLength(1);
    expect(response.body.data.assignees[0].userId).toBe(SEED_IDS.userAdmin);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'task.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'TaskCreated'),
    ).toBe(true);
  });

  it('POST /api/v1/tasks with status=done emits TaskCompleted', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Completed Task ${Date.now()}`,
        status: 'done',
      })
      .expect(201);

    expect(response.body.data.status).toBe('done');

    const prisma = getPrismaClient();
    const completedAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'task.completed',
        entityId: response.body.data.id,
      },
    });
    expect(completedAudit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'TaskCreated')).toBe(true);
    expect(events.some((event) => event.eventType === 'TaskCompleted')).toBe(true);
  });

  it('POST /api/v1/activities requires activity.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TASK_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/activities')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        activityType: 'call',
        title: 'Forbidden activity',
      })
      .expect(403);
  });

  it('POST /api/v1/activities creates activity with audit and ActivityLogged event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/activities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        activityType: 'call',
        title: `Logged call ${Date.now()}`,
        body: 'Discussed renewal timeline.',
        relatedType: 'customer',
        relatedId: SEED_IDS.customerDefault,
        taskId: SEED_IDS.taskDefault,
      })
      .expect(201);

    expect(response.body.data.activityType).toBe('call');
    expect(response.body.data.taskId).toBe(SEED_IDS.taskDefault);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'activity.logged',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'ActivityLogged'),
    ).toBe(true);
  });

  it('GET /api/v1/tasks isolates tenant-b data', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_TASK_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.taskDefault)).toBe(false);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.taskTenantB)).toBe(true);
  });

  it('dedicated task-read-only user can list but not create tasks or activities', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TASK_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Blocked task' })
      .expect(403);

    await request(app.getHttpServer())
      .post('/api/v1/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityType: 'note', title: 'Blocked activity' })
      .expect(403);
  });

  it('dedicated activity-create-only user can log activities but not create tasks', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: ACTIVITY_CREATE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Blocked task' })
      .expect(403);

    await request(app.getHttpServer())
      .post('/api/v1/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        activityType: 'note',
        title: `Activity only ${Date.now()}`,
      })
      .expect(201);
  });
});

describe('Tasks & Activities (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
