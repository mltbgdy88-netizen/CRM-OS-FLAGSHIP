import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { LeadController } from './lead.controller';
import { LeadRepository } from './lead.repository';
import { LeadService } from './lead.service';

@Module({
  imports: [IamModule],
  controllers: [LeadController],
  providers: [LeadRepository, LeadService, JwtAuthGuard, PermissionGuard],
})
export class LeadModule {}
