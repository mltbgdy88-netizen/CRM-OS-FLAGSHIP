import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { DeliverOrderDto } from './dto/deliver-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { InventoryService } from '../inventory/inventory.service';
import { ReserveStockDto } from '../inventory/dto/reserve-stock.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListOrdersQueryDto,
  ) {
    const result = await this.orderService.listOrders(context, query);
    return okEnvelope(result);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ORDER_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.orderService.createOrder(context, dto);
    return okEnvelope(order);
  }

  @Post(':id/ship')
  @RequirePermissions(PERMISSIONS.ORDER_SHIP)
  async ship(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShipOrderDto,
  ) {
    const order = await this.orderService.shipOrder(context, id, dto);
    return okEnvelope(order);
  }

  @Post(':id/deliver')
  @RequirePermissions(PERMISSIONS.ORDER_SHIP)
  async deliver(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeliverOrderDto,
  ) {
    const order = await this.orderService.deliverOrder(context, id, dto);
    return okEnvelope(order);
  }

  @Post(':id/cancel')
  @RequirePermissions(PERMISSIONS.ORDER_CANCEL)
  async cancel(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ) {
    const order = await this.orderService.cancelOrder(context, id, dto);
    return okEnvelope(order);
  }

  @Post(':id/reserve-stock')
  @RequirePermissions(PERMISSIONS.INVENTORY_RESERVE)
  async reserveStock(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReserveStockDto,
  ) {
    const result = await this.inventoryService.reserveStockForOrder(context, id, dto);
    return okEnvelope(result);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  async getById(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const order = await this.orderService.getOrderById(context, id);
    return okEnvelope(order);
  }
}
