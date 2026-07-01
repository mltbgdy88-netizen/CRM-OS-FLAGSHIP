import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PERMISSIONS } from '@crm-os/permissions';
import { JwtAuthGuard, PermissionGuard } from '../../common/auth/auth.guards';
import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { okEnvelope } from '../../common/http/api-envelope';
import {
  RequireTenantContext,
  TenantContextInterceptor,
} from '../../common/tenant/tenant-context.interceptor';
import { TenantContextParam } from '../../common/tenant/tenant-context.decorator';
import type { RequestTenantContext } from '../../common/tenant/tenant-context.types';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ListQuotesQueryDto } from './dto/list-quotes-query.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteService } from './quote.service';

@Controller('quotes')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(TenantContextInterceptor)
@RequireTenantContext()
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.QUOTE_READ)
  async list(
    @TenantContextParam() context: RequestTenantContext,
    @Query() query: ListQuotesQueryDto,
  ) {
    const result = await this.quoteService.listQuotes(context, query);
    return okEnvelope(result);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.QUOTE_CREATE)
  async create(
    @TenantContextParam() context: RequestTenantContext,
    @Body() dto: CreateQuoteDto,
  ) {
    const quote = await this.quoteService.createQuote(context, dto);
    return okEnvelope(quote);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.QUOTE_READ)
  async getById(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const quote = await this.quoteService.getQuoteById(context, id);
    return okEnvelope(quote);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.QUOTE_UPDATE)
  async update(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    const quote = await this.quoteService.updateQuote(context, id, dto);
    return okEnvelope(quote);
  }
}
