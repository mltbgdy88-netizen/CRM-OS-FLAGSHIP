import { Injectable, NotFoundException } from '@nestjs/common';
import type { RequestTenantContext } from '../../../common/tenant/tenant-context.types';
import { mapCustomer360View, mapTimelineEvent } from './customer-360.mapper';
import { Customer360Repository } from './customer-360.repository';
import type { ListTimelineQueryDto } from './dto/list-timeline-query.dto';

@Injectable()
export class Customer360Service {
  constructor(private readonly customer360Repository: Customer360Repository) {}

  async getCustomer360(context: RequestTenantContext, customerId: string) {
    const customer = await this.customer360Repository.findCustomerById(context, customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const [scores, riskScores, lifetimeValues, notes, files, timelinePreview] =
      await Promise.all([
        this.customer360Repository.findScoresForCustomer(context, customerId),
        this.customer360Repository.findRiskScoresForCustomer(context, customerId),
        this.customer360Repository.findLifetimeValuesForCustomer(context, customerId),
        this.customer360Repository.findNotesForCustomer(context, customerId),
        this.customer360Repository.findFilesForCustomer(context, customerId),
        this.customer360Repository.findTimelinePreview(context, customerId),
      ]);

    return mapCustomer360View({
      customer,
      scores,
      riskScores,
      lifetimeValues,
      notes,
      files,
      timelinePreview,
    });
  }

  async listCustomerTimeline(
    context: RequestTenantContext,
    customerId: string,
    query: ListTimelineQueryDto,
  ) {
    const customer = await this.customer360Repository.findCustomerById(context, customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const skip = (query.page - 1) * query.pageSize;
    const [total, events] = await Promise.all([
      this.customer360Repository.countTimelineEvents(context, customerId),
      this.customer360Repository.listTimelineEvents(context, customerId, {
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      items: events.map(mapTimelineEvent),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}
