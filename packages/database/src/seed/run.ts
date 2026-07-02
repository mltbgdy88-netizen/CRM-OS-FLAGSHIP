import { Pool } from 'pg';
import { getDatabaseConfigFromEnv } from '../index';
import { applyAllMigrations } from '../migrate';
import { cleanupProofSeedOrphans, shouldCleanupProofSeedOrphans } from './cleanup';
import { seedCrm360Data, seedCrmData, seedDashboardNotificationData, seedFinanceData, seedIamData, seedInventoryData, seedLeadData, seedOrderData, seedProductData, seedQuoteData, seedQuotePdfApprovalData, seedSalesData, seedStockReservationData, seedTaskData } from './index';

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
    console.log('Sprint-02 IAM seed completed');
    console.log('Sprint-03 CRM seed completed');
    console.log('Sprint-04 Customer 360 seed completed');
    console.log('Sprint-05 Lead seed completed');
    console.log('Sprint-06 Sales seed completed');
    console.log('Sprint-09 Quote seed completed');
    console.log('Sprint-10 Quote PDF + Approval seed completed');
    console.log('Sprint-11 Task & Activity seed completed');
    console.log('Sprint-12 Dashboard & Notification seed completed');
    console.log('Sprint-13 Order seed completed');
    console.log('Sprint-15 Product Catalog seed completed');
    console.log('Sprint-16 Inventory Core seed completed');
    console.log('Sprint-17 Stock Reservation seed completed');
    console.log('Sprint-18 Finance Lite seed completed');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
