export interface DatabaseConfig {
  url: string;
}

export function getDatabaseConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  const url = env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  return { url };
}
