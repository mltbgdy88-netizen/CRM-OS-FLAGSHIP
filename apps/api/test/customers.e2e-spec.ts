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

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeCustomers = hasDatabase ? describe : describe.skip;

describeCustomers('Customer Core (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let eventPublisher: DomainEventPublisher;

  beforeAll(async () => {
    process.env.DATABASE_APP_URL =
      process.env.DATABASE_APP_URL ?? getAppDatabaseUrlFromEnv();
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-local-only';

    await applyMigrationFromEnv();
    await seedIamFromEnv();

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

  afterAll(async () => {
    await app?.close();
    await disconnectPrismaClient();
  });

  it('GET /api/v1/customers requires auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/customers').expect(401);
  });

  it('GET /api/v1/customers requires customer.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/customers returns paginated tenant customers', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { page, pageSize, total, items } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeLessThanOrEqual(pageSize);
    expect(items.some((item: { id: string }) => item.id === SEED_IDS.customerTenantB)).toBe(false);
  });

  it('GET /api/v1/customers/{id} returns related entity aggregation', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(SEED_IDS.customerDefault);
    expect(Array.isArray(response.body.data.contacts)).toBe(true);
    expect(Array.isArray(response.body.data.addresses)).toBe(true);
    expect(Array.isArray(response.body.data.tags)).toBe(true);
    expect(response.body.data.notes.some((note: { id: string }) => note.id === SEED_IDS.noteDefault)).toBe(
      true,
    );
    expect(response.body.data.files.some((file: { id: string }) => file.id === SEED_IDS.fileDefault)).toBe(
      true,
    );
  });

  it('Tenant A cannot access Tenant B customer through API', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerTenantB}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('POST /api/v1/customers requires customer.create', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ displayName: 'Forbidden Customer' })
      .expect(403);
  });

  it('POST /api/v1/customers creates customer with audit and CustomerCreated event', async () => {
    eventPublisher.clear();
    const displayName = `Created Customer ${Date.now()}`;

    const response = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        displayName,
        email: 'created@default.local',
        phone: '+905551112233',
      })
      .expect(201);

    expect(response.body.data.displayName).toBe(displayName);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'customer.created',
        entityId: response.body.data.id,
      },
    });
    expect(audit).toBeTruthy();

    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'CustomerCreated'),
    ).toBe(true);
  });

  it('PATCH /api/v1/customers/{id} requires customer.update', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/customers/${SEED_IDS.customerDefault}`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .send({ displayName: 'Should Fail' })
      .expect(403);
  });

  it('PATCH /api/v1/customers/{id} updates customer with audit and CustomerUpdated event', async () => {
    eventPublisher.clear();
    const updatedName = `Updated Customer ${Date.now()}`;

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/customers/${SEED_IDS.customerDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ displayName: updatedName })
      .expect(200);

    expect(response.body.data.displayName).toBe(updatedName);

    const prisma = getPrismaClient();
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'customer.updated',
        entityId: SEED_IDS.customerDefault,
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeTruthy();

    expect(
      eventPublisher.getPublishedEvents().some((event) => event.eventType === 'CustomerUpdated'),
    ).toBe(true);
  });
});

describe('Customer Core (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
