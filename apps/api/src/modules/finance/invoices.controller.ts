import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { FinanceService } from './finance.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class InvoicesController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.INVOICE_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateInvoiceDto,
  ) {
    const invoice = await this.financeService.createInvoice(context, dto);
    return okEnvelope(invoice);
  }
}
