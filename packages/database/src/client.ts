import { PrismaClient } from '@prisma/client';

let prismaSingleton: PrismaClient | undefined;

export function createPrismaClient(options?: { datasourceUrl?: string }): PrismaClient {
  if (options?.datasourceUrl) {
    return new PrismaClient({
      datasources: { db: { url: options.datasourceUrl } },
    });
  }

  return new PrismaClient();
}

export function getPrismaClient(): PrismaClient {
  if (!prismaSingleton) {
    prismaSingleton = createPrismaClient();
  }

  return prismaSingleton;
}

export async function disconnectPrismaClient(): Promise<void> {
  if (prismaSingleton) {
    await prismaSingleton.$disconnect();
    prismaSingleton = undefined;
  }
}
