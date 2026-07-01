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

const QUOTE_READ_ONLY_USER = {
  id: '59000000-0000-4000-8000-000000000001',
  memberId: '59000000-0000-4000-8000-000000000002',
  roleId: '59000000-0000-4000-8000-000000000003',
  email: 'quote-read-only@default.local',
};

const QUOTE_CREATE_ONLY_USER = {
  id: '59000000-0000-4000-8000-000000000011',
  memberId: '59000000-0000-4000-8000-000000000012',
  roleId: '59000000-0000-4000-8000-000000000013',
  email: 'quote-create-only@default.local',
};

const TENANT_B_QUOTE_USER = {
  id: '59000000-0000-4000-8000-000000000021',
  memberId: '59000000-0000-4000-8000-000000000022',
  roleId: '59000000-0000-4000-8000-000000000023',
  email: 'quote-read@tenant-b.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeQuotes = hasDatabase ? describe : describe.skip;

async function seedDedicatedQuoteUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: QUOTE_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'quote_read_only',
      roleName: 'Quote Read Only',
      permissionIds: [SEED_IDS.permissionQuoteRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: QUOTE_CREATE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'quote_create_only',
      roleName: 'Quote Create Only',
      permissionIds: [SEED_IDS.permissionQuoteCreate],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_QUOTE_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'quote_read_tenant_b',
      roleName: 'Quote Read Tenant B',
      permissionIds: [SEED_IDS.permissionQuoteRead],
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

describeQuotes('Quotes (e2e)', () => {
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
    await seedDedicatedQuoteUsers(passwordHash);

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

  it('GET /api/v1/quotes requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/quotes').expect(401);
  });

  it('GET /api/v1/quotes requires quote.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: QUOTE_CREATE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/quotes returns paginated quotes for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.quoteDefault)).toBe(true);
    expect(items[0]).toHaveProperty('customer');
    expect(items[0]).toHaveProperty('total');
  });

  it('GET /api/v1/quotes/:id returns quote detail with line data', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/quotes/${SEED_IDS.quoteDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.quoteDefault);
    expect(response.body.data.number).toBe('Q-2026-0001');
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.discounts)).toBe(true);
    expect(response.body.data.discounts.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.taxes)).toBe(true);
    expect(response.body.data.taxes.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/quotes requires quote.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: QUOTE_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ customerId: SEED_IDS.customerDefault })
      .expect(403);
  });

  it('POST /api/v1/quotes creates quote with calculated totals, audit, and event', async () => {
    eventPublisher.clear();

    const opportunityResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pipelineId: SEED_IDS.pipelineDefault,
        customerId: SEED_IDS.customerDefault,
        title: `Quote Opportunity ${Date.now()}`,
        companyName: 'Quote Opportunity Co',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        opportunityId: opportunityResponse.body.data.id,
        items: [
          {
            name: 'Implementation Package',
            quantity: 2,
            unitPrice: 5000,
          },
        ],
        discounts: [
          {
            name: 'Launch discount',
            discountType: 'percent',
            value: 10,
          },
        ],
        taxes: [
          {
            name: 'KDV',
            ratePercent: 20,
          },
        ],
      })
      .expect(201);

    expect(response.body.data.customerId).toBe(SEED_IDS.customerDefault);
    expect(response.body.data.subtotal).toBe(10000);
    expect(response.body.data.discountTotal).toBe(1000);
    expect(response.body.data.taxTotal).toBe(1800);
    expect(response.body.data.total).toBe(10800);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.number).toMatch(/^Q-\d{4}-\d{4}$/);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'quote.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'QuoteCreated')).toBe(true);
  });

  it('PATCH /api/v1/quotes/:id requires quote.update', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: QUOTE_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/quotes/${SEED_IDS.quoteDefault}`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ status: 'sent' })
      .expect(403);
  });

  it('PATCH /api/v1/quotes/:id updates quote with audit and recalculated totals', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        items: [{ name: 'Starter line', quantity: 1, unitPrice: 1000 }],
      })
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/quotes/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'sent',
        items: [{ name: 'Updated line', quantity: 3, unitPrice: 2000 }],
        discounts: [{ name: 'Fixed discount', discountType: 'fixed', value: 500 }],
        taxes: [{ name: 'KDV', ratePercent: 20 }],
      })
      .expect(200);

    expect(response.body.data.status).toBe('sent');
    expect(response.body.data.subtotal).toBe(6000);
    expect(response.body.data.discountTotal).toBe(500);
    expect(response.body.data.taxTotal).toBe(1100);
    expect(response.body.data.total).toBe(6600);
    expect(response.body.data.items[0].name).toBe('Updated line');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'quote.updated',
        entityId: createResponse.body.data.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();
  });

  it('GET /api/v1/quotes enforces tenant isolation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_QUOTE_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.quoteDefault)).toBe(false);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.quoteTenantB)).toBe(true);
  });

  it('GET /api/v1/quotes/:id returns 404 for cross-tenant quote', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_QUOTE_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/quotes/${SEED_IDS.quoteDefault}`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(404);
  });

  it('dedicated quote-read-only user can list and get but not create or update', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: QUOTE_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/quotes/${SEED_IDS.quoteDefault}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId: SEED_IDS.customerDefault })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/quotes/${SEED_IDS.quoteDefault}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sent' })
      .expect(403);
  });
});

describe('Quotes (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
