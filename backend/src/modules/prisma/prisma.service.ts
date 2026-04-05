import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger?.log?.('Database connected successfully', 'PrismaService');
    } catch (error) {
      this.logger?.error?.(
        'Failed to connect to database',
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        'PrismaService',
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger?.log?.('Database disconnected', 'PrismaService');
  }
}
