import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../index';
import { applyMigration } from '../migrate';
import { seedIamData } from './index';

async function main(): Promise<void> {
  const { url } = getDatabaseConfigFromEnv();
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await applyMigration(pool);
    await seedIamData(client);
    console.log('Sprint-02 IAM seed completed');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
