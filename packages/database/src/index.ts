export interface DatabaseConfig {
  url: string;
}

/**
 * Sprint-01 placeholder only. Business schema and Prisma models arrive in Sprint-02.
 */
export function getDatabaseConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  const url = env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  return { url };
}
