import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';

@Module({
  imports: [IamModule, InventoryModule],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService, JwtAuthGuard, PermissionGuard],
})
export class OrderModule {}
