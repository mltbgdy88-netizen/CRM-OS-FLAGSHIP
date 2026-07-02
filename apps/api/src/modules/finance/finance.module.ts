import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { AccountTransactionsController } from './account-transactions.controller';
import { AccountsController } from './accounts.controller';
import { FinanceController } from './finance.controller';
import { FinanceRepository } from './finance.repository';
import { FinanceService } from './finance.service';
import { InvoicesController } from './invoices.controller';

@Module({
  imports: [IamModule],
  controllers: [
    FinanceController,
    AccountsController,
    AccountTransactionsController,
    InvoicesController,
  ],
  providers: [FinanceRepository, FinanceService, JwtAuthGuard, PermissionGuard],
  exports: [FinanceService],
})
export class FinanceModule {}
