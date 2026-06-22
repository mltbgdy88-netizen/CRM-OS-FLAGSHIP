import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  applyMigrationFromEnv,
  disconnectPrismaClient,
  getAppDatabaseUrlFromEnv,
  SEED_ADMIN_PASSWORD,
  SEED_IDS,
  seedIamFromEnv,
} from '@crm-os/database';
import { AppModule } from '../src/app.module';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeCustomer360 = hasDatabase ? describe : describe.skip;

describeCustomer360('Customer 360 (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

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

  it('GET /api/v1/customers/:id/360 requires auth', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerDefault}/360`)
      .expect(401);
  });

  it('GET /api/v1/customers/:id/360 requires customer.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerTenantB}/360`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/customers/:id/360 returns seeded 360 data for tenant A', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerDefault}/360`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { data } = response.body;
    expect(data.id).toBe(SEED_IDS.customerDefault);
    expect(data.scores.some((score: { id: string }) => score.id === SEED_IDS.scoreDefault)).toBe(
      true,
    );
    expect(data.riskScore?.id).toBe(SEED_IDS.riskScoreDefault);
    expect(data.lifetimeValue?.id).toBe(SEED_IDS.ltvDefault);
    expect(data.notes.some((note: { id: string }) => note.id === SEED_IDS.noteDefault)).toBe(true);
    expect(data.files.some((file: { id: string }) => file.id === SEED_IDS.fileDefault)).toBe(true);
    expect(
      data.timelinePreview.some(
        (event: { id: string }) => event.id === SEED_IDS.timelineEventDefault,
      ),
    ).toBe(true);
  });

  it('GET /api/v1/customers/:id/360 returns 404 for tenant B customer under tenant A context', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerTenantB}/360`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('GET /api/v1/customers/:id/timeline requires auth', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerDefault}/timeline`)
      .expect(401);
  });

  it('GET /api/v1/customers/:id/timeline requires customer.timeline.read', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerTenantB}/timeline`)
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('GET /api/v1/customers/:id/timeline returns tenant A events only', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerDefault}/timeline`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { items, total, page, pageSize } = response.body.data;
    expect(page).toBe(1);
    expect(pageSize).toBeGreaterThan(0);
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThanOrEqual(1);
    expect(items.some((event: { id: string }) => event.id === SEED_IDS.timelineEventDefault)).toBe(
      true,
    );
    expect(items.some((event: { id: string }) => event.id === SEED_IDS.timelineEventTenantB)).toBe(
      false,
    );
  });

  it('Sprint-03 GET /api/v1/customers/{id} still returns related entity aggregation', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/customers/${SEED_IDS.customerDefault}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.notes.some((note: { id: string }) => note.id === SEED_IDS.noteDefault)).toBe(
      true,
    );
    expect(response.body.data.files.some((file: { id: string }) => file.id === SEED_IDS.fileDefault)).toBe(
      true,
    );
  });
});

describe('Customer 360 (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
