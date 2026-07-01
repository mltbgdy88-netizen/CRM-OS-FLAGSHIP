import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../index';
import { applyAllMigrations } from '../migrate';
import { cleanupProofSeedOrphans, shouldCleanupProofSeedOrphans } from './cleanup';
import { seedCrm360Data, seedCrmData, seedIamData, seedLeadData } from './index';

async function main(): Promise<void> {
  const { url } = getDatabaseConfigFromEnv();
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await applyAllMigrations(pool);

    if (shouldCleanupProofSeedOrphans(url)) {
      const removed = await cleanupProofSeedOrphans(client);
      if (removed > 0) {
        console.log(`Proof seed cleanup removed ${removed} orphan customer row(s)`);
      }
    }

    await seedIamData(client);
    await seedCrmData(client);
    await seedCrm360Data(client);
    await seedLeadData(client);
    console.log('Sprint-02 IAM seed completed');
    console.log('Sprint-03 CRM seed completed');
    console.log('Sprint-04 Customer 360 seed completed');
    console.log('Sprint-05 Lead seed completed');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
