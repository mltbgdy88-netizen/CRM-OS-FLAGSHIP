import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { QuoteController } from './quote.controller';
import { QuoteRepository } from './quote.repository';
import { QuoteService } from './quote.service';

@Module({
  imports: [IamModule],
  controllers: [QuoteController],
  providers: [QuoteRepository, QuoteService, JwtAuthGuard, PermissionGuard],
})
export class QuoteModule {}
