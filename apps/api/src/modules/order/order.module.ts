import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';

@Module({
  imports: [IamModule],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService, JwtAuthGuard, PermissionGuard],
})
export class OrderModule {}
