import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
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
import { ApproveQuoteDto } from './dto/approve-quote.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ListQuotesQueryDto } from './dto/list-quotes-query.dto';
import { SendQuoteDto } from './dto/send-quote.dto';
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

  @Post(':id/send')
  @RequirePermissions(PERMISSIONS.QUOTE_SEND)
  async send(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendQuoteDto,
  ) {
    const quote = await this.quoteService.sendQuote(context, id, dto);
    return okEnvelope(quote);
  }

  @Post(':id/approve')
  @RequirePermissions(PERMISSIONS.QUOTE_APPROVE)
  async approve(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveQuoteDto,
  ) {
    const quote = await this.quoteService.approveQuote(context, id, dto);
    return okEnvelope(quote);
  }

  @Get(':id/pdf')
  @RequirePermissions(PERMISSIONS.QUOTE_PDF_GENERATE)
  @Header('Content-Type', 'application/pdf')
  async generatePdf(
    @TenantContextParam() context: RequestTenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const { buffer, fileName } = await this.quoteService.generateQuotePdf(context, id);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
    });
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
