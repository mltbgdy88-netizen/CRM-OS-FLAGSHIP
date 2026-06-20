import { Controller, Get } from '@nestjs/common';
import { CRM_OS_SERVICE_NAME, CRM_OS_VERSION } from '@crm-os/shared';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: CRM_OS_SERVICE_NAME,
      version: CRM_OS_VERSION,
    };
  }
}
