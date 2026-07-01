import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { IamModule } from './modules/iam/iam.module';
import { CrmModule } from './modules/crm/crm.module';
import { LeadModule } from './modules/lead/lead.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { QuoteModule } from './modules/quote/quote.module';
import { SalesModule } from './modules/sales/sales.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    IamModule,
    CrmModule,
    LeadModule,
    SalesModule,
    QuoteModule,
    OrderModule,
    ProductModule,
    InventoryModule,
    TaskModule,
    NotificationModule,
  ],
})
export class AppModule {}
