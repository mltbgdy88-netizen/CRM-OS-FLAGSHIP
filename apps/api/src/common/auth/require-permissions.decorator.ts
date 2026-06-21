import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from '@crm-os/permissions';

export const PERMISSIONS_KEY = 'requiredPermissions';

export const RequirePermissions = (...permissions: PermissionCode[]): MethodDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
