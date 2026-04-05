import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully', 'RedisService');
    });

    this.client.on('error', (err) => {
      this.logger.error(
        'Redis connection error',
        JSON.stringify({ error: err.message }),
        'RedisService',
      );
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis disconnected', 'RedisService');
  }

  async saveRefreshToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.client.setex(key, ttlSeconds, token);
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const key = `refresh_token:${userId}`;
    const storedToken = await this.client.get(key);
    return storedToken === token;
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.client.del(key);
  }

  async cacheUserByEmail(
    email: string,
    userData: import('@prisma/client').User,
    ttlSeconds: number = 300,
  ): Promise<void> {
    const key = `user:email:${email}`;
    await this.client.setex(key, ttlSeconds, JSON.stringify(userData));
  }

  async getCachedUserByEmail(
    email: string,
  ): Promise<import('@prisma/client').User | null> {
    const key = `user:email:${email}`;
    const cached = await this.client.get(key);
    return cached
      ? (JSON.parse(cached) as import('@prisma/client').User)
      : null;
  }

  async invalidateUserCache(email: string): Promise<void> {
    const key = `user:email:${email}`;
    await this.client.del(key);
  }

  async cacheUserById(
    userId: string,
    userData: import('@prisma/client').User,
    ttlSeconds: number = 300,
  ): Promise<void> {
    const key = `user:id:${userId}`;
    await this.client.setex(key, ttlSeconds, JSON.stringify(userData));
  }

  async getCachedUserById(
    userId: string,
  ): Promise<import('@prisma/client').User | null> {
    const key = `user:id:${userId}`;
    const cached = await this.client.get(key);
    return cached
      ? (JSON.parse(cached) as import('@prisma/client').User)
      : null;
  }

  getClient(): Redis {
    return this.client;
  }
}
