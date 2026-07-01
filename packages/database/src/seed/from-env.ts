import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../config';
import { seedCrm360Data, seedCrmData, seedDashboardNotificationData, seedIamData, seedLeadData, seedOrderData, seedQuoteData, seedQuotePdfApprovalData, seedSalesData, seedTaskData } from './index';

export async function seedIamFromEnv(): Promise<void> {
  const pool = new Pool({ connectionString: getDatabaseConfigFromEnv().url });
  const client = await pool.connect();

  try {
    await seedIamData(client);
    await seedCrmData(client);
    await seedCrm360Data(client);
    await seedLeadData(client);
    await seedSalesData(client);
    await seedQuoteData(client);
    await seedQuotePdfApprovalData(client);
    await seedTaskData(client);
    await seedDashboardNotificationData(client);
    await seedOrderData(client);
  } finally {
    client.release();
    await pool.end();
  }
}
