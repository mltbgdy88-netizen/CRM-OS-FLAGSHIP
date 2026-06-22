import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../config';
import { seedCrmData, seedIamData } from './index';

export async function seedIamFromEnv(): Promise<void> {
  const pool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });
  const client = await pool.connect();

  try {
    await seedIamData(client);
    await seedCrmData(client);
  } finally {
    client.release();
    await pool.end();
  }
}
