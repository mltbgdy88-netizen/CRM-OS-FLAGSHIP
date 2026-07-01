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
  id: '57000000-0000-4000-8000-000000000001',
  memberId: '57000000-0000-4000-8000-000000000002',
  roleId: '57000000-0000-4000-8000-000000000003',
  email: 'sales-read-only@default.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeSales = hasDatabase ? describe : describe.skip;

async function resetDefaultTenantSalesData(): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.opportunityStageHistory.deleteMany({
    where: { tenantId: SEED_IDS.tenantDefault },
  });
  await prisma.leadConversionLog.deleteMany({
    where: { tenantId: SEED_IDS.tenantDefault },
  });
  await prisma.opportunity.deleteMany({
    where: { tenantId: SEED_IDS.tenantDefault },
  });
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
}

describeSales('Sales (e2e)', () => {
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
        firstName: 'Sales',
        lastName: 'ReadOnly',
        status: 'active',
      },
      create: {
        id: LIMITED_USER.id,
        email: LIMITED_USER.email,
        passwordHash,
        firstName: 'Sales',
        lastName: 'ReadOnly',
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
          code: 'sales_read_only',
        },
      },
      update: { name: 'Sales Read Only', deletedAt: null, deletedBy: null },
      create: {
        id: LIMITED_USER.roleId,
        tenantId: SEED_IDS.tenantDefault,
        code: 'sales_read_only',
        name: 'Sales Read Only',
        isSystem: false,
        createdBy: SEED_IDS.userAdmin,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: SEED_IDS.permissionLeadRead,
        },
      },
      update: { tenantId: SEED_IDS.tenantDefault },
      create: {
        tenantId: SEED_IDS.tenantDefault,
        roleId: role.id,
        permissionId: SEED_IDS.permissionLeadRead,
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
    await resetDefaultTenantSalesData();
    eventPublisher.clear();
  });

  afterAll(async () => {
    await app?.close();
    await disconnectPrismaClient();
  });

  it('GET /api/v1/pipelines requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/pipelines').expect(401);
  });

  it('GET /api/v1/pipelines requires pipeline.manage', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/pipelines')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/pipelines returns paginated pipelines with nested stages', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/pipelines')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);

    const defaultPipeline = items.find(
      (item: { id: string }) => item.id === SEED_IDS.pipelineDefault,
    );
    expect(defaultPipeline).toBeTruthy();
    expect(Array.isArray(defaultPipeline.stages)).toBe(true);
    expect(defaultPipeline.stages.length).toBeGreaterThanOrEqual(1);
    expect(
      defaultPipeline.stages.some(
        (stage: { code: string }) => stage.code === 'new',
      ),
    ).toBe(true);
  });

  it('GET /api/v1/pipelines enforces tenant isolation', async () => {
    const prisma = getPrismaClient();
    await prisma.memberRole.upsert({
      where: {
        tenantMemberId_roleId: {
          tenantMemberId: SEED_IDS.memberB,
          roleId: SEED_IDS.roleTenantB,
        },
      },
      update: { tenantId: SEED_IDS.tenantB },
      create: {
        tenantId: SEED_IDS.tenantB,
        tenantMemberId: SEED_IDS.memberB,
        roleId: SEED_IDS.roleTenantB,
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/pipelines')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.pipelineDefault)).toBe(
      false,
    );
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.pipelineTenantB)).toBe(
      true,
    );
  });

  it('POST /api/v1/opportunities requires opportunity.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Forbidden Opportunity',
        companyName: 'Forbidden Co',
      })
      .expect(403);
  });

  it('POST /api/v1/opportunities creates with audit and events', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: `Created Opportunity ${Date.now()}`,
        companyName: 'Created Opportunity Co',
        customerId: SEED_IDS.customerDefault,
        amount: 12500,
        probability: 35,
      })
      .expect(201);

    expect(response.body.data.title).toContain('Created Opportunity');
    expect(response.body.data.stage.code).toBe('new');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'opportunity.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const stageHistory = await prisma.opportunityStageHistory.findFirst({
      where: { opportunityId: response.body.data.id },
    });
    expect(stageHistory).toBeTruthy();
    expect(stageHistory?.fromStageId).toBeNull();
    expect(stageHistory?.toStageId).toBe(SEED_IDS.pipelineStageDefaultNew);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OpportunityCreated')).toBe(true);
    expect(events.some((event) => event.eventType === 'OpportunityStageChanged')).toBe(true);
  });

  it('POST /api/v1/leads/:id/convert requires lead.convert', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/leads/${SEED_IDS.leadDefault}/convert`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({})
      .expect(403);
  });

  it('POST /api/v1/leads/:id/convert returns 400 when customerId is missing', async () => {
    const prisma = getPrismaClient();
    await prisma.lead.update({
      where: { id: SEED_IDS.leadDefault },
      data: { customerId: null },
    });

    await request(app.getHttpServer())
      .post(`/api/v1/leads/${SEED_IDS.leadDefault}/convert`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('POST /api/v1/leads/:id/convert creates opportunity, logs, audit, and events', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/leads/${SEED_IDS.leadDefault}/convert`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Converted Opportunity ${Date.now()}`,
      })
      .expect(201);

    expect(response.body.data.leadId).toBe(SEED_IDS.leadDefault);
    expect(response.body.data.customerId).toBe(SEED_IDS.customerDefault);
    expect(response.body.data.stage.code).toBe('new');

    const prisma = getPrismaClient();
    const lead = await prisma.lead.findUnique({ where: { id: SEED_IDS.leadDefault } });
    expect(lead?.status).toBe('qualified');

    const conversionLog = await prisma.leadConversionLog.findFirst({
      where: {
        leadId: SEED_IDS.leadDefault,
        opportunityId: response.body.data.id,
      },
    });
    expect(conversionLog).toBeTruthy();

    const convertedAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'lead.converted',
        entityId: SEED_IDS.leadDefault,
      },
      orderBy: { createdAt: 'desc' },
    });
    const opportunityAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'opportunity.created',
        entityId: response.body.data.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(convertedAudit).toBeTruthy();
    expect(opportunityAudit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'LeadConverted')).toBe(true);
    expect(events.some((event) => event.eventType === 'OpportunityCreated')).toBe(true);
    expect(events.some((event) => event.eventType === 'OpportunityStageChanged')).toBe(true);
  });
});

describe('Sales (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
