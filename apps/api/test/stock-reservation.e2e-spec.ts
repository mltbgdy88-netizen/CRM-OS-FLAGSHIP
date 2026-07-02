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

const INVENTORY_RESERVE_ONLY_USER = {
  id: '6d000000-0000-4000-8000-000000000001',
  memberId: '6d000000-0000-4000-8000-000000000002',
  roleId: '6d000000-0000-4000-8000-000000000003',
  email: 'inventory-reserve-only@default.local',
};

const INVENTORY_RELEASE_ONLY_USER = {
  id: '6d000000-0000-4000-8000-000000000011',
  memberId: '6d000000-0000-4000-8000-000000000012',
  roleId: '6d000000-0000-4000-8000-000000000013',
  email: 'inventory-release-only@default.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeReservations = hasDatabase ? describe : describe.skip;

async function seedDedicatedReservationUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: INVENTORY_RESERVE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'inventory_reserve_only',
      roleName: 'Inventory Reserve Only',
      permissionIds: [SEED_IDS.permissionInventoryReserve],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: INVENTORY_RELEASE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'inventory_release_only',
      roleName: 'Inventory Release Only',
      permissionIds: [SEED_IDS.permissionInventoryRelease],
      createdBy: SEED_IDS.userAdmin,
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

describeReservations('Stock Reservation (e2e)', () => {
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
    await seedDedicatedReservationUsers(passwordHash);

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

  it('GET /api/v1/stock-reservations returns paginated reservations', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/stock-reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.total).toBeGreaterThanOrEqual(1);
    expect(
      response.body.data.items.some(
        (item: { id: string }) => item.id === SEED_IDS.stockReservationDefault,
      ),
    ).toBe(true);
  });

  it('POST /api/v1/orders/:id/reserve-stock requires inventory.reserve', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: INVENTORY_RELEASE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${SEED_IDS.orderDefault}/reserve-stock`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        items: [
          {
            warehouseId: SEED_IDS.warehouseDefault,
            productVariantId: SEED_IDS.productVariantDefault,
            quantity: 1,
          },
        ],
      })
      .expect(403);
  });

  it('POST /api/v1/orders/:id/reserve-stock creates reservation with audit and StockReserved event', async () => {
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/orders/${SEED_IDS.orderDefault}/reserve-stock`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        items: [
          {
            warehouseId: SEED_IDS.warehouseDefault,
            productVariantId: SEED_IDS.productVariantDefault,
            quantity: 3,
          },
        ],
        notes: 'E2E reservation',
      })
      .expect(201);

    expect(response.body.data.orderId).toBe(SEED_IDS.orderDefault);
    expect(response.body.data.reservations).toHaveLength(1);
    expect(response.body.data.reservations[0].quantity).toBe(3);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'stock.reservation.created',
        entityId: response.body.data.orderReservationId,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'StockReserved')).toBe(true);
  });

  it('POST /api/v1/stock-reservations/:id/release requires inventory.release', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: INVENTORY_RESERVE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/stock-reservations/${SEED_IDS.stockReservationDefault}/release`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('POST /api/v1/stock-reservations/:id/release releases reservation with audit and StockReleased event', async () => {
    eventPublisher.clear();

    const reserveResponse = await request(app.getHttpServer())
      .post(`/api/v1/orders/${SEED_IDS.orderDefault}/reserve-stock`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        items: [
          {
            warehouseId: SEED_IDS.warehouseDefault,
            productVariantId: SEED_IDS.productVariantDefault,
            quantity: 2,
          },
        ],
      })
      .expect(201);

    const reservationId = reserveResponse.body.data.reservations[0].id as string;

    const response = await request(app.getHttpServer())
      .post(`/api/v1/stock-reservations/${reservationId}/release`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body.data.id).toBe(reservationId);
    expect(response.body.data.status).toBe('released');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'stock.reservation.released',
        entityId: reservationId,
      },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'StockReleased')).toBe(true);
  });
});

describe('Stock Reservation (e2e offline)', () => {
  it('documents that stock reservation e2e runs when DATABASE_URL is set', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
