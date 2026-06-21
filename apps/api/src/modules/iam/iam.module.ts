import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { RolesController } from './controllers/roles.controller';
import { UsersController } from './controllers/users.controller';
import { IamRepository } from './repositories/iam.repository';
import { AuditService, DomainEventPublisher } from './services/audit.service';
import { AuthService } from './services/auth.service';
import { JwtTokenService } from './services/jwt-token.service';
import { PermissionService } from './services/permission.service';
import { RolesService, UsersService } from './services/users-roles.service';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';

@Module({
  controllers: [AuthController, UsersController, RolesController],
  providers: [
    IamRepository,
    AuthService,
    UsersService,
    RolesService,
    PermissionService,
    JwtTokenService,
    AuditService,
    DomainEventPublisher,
    JwtAuthGuard,
    PermissionGuard,
  ],
  exports: [PermissionService, JwtTokenService, DomainEventPublisher, IamRepository],
})
export class IamModule {}
