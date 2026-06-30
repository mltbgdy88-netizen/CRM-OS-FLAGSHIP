import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { Customer360Controller } from './customer-360/customer-360.controller';
import { Customer360Repository } from './customer-360/customer-360.repository';
import { Customer360Service } from './customer-360/customer-360.service';
import { CustomersController } from './customers/customers.controller';
import { CustomersRepository } from './customers/customers.repository';
import { CustomersService } from './customers/customers.service';

@Module({
  imports: [IamModule],
  controllers: [Customer360Controller, CustomersController],
  providers: [
    Customer360Repository,
    Customer360Service,
    CustomersRepository,
    CustomersService,
    JwtAuthGuard,
    PermissionGuard,
  ],
})
export class CrmModule {}
