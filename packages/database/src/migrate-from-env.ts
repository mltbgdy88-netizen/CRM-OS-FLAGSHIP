import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from './config';
import { applyMigration } from './migrate';

export async function applyMigrationFromEnv(): Promise<boolean> {
  const pool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });

  try {
    return await applyMigration(pool);
  } finally {
    await pool.end();
  }
}
