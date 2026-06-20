import { Injectable } from '@nestjs/common';
import type { PermissionCode } from '@crm-os/permissions';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';
import { IamRepository } from '../repositories/iam.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly iamRepository: IamRepository) {}

  async hasPermissions(
    context: RequestTenantContext,
    required: PermissionCode[],
  ): Promise<boolean> {
    const granted = await this.iamRepository.listUserPermissionCodes(context);
    return required.every((permission) => granted.includes(permission));
  }
}
