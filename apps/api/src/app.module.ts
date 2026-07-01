import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { IamModule } from './modules/iam/iam.module';
import { CrmModule } from './modules/crm/crm.module';
import { LeadModule } from './modules/lead/lead.module';

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
  ],
})
export class AppModule {}
