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

const TENANT_B_PIPELINE_USER = {
  id: '57000000-0000-4000-8000-000000000011',
  memberId: '57000000-0000-4000-8000-000000000012',
  roleId: '57000000-0000-4000-8000-000000000013',
  email: 'pipeline-only@tenant-b.local',
};

const PIPELINE_READ_USER = {
  id: '58000000-0000-4000-8000-000000000001',
  memberId: '58000000-0000-4000-8000-000000000002',
  roleId: '58000000-0000-4000-8000-000000000003',
  email: 'pipeline-read-only@default.local',
};

const STAGE_UPDATE_USER = {
  id: '58000000-0000-4000-8000-000000000011',
  memberId: '58000000-0000-4000-8000-000000000012',
  roleId: '58000000-0000-4000-8000-000000000013',
  email: 'stage-update-only@default.local',
};

const TENANT_B_BOARD_USER = {
  id: '58000000-0000-4000-8000-000000000021',
  memberId: '58000000-0000-4000-8000-000000000022',
  roleId: '58000000-0000-4000-8000-000000000023',
  email: 'pipeline-board@tenant-b.local',
};

const PERMISSION_PIPELINE_READ = '30000000-0000-4000-8000-000000000016';
const PERMISSION_OPPORTUNITY_UPDATE_STAGE = '30000000-0000-4000-8000-000000000017';
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

async function seedDefaultTenantOpportunityDetail(): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.opportunity.create({
    data: {
      id: SEED_IDS.opportunityDefault,
      tenantId: SEED_IDS.tenantDefault,
      pipelineId: SEED_IDS.pipelineDefault,
      stageId: SEED_IDS.pipelineStageDefaultNew,
      leadId: SEED_IDS.leadDefault,
      customerId: SEED_IDS.customerDefault,
      title: 'Default Lead Opportunity',
      companyName: 'Default Lead Co',
      amount: 95000,
      probability: 45,
      status: 'open',
      assignedUserId: SEED_IDS.userAdmin,
      createdBy: SEED_IDS.userAdmin,
      products: {
        create: {
          tenantId: SEED_IDS.tenantDefault,
          name: 'CRM OS Enterprise License',
          sku: 'CRM-ENT-01',
          quantity: 1,
          unitPrice: 95000,
          createdBy: SEED_IDS.userAdmin,
        },
      },
      contacts: {
        create: {
          tenantId: SEED_IDS.tenantDefault,
          firstName: 'Ayse',
          lastName: 'Yilmaz',
          email: 'ayse.yilmaz@defaultlead.co',
          phone: '+905551112233',
          title: 'Procurement Lead',
          isPrimary: true,
          createdBy: SEED_IDS.userAdmin,
        },
      },
      activities: {
        create: {
          tenantId: SEED_IDS.tenantDefault,
          activityType: 'call',
          title: 'Discovery call',
          body: 'Initial qualification call with procurement.',
          dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdBy: SEED_IDS.userAdmin,
        },
      },
      notes: {
        create: {
          tenantId: SEED_IDS.tenantDefault,
          title: 'Budget confirmed',
          body: 'Buyer confirmed Q3 budget allocation for CRM rollout.',
          createdBy: SEED_IDS.userAdmin,
        },
      },
    },
  });

  await prisma.opportunityStageHistory.create({
    data: {
      tenantId: SEED_IDS.tenantDefault,
      opportunityId: SEED_IDS.opportunityDefault,
      fromStageId: null,
      toStageId: SEED_IDS.pipelineStageDefaultNew,
      createdBy: SEED_IDS.userAdmin,
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

    await prisma.user.upsert({
      where: { id: TENANT_B_PIPELINE_USER.id },
      update: {
        email: TENANT_B_PIPELINE_USER.email,
        passwordHash,
        firstName: 'Pipeline',
        lastName: 'Only',
        status: 'active',
      },
      create: {
        id: TENANT_B_PIPELINE_USER.id,
        email: TENANT_B_PIPELINE_USER.email,
        passwordHash,
        firstName: 'Pipeline',
        lastName: 'Only',
        status: 'active',
      },
    });

    const tenantBPipelineMembership = await prisma.tenantMember.upsert({
      where: {
        tenantId_userId: {
          tenantId: SEED_IDS.tenantB,
          userId: TENANT_B_PIPELINE_USER.id,
        },
      },
      update: { status: 'active' },
      create: {
        id: TENANT_B_PIPELINE_USER.memberId,
        tenantId: SEED_IDS.tenantB,
        userId: TENANT_B_PIPELINE_USER.id,
        status: 'active',
        joinedAt: new Date(),
      },
    });

    const tenantBPipelineRole = await prisma.role.upsert({
      where: {
        tenantId_code: {
          tenantId: SEED_IDS.tenantB,
          code: 'pipeline_manage_only',
        },
      },
      update: { name: 'Pipeline Manage Only', deletedAt: null, deletedBy: null },
      create: {
        id: TENANT_B_PIPELINE_USER.roleId,
        tenantId: SEED_IDS.tenantB,
        code: 'pipeline_manage_only',
        name: 'Pipeline Manage Only',
        isSystem: false,
        createdBy: SEED_IDS.userMemberB,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: tenantBPipelineRole.id,
          permissionId: SEED_IDS.permissionPipelineManage,
        },
      },
      update: { tenantId: SEED_IDS.tenantB },
      create: {
        tenantId: SEED_IDS.tenantB,
        roleId: tenantBPipelineRole.id,
        permissionId: SEED_IDS.permissionPipelineManage,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: tenantBPipelineRole.id,
          permissionId: '30000000-0000-4000-8000-000000000014',
        },
      },
      update: { tenantId: SEED_IDS.tenantB },
      create: {
        tenantId: SEED_IDS.tenantB,
        roleId: tenantBPipelineRole.id,
        permissionId: '30000000-0000-4000-8000-000000000014',
      },
    });

    await prisma.memberRole.upsert({
      where: {
        tenantMemberId_roleId: {
          tenantMemberId: tenantBPipelineMembership.id,
          roleId: tenantBPipelineRole.id,
        },
      },
      update: { tenantId: SEED_IDS.tenantB },
      create: {
        tenantId: SEED_IDS.tenantB,
        tenantMemberId: tenantBPipelineMembership.id,
        roleId: tenantBPipelineRole.id,
      },
    });

    const dedicatedUsers = [
      {
        user: PIPELINE_READ_USER,
        tenantId: SEED_IDS.tenantDefault,
        roleCode: 'pipeline_read_only',
        roleName: 'Pipeline Read Only',
        permissionIds: [PERMISSION_PIPELINE_READ],
        createdBy: SEED_IDS.userAdmin,
      },
      {
        user: STAGE_UPDATE_USER,
        tenantId: SEED_IDS.tenantDefault,
        roleCode: 'stage_update_only',
        roleName: 'Stage Update Only',
        permissionIds: [PERMISSION_OPPORTUNITY_UPDATE_STAGE],
        createdBy: SEED_IDS.userAdmin,
      },
      {
        user: TENANT_B_BOARD_USER,
        tenantId: SEED_IDS.tenantB,
        roleCode: 'pipeline_board_only',
        roleName: 'Pipeline Board Only',
        permissionIds: [PERMISSION_PIPELINE_READ],
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
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_PIPELINE_USER.email,
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

  it('GET /api/v1/pipelines/:id/board requires auth', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/pipelines/${SEED_IDS.pipelineDefault}/board`)
      .expect(401);
  });

  it('GET /api/v1/pipelines/:id/board requires pipeline.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/pipelines/${SEED_IDS.pipelineDefault}/board`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/pipelines/:id/board returns stages with nested opportunities', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: `Board Opportunity ${Date.now()}`,
        companyName: 'Board Opportunity Co',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: PIPELINE_READ_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/pipelines/${SEED_IDS.pipelineDefault}/board`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.pipelineDefault);
    expect(Array.isArray(response.body.data.stages)).toBe(true);
    expect(response.body.data.stages.length).toBeGreaterThanOrEqual(1);

    const newStage = response.body.data.stages.find(
      (stage: { code: string }) => stage.code === 'new',
    );
    expect(newStage).toBeTruthy();
    expect(Array.isArray(newStage.opportunities)).toBe(true);
    expect(
      newStage.opportunities.some(
        (opportunity: { id: string }) => opportunity.id === createResponse.body.data.id,
      ),
    ).toBe(true);
    expect(Array.isArray(response.body.data.opportunities)).toBe(true);
  });

  it('GET /api/v1/pipelines/:id/board returns 404 for missing pipeline', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: PIPELINE_READ_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/pipelines/${SEED_IDS.pipelineTenantB}/board`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(404);
  });

  it('GET /api/v1/pipelines/:id/board enforces tenant isolation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_BOARD_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/pipelines/${SEED_IDS.pipelineDefault}/board`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(404);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/pipelines/${SEED_IDS.pipelineTenantB}/board`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.pipelineTenantB);
    expect(Array.isArray(response.body.data.stages)).toBe(true);
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

  it('GET /api/v1/opportunities requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/opportunities').expect(401);
  });

  it('GET /api/v1/opportunities requires opportunity.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/opportunities returns paginated opportunities', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: `Listed Opportunity ${Date.now()}`,
        companyName: 'Listed Opportunity Co',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === createResponse.body.data.id)).toBe(
      true,
    );
    expect(items[0]).toHaveProperty('pipeline');
    expect(items[0]).toHaveProperty('stage');
  });

  it('GET /api/v1/opportunities/:id returns detail with child entities', async () => {
    await seedDefaultTenantOpportunityDetail();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/opportunities/${SEED_IDS.opportunityDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.opportunityDefault);
    expect(Array.isArray(response.body.data.products)).toBe(true);
    expect(response.body.data.products.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.contacts)).toBe(true);
    expect(response.body.data.contacts.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.activities)).toBe(true);
    expect(response.body.data.activities.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.notes)).toBe(true);
    expect(response.body.data.notes.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/opportunities enforces tenant isolation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_PIPELINE_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.opportunityDefault)).toBe(
      false,
    );
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.opportunityTenantB)).toBe(
      true,
    );
  });

  it('PATCH /api/v1/opportunities/:id updates opportunity with audit', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Patch Target Opportunity',
        companyName: 'Patch Target Co',
        amount: 10000,
        probability: 20,
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Opportunity Title',
        amount: 15000,
        probability: 40,
      })
      .expect(200);

    expect(response.body.data.title).toBe('Updated Opportunity Title');
    expect(response.body.data.amount).toBe(15000);
    expect(response.body.data.probability).toBe(40);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'opportunity.updated',
        entityId: createResponse.body.data.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();
  });

  it('PATCH /api/v1/opportunities/:id emits won event and audit when status is won', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Won Target Opportunity',
        companyName: 'Won Target Co',
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'won' })
      .expect(200);

    expect(response.body.data.status).toBe('won');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'opportunity.won',
        entityId: createResponse.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OpportunityWon')).toBe(true);
  });

  it('PATCH /api/v1/opportunities/:id emits lost event and audit when status is lost', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Lost Target Opportunity',
        companyName: 'Lost Target Co',
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'lost' })
      .expect(200);

    expect(response.body.data.status).toBe('lost');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'opportunity.lost',
        entityId: createResponse.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OpportunityLost')).toBe(true);
  });

  it('PATCH /api/v1/opportunities/:id emits stage change event and appends history', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Stage Change Opportunity',
        companyName: 'Stage Change Co',
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ stageId: SEED_IDS.pipelineStageDefaultQualified })
      .expect(200);

    expect(response.body.data.stageId).toBe(SEED_IDS.pipelineStageDefaultQualified);
    expect(response.body.data.stage.code).toBe('qualified');

    const prisma = getPrismaClient();
    const stageHistory = await prisma.opportunityStageHistory.findFirst({
      where: {
        opportunityId: createResponse.body.data.id,
        toStageId: SEED_IDS.pipelineStageDefaultQualified,
      },
    });
    expect(stageHistory).toBeTruthy();
    expect(stageHistory?.fromStageId).toBe(SEED_IDS.pipelineStageDefaultNew);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OpportunityStageChanged')).toBe(true);
  });

  it('PATCH /api/v1/opportunities/:id/stage requires auth', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${SEED_IDS.opportunityDefault}/stage`)
      .send({ stageId: SEED_IDS.pipelineStageDefaultQualified })
      .expect(401);
  });

  it('PATCH /api/v1/opportunities/:id/stage requires opportunity.update.stage', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Stage Permission Opportunity',
        companyName: 'Stage Permission Co',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: LIMITED_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}/stage`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ stageId: SEED_IDS.pipelineStageDefaultQualified })
      .expect(403);
  });

  it('PATCH /api/v1/opportunities/:id/stage moves card with events and history', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Dedicated Stage Move Opportunity',
        companyName: 'Dedicated Stage Move Co',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: STAGE_UPDATE_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}/stage`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ stageId: SEED_IDS.pipelineStageDefaultQualified })
      .expect(200);

    expect(response.body.data.stageId).toBe(SEED_IDS.pipelineStageDefaultQualified);
    expect(response.body.data.stage.code).toBe('qualified');

    const prisma = getPrismaClient();
    const stageHistory = await prisma.opportunityStageHistory.findFirst({
      where: {
        opportunityId: createResponse.body.data.id,
        toStageId: SEED_IDS.pipelineStageDefaultQualified,
      },
    });
    expect(stageHistory).toBeTruthy();
    expect(stageHistory?.fromStageId).toBe(SEED_IDS.pipelineStageDefaultNew);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OpportunityStageChanged')).toBe(true);
  });

  it('PATCH /api/v1/opportunities/:id/stage sets won status when moved to won stage', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        title: 'Won Stage Move Opportunity',
        companyName: 'Won Stage Move Co',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: STAGE_UPDATE_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/opportunities/${createResponse.body.data.id}/stage`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ stageId: SEED_IDS.pipelineStageDefaultWon })
      .expect(200);

    expect(response.body.data.stageId).toBe(SEED_IDS.pipelineStageDefaultWon);
    expect(response.body.data.stage.code).toBe('won');
    expect(response.body.data.status).toBe('won');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'opportunity.won',
        entityId: createResponse.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OpportunityWon')).toBe(true);
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
