import type { Prisma, PrismaClient } from '@prisma/client';

export interface TenantContext {
  tenantId: string;
  userId: string;
}

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

/**
 * Sets transaction-local PostgreSQL session variables before tenant-scoped queries.
 *
 * Equivalent to:
 *   SELECT set_config('app.tenant_id', $tenantId, true);
 *   SELECT set_config('app.user_id', $userId, true);
 */
export async function setTenantContext(
  client: TransactionClient,
  context: TenantContext,
): Promise<void> {
  await client.$executeRaw`
    SELECT set_config('app.tenant_id', ${context.tenantId}, true),
           set_config('app.user_id', ${context.userId}, true)
  `;
}

export async function withTenantContext<T>(
  prisma: PrismaClient,
  context: TenantContext,
  fn: (tx: TransactionClient) => Promise<T>,
  options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      await setTenantContext(tx, context);
      return fn(tx);
    },
    options,
  );
}

/**
 * Build a DATABASE_URL for the RLS-enforced application role.
 */
export function getAppDatabaseUrlFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = env.DATABASE_APP_URL;
  if (explicit) {
    return explicit;
  }

  const base = env.DATABASE_URL;
  if (!base) {
    throw new Error('DATABASE_URL is not configured');
  }

  const url = new URL(base);
  url.username = env.DATABASE_APP_USER ?? 'crmos_app';
  url.password = env.DATABASE_APP_PASSWORD ?? 'crmos_app';
  return url.toString();
}
