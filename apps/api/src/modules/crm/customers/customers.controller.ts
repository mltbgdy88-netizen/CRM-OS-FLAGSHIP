import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PERMISSIONS } from '@crm-os/permissions';
import { JwtAuthGuard, PermissionGuard } from '../../../common/auth/auth.guards';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { okEnvelope } from '../../../common/http/api-envelope';
import {
  RequireTenantContext,
  TenantContextInterceptor,
} from '../../../common/tenant/tenant-context.interceptor';
import { TenantContextParam } from '../../../common/tenant/tenant-context.decorator';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CUSTOMER_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListCustomersQueryDto,
  ) {
    const result = await this.customersService.listCustomers(context, query);
    return okEnvelope(result);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CUSTOMER_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateCustomerDto,
  ) {
    const customer = await this.customersService.createCustomer(context, dto);
    return okEnvelope(customer);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CUSTOMER_READ)
  async getById(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const customer = await this.customersService.getCustomerById(context, id);
    return okEnvelope(customer);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CUSTOMER_UPDATE)
  async update(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.updateCustomer(context, id, dto);
    return okEnvelope(customer);
  }
}
