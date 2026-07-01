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

const ORDER_READ_ONLY_USER = {
  id: '6a000000-0000-4000-8000-000000000001',
  memberId: '6a000000-0000-4000-8000-000000000002',
  roleId: '6a000000-0000-4000-8000-000000000003',
  email: 'order-read-only@default.local',
};

const ORDER_CREATE_ONLY_USER = {
  id: '6a000000-0000-4000-8000-000000000011',
  memberId: '6a000000-0000-4000-8000-000000000012',
  roleId: '6a000000-0000-4000-8000-000000000013',
  email: 'order-create-only@default.local',
};

const TENANT_B_ORDER_USER = {
  id: '6a000000-0000-4000-8000-000000000021',
  memberId: '6a000000-0000-4000-8000-000000000022',
  roleId: '6a000000-0000-4000-8000-000000000023',
  email: 'order-read@tenant-b.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeOrders = hasDatabase ? describe : describe.skip;

async function seedDedicatedOrderUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: ORDER_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'order_read_only',
      roleName: 'Order Read Only',
      permissionIds: [SEED_IDS.permissionOrderRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: ORDER_CREATE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'order_create_only',
      roleName: 'Order Create Only',
      permissionIds: [SEED_IDS.permissionOrderCreate],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_ORDER_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'order_read_tenant_b',
      roleName: 'Order Read Tenant B',
      permissionIds: [SEED_IDS.permissionOrderRead],
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

describeOrders('Orders (e2e)', () => {
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
    await seedDedicatedOrderUsers(passwordHash);

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

  it('GET /api/v1/orders requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/orders').expect(401);
  });

  it('GET /api/v1/orders requires order.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: ORDER_CREATE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/orders returns paginated orders for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.orderDefault)).toBe(true);
    expect(items[0]).toHaveProperty('customer');
    expect(items[0]).toHaveProperty('total');
  });

  it('GET /api/v1/orders/:id returns order detail with items and status history', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/orders/${SEED_IDS.orderDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.orderDefault);
    expect(response.body.data.number).toBe('O-2026-0001');
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.statusHistory)).toBe(true);
    expect(response.body.data.statusHistory.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.data.shipments)).toBe(true);
    expect(Array.isArray(response.body.data.deliveries)).toBe(true);
    expect(Array.isArray(response.body.data.orderNotes)).toBe(true);
    expect(response.body.data.orderNotes.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/orders requires order.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: ORDER_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ customerId: SEED_IDS.customerDefault })
      .expect(403);
  });

  it('POST /api/v1/orders creates order with calculated totals, audit, and event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        items: [
          {
            name: 'Implementation Package',
            quantity: 2,
            unitPrice: 5000,
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
    expect(response.body.data.taxTotal).toBe(2000);
    expect(response.body.data.total).toBe(12000);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.number).toMatch(/^ORD-\d{4}-\d{4}$/);
    expect(response.body.data.status).toBe('pending');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'order.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OrderCreated')).toBe(true);
    expect(events.some((event) => event.eventType === 'OrderConfirmed')).toBe(false);
  });

  it('POST /api/v1/orders with confirmed status emits OrderConfirmed', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        status: 'confirmed',
        items: [{ name: 'Confirmed line', quantity: 1, unitPrice: 3000 }],
      })
      .expect(201);

    expect(response.body.data.status).toBe('confirmed');
    expect(Array.isArray(response.body.data.statusHistory)).toBe(true);
    expect(response.body.data.statusHistory.length).toBeGreaterThanOrEqual(1);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OrderCreated')).toBe(true);
    expect(events.some((event) => event.eventType === 'OrderConfirmed')).toBe(true);
  });

  it('GET /api/v1/orders enforces tenant isolation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_ORDER_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    const { items } = response.body.data;
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.orderDefault)).toBe(false);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.orderTenantB)).toBe(true);
  });

  it('GET /api/v1/orders/:id returns 404 for cross-tenant order', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TENANT_B_ORDER_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/orders/${SEED_IDS.orderDefault}`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(404);
  });

  it('dedicated order-read-only user can list and get but not create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: ORDER_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    const token = loginResponse.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/orders/${SEED_IDS.orderDefault}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId: SEED_IDS.customerDefault })
      .expect(403);
  });

  async function createConfirmedOrder(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        status: 'confirmed',
        items: [{ name: 'Operations test line', quantity: 1, unitPrice: 1500 }],
      })
      .expect(201);

    return response.body.data.id as string;
  }

  it('POST /api/v1/orders/:id/ship requires order.ship', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: ORDER_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${SEED_IDS.orderDefault}/ship`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ carrier: 'Aras', trackingNumber: 'TRK-001' })
      .expect(403);
  });

  it('POST /api/v1/orders/:id/ship ships confirmed order with audit and event', async () => {
    eventPublisher.clear();
    const orderId = await createConfirmedOrder();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/ship`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ carrier: 'Yurtiçi', trackingNumber: 'YT-OPS-001', notes: 'Express shipment' })
      .expect(201);

    expect(response.body.data.status).toBe('shipped');
    expect(response.body.data.shipments.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.shipments[0].trackingNumber).toBe('YT-OPS-001');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: { action: 'order.shipped', entityId: orderId },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OrderShipped')).toBe(true);
  });

  it('POST /api/v1/orders/:id/deliver delivers shipped order', async () => {
    eventPublisher.clear();
    const orderId = await createConfirmedOrder();

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/ship`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ carrier: 'MNG', trackingNumber: 'MNG-OPS-002' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ recipientName: 'Ayşe Yılmaz', notes: 'Signed at front desk' })
      .expect(201);

    expect(response.body.data.status).toBe('delivered');
    expect(response.body.data.deliveries.length).toBeGreaterThanOrEqual(1);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OrderDelivered')).toBe(true);
  });

  it('POST /api/v1/orders/:id/cancel cancels pending order', async () => {
    eventPublisher.clear();

    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        items: [{ name: 'Cancel test line', quantity: 1, unitPrice: 500 }],
      })
      .expect(201);

    const orderId = createResponse.body.data.id as string;

    const response = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: 'Customer requested cancellation.' })
      .expect(201);

    expect(response.body.data.status).toBe('cancelled');

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'OrderCancelled')).toBe(true);
  });

  it('POST /api/v1/orders/:id/ship rejects non-confirmed order', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: SEED_IDS.customerDefault,
        items: [{ name: 'Pending ship test', quantity: 1, unitPrice: 500 }],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${createResponse.body.data.id}/ship`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ carrier: 'Aras' })
      .expect(400);
  });
});

describe('Orders (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
