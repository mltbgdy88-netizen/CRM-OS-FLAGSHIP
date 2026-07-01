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

const LIMITED_USER = {
  id: '56000000-0000-4000-8000-000000000001',
  memberId: '56000000-0000-4000-8000-000000000002',
  roleId: '56000000-0000-4000-8000-000000000003',
  email: 'lead-update-only@default.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeLeads = hasDatabase ? describe : describe.skip;

describeLeads('Lead Core (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let eventPublisher: DomainEventPublisher;

  beforeAll(async () => {
    process.env.DATABASE_APP_URL =
      process.env.DATABASE_APP_URL ?? getAppDatabaseUrlFromEnv();
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-local-only';

    await applyMigrationFromEnv();
    await seedIamFromEnv();

    const prisma = getPrismaClient();
    const passwordHash = createHash('sha256').update(SEED_ADMIN_PASSWORD).digest('hex');

    await prisma.user.upsert({
      where: { id: LIMITED_USER.id },
      update: {
        email: LIMITED_USER.email,
        passwordHash,
        firstName: 'Lead',
        lastName: 'Updater',
        status: 'active',
      },
      create: {
        id: LIMITED_USER.id,
        email: LIMITED_USER.email,
        passwordHash,
        firstName: 'Lead',
        lastName: 'Updater',
        status: 'active',
      },
    });

    const membership = await prisma.tenantMember.upsert({
      where: {
        tenantId_userId: {
          tenantId: SEED_IDS.tenantDefault,
          userId: LIMITED_USER.id,
        },
      },
      update: { status: 'active' },
      create: {
        id: LIMITED_USER.memberId,
        tenantId: SEED_IDS.tenantDefault,
        userId: LIMITED_USER.id,
        status: 'active',
        joinedAt: new Date(),
      },
    });

    const role = await prisma.role.upsert({
      where: {
        tenantId_code: {
          tenantId: SEED_IDS.tenantDefault,
          code: 'lead_update_only',
        },
      },
      update: { name: 'Lead Update Only', deletedAt: null, deletedBy: null },
      create: {
        id: LIMITED_USER.roleId,
        tenantId: SEED_IDS.tenantDefault,
        code: 'lead_update_only',
        name: 'Lead Update Only',
        isSystem: false,
        createdBy: SEED_IDS.userAdmin,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: SEED_IDS.permissionLeadUpdate,
        },
      },
      update: { tenantId: SEED_IDS.tenantDefault },
      create: {
        tenantId: SEED_IDS.tenantDefault,
        roleId: role.id,
        permissionId: SEED_IDS.permissionLeadUpdate,
      },
    });

    await prisma.memberRole.upsert({
      where: {
        tenantMemberId_roleId: {
          tenantMemberId: membership.id,
          roleId: role.id,
        },
      },
      update: { tenantId: SEED_IDS.tenantDefault },
      create: {
        tenantId: SEED_IDS.tenantDefault,
        tenantMemberId: membership.id,
        roleId: role.id,
      },
    });

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

  beforeEach(async () => {
    const prisma = getPrismaClient();
    await prisma.lead.update({
      where: { id: SEED_IDS.leadDefault },
      data: {
        fullName: 'Default Lead',
        companyName: 'Default Lead Co',
        email: 'lead@default.local',
        phone: '+905551230000',
        status: 'new',
        score: 72,
        assignedUserId: SEED_IDS.userAdmin,
        customerId: SEED_IDS.customerDefault,
        deletedAt: null,
      },
    });
    eventPublisher.clear();
  });

  afterAll(async () => {
    await app?.close();
    await disconnectPrismaClient();
  });

  it('GET /api/v1/leads requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/leads').expect(401);
  });

  it('GET /api/v1/leads requires lead.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/leads returns paginated tenant leads', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.leadDefault)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.leadTenantB)).toBe(false);
  });

  it('POST /api/v1/leads requires lead.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        fullName: 'Forbidden Lead',
        companyName: 'Forbidden Co',
        sourceId: SEED_IDS.leadSourceDefault,
      })
      .expect(403);
  });

  it('POST /api/v1/leads creates lead with audit and LeadCreated event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fullName: `Created Lead ${Date.now()}`,
        companyName: 'Created Lead Co',
        email: 'created-lead@default.local',
        phone: '+905553330000',
        sourceId: SEED_IDS.leadSourceDefault,
        score: 67,
      })
      .expect(201);

    expect(response.body.data.companyName).toBe('Created Lead Co');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'lead.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'LeadCreated'),
    ).toBe(true);
  });

  it('PATCH /api/v1/leads/{id} assignment changes require lead.assign', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/leads/${SEED_IDS.leadDefault}`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ assignedUserId: null })
      .expect(403);
  });

  it('PATCH /api/v1/leads/{id} updates lead with audit, LeadAssigned, and LeadQualified events', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/leads/${SEED_IDS.leadDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fullName: `Qualified Lead ${Date.now()}`,
        assignedUserId: null,
        status: 'qualified',
        score: 91,
      })
      .expect(200);

    expect(response.body.data.status).toBe('qualified');
    expect(response.body.data.assignedUserId).toBeNull();

    const prisma = getPrismaClient();
    const updatedAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'lead.updated',
        entityId: SEED_IDS.leadDefault,
      },
      orderBy: { createdAt: 'desc' },
    });
    const assignedAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'lead.assigned',
        entityId: SEED_IDS.leadDefault,
      },
      orderBy: { createdAt: 'desc' },
    });
    const qualifiedAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'lead.qualified',
        entityId: SEED_IDS.leadDefault,
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(updatedAudit).toBeTruthy();
    expect(assignedAudit).toBeTruthy();
    expect(qualifiedAudit).toBeTruthy();
    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'LeadAssigned'),
    ).toBe(true);
    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'LeadQualified'),
    ).toBe(true);
  });

  it('PATCH /api/v1/leads/{id} emits LeadLost on lost status change', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/leads/${SEED_IDS.leadDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'lost' })
      .expect(200);

    expect(response.body.data.status).toBe('lost');

    const prisma = getPrismaClient();
    const lostAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'lead.lost',
        entityId: SEED_IDS.leadDefault,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(lostAudit).toBeTruthy();
    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'LeadLost'),
    ).toBe(true);
  });
});

describe('Lead Core (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
