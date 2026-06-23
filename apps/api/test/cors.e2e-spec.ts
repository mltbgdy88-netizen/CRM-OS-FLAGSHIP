import { Controller, INestApplication, Module, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureCors } from '../src/common/http/cors.config';

@Controller('auth')
class CorsProbeAuthController {
  @Post('login')
  probeLogin(): { ok: boolean } {
    return { ok: true };
  }
}

@Module({
  controllers: [CorsProbeAuthController],
})
class CorsProbeModule {}

describe('CORS (e2e)', () => {
  let app: INestApplication;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousDatabaseAppUrl = process.env.DATABASE_APP_URL;

  beforeAll(async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_APP_URL;

    const moduleFixture = await Test.createTestingModule({
      imports: [CorsProbeModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureCors(app, 'http://localhost:3000');
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
    if (previousDatabaseAppUrl === undefined) {
      delete process.env.DATABASE_APP_URL;
    } else {
      process.env.DATABASE_APP_URL = previousDatabaseAppUrl;
    }
  });

  it('OPTIONS /api/v1/auth/login returns CORS headers for localhost web origin', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-methods']).toMatch(/POST/);
    expect(response.headers['access-control-allow-headers']).toMatch(/content-type/i);
  });
});
