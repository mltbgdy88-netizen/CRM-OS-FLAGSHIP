import { Injectable, NotFoundException } from '@nestjs/common';
import {
  createCustomerCreatedEvent,
  createCustomerUpdatedEvent,
} from '@crm-os/events';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';
import { IamRepository } from '../../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../../iam/services/audit.service';
import { CustomersRepository } from './customers.repository';
import type { CreateCustomerDto } from './dto/create-customer.dto';
import type { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import type { UpdateCustomerDto } from './dto/update-customer.dto';
import { mapCustomerDetail, mapCustomerSummary } from './customers.mapper';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async listCustomers(context: RequestTenantContext, query: ListCustomersQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, customers] = await Promise.all([
      this.customersRepository.countCustomers(context),
      this.customersRepository.listCustomers(context, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: customers.map(mapCustomerSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getCustomerById(context: RequestTenantContext, id: string) {
    const customer = await this.customersRepository.findCustomerById(context, id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return mapCustomerDetail(customer);
  }

  async createCustomer(context: RequestTenantContext, dto: CreateCustomerDto) {
    const customer = await this.customersRepository.createCustomer(context, dto);

    await this.iamRepository.writeAuditLog(context, {
      action: 'customer.created',
      entityType: 'customer',
      entityId: customer.id,
      payload: {
        displayName: customer.displayName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      },
    });

    this.eventPublisher.publish(
      createCustomerCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        customerId: customer.id,
        displayName: customer.displayName,
      }),
    );

    return mapCustomerSummary(customer);
  }

  async updateCustomer(
    context: RequestTenantContext,
    id: string,
    dto: UpdateCustomerDto,
  ) {
    const existing = await this.customersRepository.findCustomerById(context, id);
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.customersRepository.updateCustomer(context, id, dto);

    await this.iamRepository.writeAuditLog(context, {
      action: 'customer.updated',
      entityType: 'customer',
      entityId: customer.id,
      payload: { changes: dto },
    });

    this.eventPublisher.publish(
      createCustomerUpdatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        customerId: customer.id,
        changes: dto as Record<string, unknown>,
      }),
    );

    return mapCustomerSummary(customer);
  }
}
