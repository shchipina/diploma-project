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
  private queryCount = 0;
  private slowQueryThreshold = 100; // ms

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.setupQueryLogging();
  }

  private setupQueryLogging() {
    this.$on(
      'query',
      (e: {
        query: string;
        params: string;
        duration: number | string;
        target?: string;
      }) => {
        const duration = Number(e.duration);
        this.queryCount++;

        if (duration > this.slowQueryThreshold) {
          this.logger?.warn?.(
            `Slow query detected (${duration}ms)`,
            JSON.stringify({
              query: e.query,
              params: e.params,
              duration: `${duration}ms`,
              target: e.target,
            }),
            'PrismaService',
          );
        }

        if (process.env.LOG_LEVEL === 'debug') {
          this.logger?.debug?.(
            `Query executed in ${duration}ms`,
            JSON.stringify({
              query: e.query.substring(0, 100),
              duration: `${duration}ms`,
            }),
            'PrismaService',
          );
        }
      },
    );

    this.$on('error', (e: { message: string; target?: string }) => {
      this.logger?.error?.(
        'Prisma error',
        JSON.stringify({
          message: e.message,
          target: e.target,
        }),
        'PrismaService',
      );
    });
  }

  getQueryCount(): number {
    return this.queryCount;
  }

  resetQueryCount(): void {
    this.queryCount = 0;
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
