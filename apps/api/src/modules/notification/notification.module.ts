import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';

@Module({
  imports: [IamModule],
  controllers: [DashboardController, NotificationController],
  providers: [
    DashboardRepository,
    DashboardService,
    NotificationRepository,
    NotificationService,
    JwtAuthGuard,
    PermissionGuard,
  ],
})
export class NotificationModule {}
