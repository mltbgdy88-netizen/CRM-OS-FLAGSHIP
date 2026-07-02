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
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import { FinanceService } from './finance.service';

@Controller('accounts')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class AccountsController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ACCOUNT_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListAccountsQueryDto,
  ) {
    const result = await this.financeService.listAccounts(context, query);
    return okEnvelope(result);
  }
}
