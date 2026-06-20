import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { getAppDatabaseUrlFromEnv } from '@crm-os/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    const appUrl =
      config.get<string>('DATABASE_APP_URL') ?? getAppDatabaseUrlFromEnv(process.env);
    super({ datasources: { db: { url: appUrl } } });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
