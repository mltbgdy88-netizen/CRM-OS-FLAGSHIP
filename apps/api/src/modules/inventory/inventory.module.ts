import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';
import { StockMovementsController } from './stock-movements.controller';
import { StocksController } from './stocks.controller';

@Module({
  imports: [IamModule],
  controllers: [InventoryController, StocksController, StockMovementsController],
  providers: [InventoryRepository, InventoryService, JwtAuthGuard, PermissionGuard],
})
export class InventoryModule {}
