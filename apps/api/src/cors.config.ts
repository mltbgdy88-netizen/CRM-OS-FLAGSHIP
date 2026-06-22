import type { INestApplication } from '@nestjs/common';

/** Local/dev browser origin for Next.js web app. Set via CORS_ORIGIN; never use "*" with credentials. */
export function resolveCorsOrigin(): string | undefined {
  const configured = process.env.CORS_ORIGIN?.trim();
  return configured || undefined;
}

export function configureCors(app: INestApplication): void {
  const origin = resolveCorsOrigin();
  if (!origin) {
    return;
  }

  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
