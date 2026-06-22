import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { INestApplication } from '@nestjs/common';

export const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

/** Parse CORS_ORIGIN env (comma-separated allowed origins for local/dev). */
export function resolveCorsOrigins(corsOriginEnv?: string): string[] {
  const raw = corsOriginEnv?.trim() || DEFAULT_CORS_ORIGIN;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function buildCorsOptions(corsOriginEnv?: string): CorsOptions {
  const origins = resolveCorsOrigins(corsOriginEnv);

  return {
    origin: origins.length === 1 ? origins[0] : origins,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

export function enableLocalCors(app: INestApplication): void {
  app.enableCors(buildCorsOptions(process.env.CORS_ORIGIN));
}
