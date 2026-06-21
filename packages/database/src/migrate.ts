import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from './config';

const MIGRATION_BAND = '002_iam';

function migrationPath(): string {
  return join(__dirname, '..', 'migrations', MIGRATION_BAND, 'migration.sql');
}

export async function applyMigration(pool: Pool): Promise<boolean> {
  const tableCheck = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name = 'schema_migrations'
     ) AS exists`,
  );

  if (tableCheck.rows[0]?.exists) {
    const existing = await pool.query<{ band: string }>(
      `SELECT band FROM schema_migrations WHERE band = $1`,
      [MIGRATION_BAND],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return false;
    }
  }

  const sql = readFileSync(migrationPath(), 'utf8');
  await pool.query(sql);
  return true;
}

async function main(): Promise<void> {
  const { url } = getDatabaseConfigFromEnv();
  const pool = new Pool({ connectionString: url });

  try {
    const applied = await applyMigration(pool);
    console.log(applied ? `Applied migration ${MIGRATION_BAND}` : `Migration ${MIGRATION_BAND} already applied`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}

export { MIGRATION_BAND };
