import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../config';
import { seedCrm360Data, seedCrmData, seedDashboardNotificationData, seedFinanceData, seedIamData, seedInventoryData, seedLeadData, seedOrderData, seedProductData, seedQuoteData, seedQuotePdfApprovalData, seedSalesData, seedStockReservationData, seedTaskData } from './index';

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
    await seedProductData(client);
    await seedInventoryData(client);
    await seedStockReservationData(client);
    await seedFinanceData(client);
  } finally {
    client.release();
    await pool.end();
  }
}
