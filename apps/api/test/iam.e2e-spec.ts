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
import { DomainEventPublisher } from '../src/modules/iam/services/audit.service';

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIam = hasDatabase ? describe : describe.skip;

describeIam('IAM (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
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
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await disconnectPrismaClient();
  });

  it('POST /api/v1/auth/login authenticates seeded admin', async () => {
    eventPublisher.clear();
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@default.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'default',
      })
      .expect(201);

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.tenantId).toBe(SEED_IDS.tenantDefault);
    expect(eventPublisher.getPublishedEvents().some((e) => e.eventType === 'UserLoggedIn')).toBe(
      true,
    );

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it('GET /api/v1/users requires tenant context and permission', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items[0].email).toBe('admin@default.local');
  });

  it('GET /api/v1/users rejects missing bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/users').expect(401);
  });

  it('GET /api/v1/users rejects invalid bearer token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', 'Bearer not-a-valid-jwt')
      .expect(401);
  });

  it('GET /api/v1/users returns 403 when JWT is valid but permission is missing', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@tenant-b.local',
        password: SEED_ADMIN_PASSWORD,
        tenantSlug: 'tenant-b',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(403);
  });

  it('POST /api/v1/auth/refresh returns a new access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(response.body.data.accessToken).toBeDefined();
    accessToken = response.body.data.accessToken;
  });

  it('POST /api/v1/auth/refresh rejects invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not-a-valid-refresh-token' })
      .expect(401);
  });

  it('POST /api/v1/auth/refresh cannot bypass tenant context', async () => {
    const [userId, , nonce] = Buffer.from(refreshToken, 'base64url')
      .toString('utf8')
      .split(':');
    const tamperedToken = Buffer.from(`${userId}:${SEED_IDS.tenantB}:${nonce}`, 'utf8').toString(
      'base64url',
    );

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tamperedToken })
      .expect(401);
  });

  it('POST /api/v1/roles creates a tenant role with audit/event side effects', async () => {
    eventPublisher.clear();
    const roleCode = `support_agent_${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: roleCode, name: 'Support Agent' })
      .expect(201);

    expect(response.body.data.code).toBe(roleCode);
    expect(eventPublisher.getPublishedEvents().some((e) => e.eventType === 'RoleChanged')).toBe(
      true,
    );
  });
});

describe('IAM tenant context (offline)', () => {
  it('skips integration suite when DATABASE_URL is unset', () => {
    if (hasDatabase) {
      expect(process.env.DATABASE_URL).toContain('postgresql://');
      return;
    }
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
