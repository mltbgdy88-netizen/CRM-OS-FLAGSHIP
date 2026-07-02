import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockReservationsController } from './stock-reservations.controller';
import { StocksController } from './stocks.controller';

@Module({
  imports: [IamModule],
  controllers: [
    InventoryController,
    StocksController,
    StockMovementsController,
    StockReservationsController,
  ],
  providers: [InventoryRepository, InventoryService, JwtAuthGuard, PermissionGuard],
  exports: [InventoryService],
})
export class InventoryModule {}
