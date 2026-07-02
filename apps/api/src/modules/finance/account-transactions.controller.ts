import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { PERMISSIONS } from '@crm-os/permissions';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { okEnvelope } from '../../common/http/api-envelope';
import {
  RequireTenantContext,
  TenantContextInterceptor,
} from '../../common/tenant/tenant-context.interceptor';
import { TenantContextParam } from '../../common/tenant/tenant-context.decorator';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { ListAccountTransactionsQueryDto } from './dto/list-account-transactions-query.dto';
import { FinanceService } from './finance.service';

@Controller('account-transactions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class AccountTransactionsController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ACCOUNT_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListAccountTransactionsQueryDto,
  ) {
    const result = await this.financeService.listAccountTransactions(context, query);
    return okEnvelope(result);
  }
}
