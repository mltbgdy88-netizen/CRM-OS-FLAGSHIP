import { Injectable } from '@nestjs/common';
import type { DomainEventEnvelope } from '@crm-os/events';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';
import { IamRepository } from '../repositories/iam.repository';

@Injectable()
export class AuditService {
  constructor(private readonly iamRepository: IamRepository) {}

  async record(
    context: RequestTenantContext,
    input: {
      action: string;
      entityType: string;
      entityId?: string;
      payload?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<void> {
    await this.iamRepository.writeAuditLog(context, input);
  }
}

@Injectable()
export class DomainEventPublisher {
  private readonly events: DomainEventEnvelope[] = [];

  publish(event: DomainEventEnvelope): void {
    this.events.push(event);
  }

  /** Test-only accessor for Sprint-02 skeleton. */
  getPublishedEvents(): DomainEventEnvelope[] {
    return [...this.events];
  }

  clear(): void {
    this.events.length = 0;
  }
}
