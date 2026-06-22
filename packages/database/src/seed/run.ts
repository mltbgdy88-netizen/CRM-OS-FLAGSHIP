import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../index';
import { applyAllMigrations } from '../migrate';
import { seedCrm360Data, seedCrmData, seedIamData } from './index';

async function main(): Promise<void> {
  const { url } = getDatabaseConfigFromEnv();
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await applyAllMigrations(pool);
    await seedIamData(client);
    await seedCrmData(client);
    await seedCrm360Data(client);
    console.log('Sprint-02 IAM seed completed');
    console.log('Sprint-03 CRM seed completed');
    console.log('Sprint-04 Customer 360 seed completed');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
