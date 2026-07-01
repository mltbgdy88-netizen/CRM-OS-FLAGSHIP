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

const PRODUCT_READ_ONLY_USER = {
  id: '6b000000-0000-4000-8000-000000000001',
  memberId: '6b000000-0000-4000-8000-000000000002',
  roleId: '6b000000-0000-4000-8000-000000000003',
  email: 'product-read-only@default.local',
};

const PRODUCT_CREATE_ONLY_USER = {
  id: '6b000000-0000-4000-8000-000000000011',
  memberId: '6b000000-0000-4000-8000-000000000012',
  roleId: '6b000000-0000-4000-8000-000000000013',
  email: 'product-create-only@default.local',
};

const TENANT_B_PRODUCT_USER = {
  id: '6b000000-0000-4000-8000-000000000021',
  memberId: '6b000000-0000-4000-8000-000000000022',
  roleId: '6b000000-0000-4000-8000-000000000023',
  email: 'product-read@tenant-b.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeProducts = hasDatabase ? describe : describe.skip;

async function seedDedicatedProductUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: PRODUCT_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'product_read_only',
      roleName: 'Product Read Only',
      permissionIds: [SEED_IDS.permissionProductRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: PRODUCT_CREATE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'product_create_only',
      roleName: 'Product Create Only',
      permissionIds: [SEED_IDS.permissionProductCreate],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_PRODUCT_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'product_read_tenant_b',
      roleName: 'Product Read Tenant B',
      permissionIds: [SEED_IDS.permissionProductRead],
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

describeProducts('Products (e2e)', () => {
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
    await seedDedicatedProductUsers(passwordHash);

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

  it('GET /api/v1/products requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/products').expect(401);
  });

  it('GET /api/v1/products requires product.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: PRODUCT_CREATE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/products returns paginated products for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.productDefault)).toBe(true);
    expect(items[0]).toHaveProperty('brand');
    expect(items[0]).toHaveProperty('category');
  });

  it('GET /api/v1/products/:id returns product detail with variants and prices', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/products/${SEED_IDS.productDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.productDefault);
    expect(response.body.data.sku).toBe('CRM-ENT-001');
    expect(response.body.data.brand).toBeTruthy();
    expect(response.body.data.category).toBeTruthy();
    expect(Array.isArray(response.body.data.variants)).toBe(true);
    expect(response.body.data.variants.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.prices)).toBe(true);
    expect(response.body.data.prices.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.variants[0].prices.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/products requires product.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: PRODUCT_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ sku: 'TEST-001', name: 'Test Product' })
      .expect(403);
  });

  it('POST /api/v1/products creates product with variants, prices, audit, and event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: 'CAT-NEW-001',
        name: 'Catalog Implementation Package',
        description: 'Professional services bundle',
        brandId: SEED_IDS.productBrandDefault,
        categoryId: SEED_IDS.productCategoryDefault,
        prices: [{ amount: 25000, currencyCode: 'TRY', isDefault: true }],
        variants: [
          {
            sku: 'CAT-NEW-001-STD',
            name: 'Standard Package',
            prices: [{ amount: 27500, currencyCode: 'TRY' }],
          },
        ],
      })
      .expect(201);

    expect(response.body.data.sku).toBe('CAT-NEW-001');
    expect(response.body.data.brand?.id).toBe(SEED_IDS.productBrandDefault);
    expect(response.body.data.category?.id).toBe(SEED_IDS.productCategoryDefault);
    expect(response.body.data.prices).toHaveLength(1);
    expect(response.body.data.variants).toHaveLength(1);
    expect(response.body.data.variants[0].prices).toHaveLength(1);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'product.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'ProductCreated')).toBe(true);
  });

  it('PATCH /api/v1/products/:id updates product with audit and event', async () => {
    eventPublisher.clear();

    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: 'CAT-UPD-001',
        name: 'Updatable Product',
      })
      .expect(201);

    const productId = createResponse.body.data.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Product Name', status: 'passive' })
      .expect(200);

    expect(response.body.data.name).toBe('Updated Product Name');
    expect(response.body.data.status).toBe('passive');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'product.updated',
        entityId: productId,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'ProductUpdated')).toBe(true);
  });

  it('GET /api/v1/products enforces tenant isolation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_PRODUCT_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.productDefault)).toBe(false);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.productTenantB)).toBe(true);
  });

  it('GET /api/v1/products/:id returns 404 for cross-tenant product', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_PRODUCT_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/products/${SEED_IDS.productDefault}`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(404);
  });

  it('dedicated product-read-only user can list and get but not create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: PRODUCT_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/products/${SEED_IDS.productDefault}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'READ-ONLY-TEST', name: 'Read Only Test' })
      .expect(403);
  });
});

describe('Products (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
