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

const INVENTORY_READ_ONLY_USER = {
  id: '6c000000-0000-4000-8000-000000000001',
  memberId: '6c000000-0000-4000-8000-000000000002',
  roleId: '6c000000-0000-4000-8000-000000000003',
  email: 'inventory-read-only@default.local',
};

const INVENTORY_ADJUST_ONLY_USER = {
  id: '6c000000-0000-4000-8000-000000000011',
  memberId: '6c000000-0000-4000-8000-000000000012',
  roleId: '6c000000-0000-4000-8000-000000000013',
  email: 'inventory-adjust-only@default.local',
};

const TENANT_B_INVENTORY_USER = {
  id: '6c000000-0000-4000-8000-000000000021',
  memberId: '6c000000-0000-4000-8000-000000000022',
  roleId: '6c000000-0000-4000-8000-000000000023',
  email: 'inventory-read@tenant-b.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeInventory = hasDatabase ? describe : describe.skip;

async function seedDedicatedInventoryUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: INVENTORY_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'inventory_read_only',
      roleName: 'Inventory Read Only',
      permissionIds: [SEED_IDS.permissionInventoryRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: INVENTORY_ADJUST_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'inventory_adjust_only',
      roleName: 'Inventory Adjust Only',
      permissionIds: [SEED_IDS.permissionInventoryAdjust],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_INVENTORY_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'inventory_read_tenant_b',
      roleName: 'Inventory Read Tenant B',
      permissionIds: [SEED_IDS.permissionInventoryRead],
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

describeInventory('Inventory (e2e)', () => {
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
    await seedDedicatedInventoryUsers(passwordHash);

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

  it('GET /api/v1/inventory requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/inventory').expect(401);
  });

  it('GET /api/v1/inventory requires inventory.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: INVENTORY_ADJUST_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/inventory')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/inventory returns overview for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.totalSkus).toBeGreaterThanOrEqual(1);
    expect(response.body.data.warehouses.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.recentMovements)).toBe(true);
    expect(
      response.body.data.warehouses.some(
        (warehouse: { id: string }) => warehouse.id === SEED_IDS.warehouseDefault,
      ),
    ).toBe(true);
  });

  it('GET /api/v1/stocks returns paginated stocks', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/stocks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.stockDefault)).toBe(true);
    expect(items[0]).toHaveProperty('warehouse');
    expect(items[0]).toHaveProperty('productVariant');
  });

  it('POST /api/v1/stock-movements requires inventory.adjust', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: INVENTORY_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/stock-movements')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        warehouseId: SEED_IDS.warehouseDefault,
        productVariantId: SEED_IDS.productVariantDefault,
        movementType: 'in',
        quantity: 1,
      })
      .expect(403);
  });

  it('POST /api/v1/stock-movements records inbound movement with audit and StockChanged event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/stock-movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        warehouseId: SEED_IDS.warehouseDefault,
        productVariantId: SEED_IDS.productVariantDefault,
        movementType: 'in',
        quantity: 5,
        notes: 'E2E inbound receipt',
      })
      .expect(201);

    expect(response.body.data.movementType).toBe('in');
    expect(response.body.data.quantity).toBe(5);
    expect(response.body.data.stockId).toBe(SEED_IDS.stockDefault);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'stock.movement.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'StockChanged')).toBe(true);
  });

  it('POST /api/v1/stock-movements emits CriticalStockReached when available drops below critical level', async () => {
    eventPublisher.clear();

    await request(app.getHttpServer())
      .post('/api/v1/stock-movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        warehouseId: SEED_IDS.warehouseDefault,
        productVariantId: SEED_IDS.productVariantDefault,
        movementType: 'out',
        quantity: 200,
      })
      .expect(400);

    eventPublisher.clear();

    await request(app.getHttpServer())
      .post('/api/v1/stock-movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        warehouseId: SEED_IDS.warehouseDefault,
        productVariantId: SEED_IDS.productVariantDefault,
        movementType: 'adjust',
        quantity: 20,
      })
      .expect(201);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'StockChanged')).toBe(true);
    expect(events.some((event) => event.eventType === 'CriticalStockReached')).toBe(true);
  });

  it('Tenant B user cannot see Tenant A stock via GET /api/v1/stocks/:id isolation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_INVENTORY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/stocks')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    expect(
      response.body.data.items.some(
        (item: { id: string }) => item.id === SEED_IDS.stockDefault,
      ),
    ).toBe(false);
    expect(
      response.body.data.items.some(
        (item: { id: string }) => item.id === SEED_IDS.stockTenantB,
      ),
    ).toBe(true);
  });
});

describe('Inventory (e2e offline)', () => {
  it('documents that inventory e2e runs when DATABASE_URL is set', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
