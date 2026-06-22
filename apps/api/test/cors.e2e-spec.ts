import { Controller, INestApplication, Post, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureCors } from '../src/cors.config';

@Controller('auth')
class AuthStubController {
  @Post('login')
  login(): { ok: boolean } {
    return { ok: true };
  }
}

describe('CORS (e2e)', () => {
  let app: INestApplication;
  const localWebOrigin = 'http://localhost:3000';

  beforeAll(async () => {
    process.env.CORS_ORIGIN = localWebOrigin;

    const moduleFixture = await Test.createTestingModule({
      controllers: [AuthStubController],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureCors(app);
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('OPTIONS /api/v1/auth/login returns CORS headers for local web origin', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/v1/auth/login')
      .set('Origin', localWebOrigin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(localWebOrigin);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
