import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { CustomersController } from './customers/customers.controller';
import { CustomersRepository } from './customers/customers.repository';
import { CustomersService } from './customers/customers.service';

@Module({
  imports: [IamModule],
  controllers: [CustomersController],
  providers: [CustomersRepository, CustomersService, JwtAuthGuard, PermissionGuard],
})
export class CrmModule {}
