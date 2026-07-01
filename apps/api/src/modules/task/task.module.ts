import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { ActivityController } from './activity.controller';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [IamModule],
  controllers: [TaskController, ActivityController],
  providers: [TaskRepository, TaskService, JwtAuthGuard, PermissionGuard],
})
export class TaskModule {}
