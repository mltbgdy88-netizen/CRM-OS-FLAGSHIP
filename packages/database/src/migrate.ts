import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from './config';

export const MIGRATION_BANDS = [
  '002_iam',
  '003_crm',
  '003_crm_360',
  '004_lead',
  '005_sales',
  '005_sales_opportunity',
  '006_quote',
  '007_quote_pdf_approval',
  '008_task',
  '009_dashboard_notification',
  '010_order',
] as const;
export type MigrationBand = (typeof MIGRATION_BANDS)[number];

/** @deprecated Use MIGRATION_BANDS — retained for Sprint-02 callers */
export const MIGRATION_BAND: MigrationBand = '002_iam';

function migrationPath(band: MigrationBand): string {
  return join(__dirname, '..', 'migrations', band, 'migration.sql');
}

export async function applyMigrationBand(pool: Pool, band: MigrationBand): Promise<boolean> {
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
      [band],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return false;
    }
  }

  const sql = readFileSync(migrationPath(band), 'utf8');
  await pool.query(sql);
  return true;
}

export async function applyAllMigrations(pool: Pool): Promise<boolean> {
  let anyApplied = false;

  for (const band of MIGRATION_BANDS) {
    const applied = await applyMigrationBand(pool, band);
    if (applied) {
      anyApplied = true;
      console.log(`Applied migration ${band}`);
    } else {
      console.log(`Migration ${band} already applied`);
    }
  }

  return anyApplied;
}

/** Applies all migration bands in order (002_iam … 010_order). */
export async function applyMigration(pool: Pool): Promise<boolean> {
  return applyAllMigrations(pool);
}

async function main(): Promise<void> {
  const { url } = getDatabaseConfigFromEnv();
  const pool = new Pool({ connectionString: url });

  try {
    await applyAllMigrations(pool);
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
