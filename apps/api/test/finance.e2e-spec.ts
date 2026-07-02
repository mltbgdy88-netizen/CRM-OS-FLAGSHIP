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

const FINANCE_READ_ONLY_USER = {
  id: '6e000000-0000-4000-8000-000000000001',
  memberId: '6e000000-0000-4000-8000-000000000002',
  roleId: '6e000000-0000-4000-8000-000000000003',
  email: 'finance-read-only@default.local',
};

const INVOICE_CREATE_ONLY_USER = {
  id: '6e000000-0000-4000-8000-000000000011',
  memberId: '6e000000-0000-4000-8000-000000000012',
  roleId: '6e000000-0000-4000-8000-000000000013',
  email: 'invoice-create-only@default.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeFinance = hasDatabase ? describe : describe.skip;

async function seedDedicatedFinanceUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: FINANCE_READ_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'finance_read_only',
      roleName: 'Finance Read Only',
      permissionIds: [SEED_IDS.permissionFinanceRead],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: INVOICE_CREATE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'invoice_create_only',
      roleName: 'Invoice Create Only',
      permissionIds: [SEED_IDS.permissionInvoiceCreate],
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

describeFinance('Finance (e2e)', () => {
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
    await seedDedicatedFinanceUsers(passwordHash);

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

  it('GET /api/v1/finance requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/finance').expect(401);
  });

  it('GET /api/v1/finance requires finance.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: INVOICE_CREATE_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/finance')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/finance returns overview for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/finance')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.totalAccounts).toBeGreaterThanOrEqual(1);
    expect(response.body.data.totalReceivables).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(response.body.data.recentTransactions)).toBe(true);
  });

  it('GET /api/v1/accounts returns paginated accounts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.total).toBeGreaterThanOrEqual(1);
    expect(
      response.body.data.items.some(
        (account: { id: string }) => account.id === SEED_IDS.accountDefault,
      ),
    ).toBe(true);
  });

  it('GET /api/v1/account-transactions returns paginated transactions', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/account-transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.total).toBeGreaterThanOrEqual(1);
    expect(
      response.body.data.items.some(
        (tx: { id: string }) => tx.id === SEED_IDS.accountTransactionDefault,
      ),
    ).toBe(true);
  });

  it('POST /api/v1/invoices requires invoice.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: FINANCE_READ_ONLY_USER.email,
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({
        accountId: SEED_IDS.accountDefault,
        invoiceNumber: 'INV-TEST-403',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100 }],
      })
      .expect(403);
  });

  it('POST /api/v1/invoices creates invoice with audit and events', async () => {
    const invoiceNumber = `INV-E2E-${Date.now()}`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        accountId: SEED_IDS.accountDefault,
        invoiceNumber,
        taxAmount: 180,
        items: [{ description: 'E2E Service', quantity: 1, unitPrice: 1000 }],
      })
      .expect(201);

    expect(response.body.data.invoiceNumber).toBe(invoiceNumber);
    expect(response.body.data.totalAmount).toBe(1180);
    expect(response.body.data.items).toHaveLength(1);

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'InvoiceCreated')).toBe(true);
    expect(events.some((event) => event.eventType === 'BalanceUpdated')).toBe(true);
  });
});

describe('Finance (e2e offline)', () => {
  it('documents that finance e2e runs when DATABASE_URL is set', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }

    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
