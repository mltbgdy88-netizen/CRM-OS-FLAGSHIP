import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../config';
import { seedCrm360Data, seedCrmData, seedIamData, seedLeadData } from './index';

export async function seedIamFromEnv(): Promise<void> {
  const pool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });
  const client = await pool.connect();

  try {
    await seedIamData(client);
    await seedCrmData(client);
    await seedCrm360Data(client);
    await seedLeadData(client);
  } finally {
    client.release();
    await pool.end();
  }
}
