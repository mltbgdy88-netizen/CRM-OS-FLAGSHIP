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

const QUOTE_SEND_ONLY_USER = {
  id: '5a000000-0000-4000-8000-000000000001',
  memberId: '5a000000-0000-4000-8000-000000000002',
  roleId: '5a000000-0000-4000-8000-000000000003',
  email: 'quote-send-only@default.local',
};

const QUOTE_APPROVE_ONLY_USER = {
  id: '5a000000-0000-4000-8000-000000000011',
  memberId: '5a000000-0000-4000-8000-000000000012',
  roleId: '5a000000-0000-4000-8000-000000000013',
  email: 'quote-approve-only@default.local',
};

const QUOTE_PDF_ONLY_USER = {
  id: '5a000000-0000-4000-8000-000000000021',
  memberId: '5a000000-0000-4000-8000-000000000022',
  roleId: '5a000000-0000-4000-8000-000000000023',
  email: 'quote-pdf-only@default.local',
};

const TENANT_B_QUOTE_USER = {
  id: '59000000-0000-4000-8000-000000000021',
  memberId: '59000000-0000-4000-8000-000000000022',
  roleId: '59000000-0000-4000-8000-000000000023',
  email: 'quote-read@tenant-b.local',
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeQuotePdfApproval = hasDatabase ? describe : describe.skip;

async function seedDedicatedQuoteWorkflowUsers(passwordHash: string): Promise<void> {
  const prisma = getPrismaClient();

  const dedicatedUsers = [
    {
      user: QUOTE_SEND_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'quote_send_only',
      roleName: 'Quote Send Only',
      permissionIds: [SEED_IDS.permissionQuoteSend],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: QUOTE_APPROVE_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'quote_approve_only',
      roleName: 'Quote Approve Only',
      permissionIds: [SEED_IDS.permissionQuoteApprove],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: QUOTE_PDF_ONLY_USER,
      tenantId: SEED_IDS.tenantDefault,
      roleCode: 'quote_pdf_only',
      roleName: 'Quote PDF Only',
      permissionIds: [SEED_IDS.permissionQuotePdfGenerate],
      createdBy: SEED_IDS.userAdmin,
    },
    {
      user: TENANT_B_QUOTE_USER,
      tenantId: SEED_IDS.tenantB,
      roleCode: 'quote_read_tenant_b',
      roleName: 'Quote Read Tenant B',
      permissionIds: [
        SEED_IDS.permissionQuoteRead,
        SEED_IDS.permissionQuoteSend,
        SEED_IDS.permissionQuoteApprove,
        SEED_IDS.permissionQuotePdfGenerate,
      ],
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

async function loginAs(
  app: INestApplication,
  email: string,
  tenantSlug: string,
): Promise<string> {
  const loginResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({
      email,
      password: SEED_ADMIN_PASSWORD,
      tenantSlug,
    })
    .expect(201);

  return loginResponse.body.data.accessToken;
}

async function createDraftQuote(app: INestApplication, accessToken: string) {
  const response = await request(app.getHttpServer())
    .post('/api/v1/quotes')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      customerId: SEED_IDS.customerDefault,
      items: [{ name: 'Workflow test line', quantity: 1, unitPrice: 2500 }],
    })
    .expect(201);

  return response.body.data as { id: string; number: string; status: string };
}

describeQuotePdfApproval('Quotes PDF + Approval (e2e)', () => {
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
    await seedDedicatedQuoteWorkflowUsers(passwordHash);

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    eventPublisher = app.get(DomainEventPublisher);
    accessToken = await loginAs(app, 'admin@default.local', 'default');
  }, 120_000);

  beforeEach(() => {
    eventPublisher.clear();
  });

  afterAll(async () => {
    await app?.close();
    await disconnectPrismaClient();
  });

  it('POST /api/v1/quotes/:id/send requires auth', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${SEED_IDS.quoteDefault}/send`)
      .expect(401);
  });

  it('POST /api/v1/quotes/:id/send requires quote.send', async () => {
    const token = await loginAs(app, QUOTE_APPROVE_ONLY_USER.email, 'default');

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${SEED_IDS.quoteDefault}/send`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(403);
  });

  it('admin send flow sets status, approval, audit, and QuoteSent event', async () => {
    const quote = await createDraftQuote(app, accessToken);
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ recipientEmail: 'buyer@example.com' })
      .expect(201);

    expect(response.body.data.status).toBe('sent');

    const prisma = getPrismaClient();
    const approval = await prisma.quoteApproval.findFirst({
      where: {
        quoteId: quote.id,
        status: 'pending',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(approval).toBeTruthy();

    const statusHistory = await prisma.quoteStatusHistory.findFirst({
      where: {
        quoteId: quote.id,
        fromStatus: 'draft',
        toStatus: 'sent',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(statusHistory).toBeTruthy();

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'quote.sent',
        entityId: quote.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'QuoteSent')).toBe(true);
  });

  it('POST /api/v1/quotes/:id/approve requires quote.approve', async () => {
    const quote = await createDraftQuote(app, accessToken);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    const token = await loginAs(app, QUOTE_SEND_ONLY_USER.email, 'default');

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ decision: 'approved' })
      .expect(403);
  });

  it('admin approve flow sets status approved with audit and QuoteApproved event', async () => {
    const quote = await createDraftQuote(app, accessToken);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ decision: 'approved', notes: 'Looks good.' })
      .expect(201);

    expect(response.body.data.status).toBe('approved');

    const prisma = getPrismaClient();
    const approval = await prisma.quoteApproval.findFirst({
      where: {
        quoteId: quote.id,
        status: 'approved',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(approval).toBeTruthy();
    expect(approval?.notes).toBe('Looks good.');

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'quote.approved',
        entityId: quote.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'QuoteApproved')).toBe(true);
  });

  it('admin reject flow sets status rejected with audit and QuoteRejected event', async () => {
    const quote = await createDraftQuote(app, accessToken);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ decision: 'rejected', notes: 'Pricing too high.' })
      .expect(201);

    expect(response.body.data.status).toBe('rejected');

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'quote.rejected',
        entityId: quote.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'QuoteRejected')).toBe(true);
  });

  it('GET /api/v1/quotes/:id/pdf requires quote.pdf.generate', async () => {
    const token = await loginAs(app, QUOTE_SEND_ONLY_USER.email, 'default');

    await request(app.getHttpServer())
      .get(`/api/v1/quotes/${SEED_IDS.quoteDefault}/pdf`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('admin pdf flow returns PDF, stores file metadata, view log, and QuoteViewed event', async () => {
    const quote = await createDraftQuote(app, accessToken);
    eventPublisher.clear();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/quotes/${quote.id}/pdf`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(`quote-${quote.number}.pdf`);
    expect(response.body.toString('utf8').startsWith('%PDF-')).toBe(true);

    const prisma = getPrismaClient();
    const file = await prisma.quoteFile.findFirst({
      where: {
        quoteId: quote.id,
        fileName: `quote-${quote.number}.pdf`,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(file).toBeTruthy();

    const viewLog = await prisma.quoteViewLog.findFirst({
      where: {
        quoteId: quote.id,
        source: 'pdf',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(viewLog).toBeTruthy();

    const events = eventPublisher.getPublishedEvents();
    expect(events.some((event) => event.eventType === 'QuoteViewed')).toBe(true);
  });

  it('dedicated permission users are scoped to their workflow action', async () => {
    const quote = await createDraftQuote(app, accessToken);

    const sendToken = await loginAs(app, QUOTE_SEND_ONLY_USER.email, 'default');
    const approveToken = await loginAs(app, QUOTE_APPROVE_ONLY_USER.email, 'default');
    const pdfToken = await loginAs(app, QUOTE_PDF_ONLY_USER.email, 'default');

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${sendToken}`)
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/approve`)
      .set('Authorization', `Bearer ${sendToken}`)
      .send({ decision: 'approved' })
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/quotes/${quote.id}/pdf`)
      .set('Authorization', `Bearer ${sendToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/approve`)
      .set('Authorization', `Bearer ${approveToken}`)
      .send({ decision: 'approved' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${approveToken}`)
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/quotes/${quote.id}/pdf`)
      .set('Authorization', `Bearer ${pdfToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${pdfToken}`)
      .send({})
      .expect(403);
  });

  it('workflow endpoints enforce tenant isolation', async () => {
    const quote = await createDraftQuote(app, accessToken);
    const tenantBToken = await loginAs(app, TENANT_B_QUOTE_USER.email, 'tenant-b');

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${tenantBToken}`)
      .send({})
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/approve`)
      .set('Authorization', `Bearer ${tenantBToken}`)
      .send({ decision: 'approved' })
      .expect(404);

    await request(app.getHttpServer())
      .get(`/api/v1/quotes/${quote.id}/pdf`)
      .set('Authorization', `Bearer ${tenantBToken}`)
      .expect(404);
  });

  it('cannot send a quote that is not in draft status', async () => {
    const quote = await createDraftQuote(app, accessToken);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/quotes/${quote.id}/send`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });
});

describe('Quotes PDF + Approval (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
