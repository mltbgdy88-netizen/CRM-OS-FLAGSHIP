import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createBalanceUpdatedEvent, createInvoiceCreatedEvent } from '@crm-os/events';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { IamRepository } from '../iam/repositories/iam.repository';
import { DomainEventPublisher } from '../iam/services/audit.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { ListAccountTransactionsQueryDto } from './dto/list-account-transactions-query.dto';
import type { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import {
  mapAccountSummary,
  mapAccountTransaction,
  mapFinanceOverview,
  mapInvoiceDetail,
} from './finance.mapper';
import { FinanceRepository } from './finance.repository';

@Injectable()
export class FinanceService {
  constructor(
    private readonly financeRepository: FinanceRepository,
    private readonly iamRepository: IamRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async getOverview(context: RequestTenantContext) {
    const [accounts, recentTransactions] = await Promise.all([
      this.financeRepository.listAllAccounts(context),
      this.financeRepository.listRecentTransactions(context, 5),
    ]);

    let totalReceivables = 0;
    let totalCreditLimit = 0;

    for (const account of accounts) {
      const balance = Number(account.balance);
      if (balance > 0) {
        totalReceivables += balance;
      }
      if (account.creditLimit) {
        totalCreditLimit += Number(account.creditLimit.limitAmount);
      }
    }

    return mapFinanceOverview({
      totalAccounts: accounts.length,
      totalReceivables,
      totalCreditLimit,
      recentTransactions: recentTransactions.map(mapAccountTransaction),
    });
  }

  async listAccounts(context: RequestTenantContext, query: ListAccountsQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, accounts] = await Promise.all([
      this.financeRepository.countAccounts(context),
      this.financeRepository.listAccounts(context, { skip, take: query.pageSize }),
    ]);

    return {
      items: accounts.map(mapAccountSummary),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async listAccountTransactions(
    context: RequestTenantContext,
    query: ListAccountTransactionsQueryDto,
  ) {
    const skip = (query.page - 1) * query.pageSize;
    const [total, transactions] = await Promise.all([
      this.financeRepository.countAccountTransactions(context, query.accountId),
      this.financeRepository.listAccountTransactions(context, {
        skip,
        take: query.pageSize,
        accountId: query.accountId,
      }),
    ]);

    return {
      items: transactions.map(mapAccountTransaction),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async createInvoice(context: RequestTenantContext, dto: CreateInvoiceDto) {
    const account = await this.financeRepository.findAccountById(context, dto.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = dto.taxAmount ?? 0;
    const totalAmount = subtotal + taxAmount;

    if (totalAmount <= 0) {
      throw new BadRequestException('Invoice total must be greater than zero');
    }

    const result = await this.financeRepository.createInvoice(context, dto, {
      subtotal,
      taxAmount,
      totalAmount,
    });

    if (!result) {
      throw new NotFoundException('Account not found');
    }

    const { invoice, balanceBefore, balanceAfter } = result;

    await this.iamRepository.writeAuditLog(context, {
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice.id,
      payload: {
        accountId: dto.accountId,
        invoiceNumber: dto.invoiceNumber,
        totalAmount,
      },
    });

    this.eventPublisher.publish(
      createInvoiceCreatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        invoiceId: invoice.id,
        accountId: dto.accountId,
        totalAmount,
        currency: dto.currency ?? 'TRY',
      }),
    );

    this.eventPublisher.publish(
      createBalanceUpdatedEvent({
        tenantId: context.tenantId,
        actorId: context.userId,
        accountId: dto.accountId,
        balanceBefore,
        balanceAfter,
      }),
    );

    return mapInvoiceDetail(invoice);
  }
}
