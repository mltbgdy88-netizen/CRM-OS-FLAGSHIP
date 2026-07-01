import { Module } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { IamModule } from '../iam/iam.module';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [IamModule],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService, JwtAuthGuard, PermissionGuard],
})
export class ProductModule {}
