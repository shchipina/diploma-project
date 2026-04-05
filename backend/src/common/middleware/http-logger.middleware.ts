import {
  Injectable,
  NestMiddleware,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getTraceId } from './trace-id.middleware';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

interface PerformanceMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: string;
  responseTimeMs: number;
  ip: string;
  userAgent: string;
  traceId: string | undefined;
  userId: string | undefined;
  memoryUsage?: {
    heapUsed: string;
    heapTotal: string;
    external: string;
    rss: string;
  };
  contentLength?: number;
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      const traceId = getTraceId();
      const userId = (req as RequestWithUser).user?.id;

      const contentLength = res.get('content-length');

      const logData: PerformanceMetrics = {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        responseTimeMs: responseTime,
        ip,
        userAgent,
        traceId,
        userId,
        contentLength: contentLength ? parseInt(contentLength, 10) : undefined,
      };

      if (responseTime > 1000 || process.env.LOG_LEVEL === 'debug') {
        logData.memoryUsage = {
          heapUsed: `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(endMemory.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(endMemory.external / 1024 / 1024)}MB`,
          rss: `${Math.round(endMemory.rss / 1024 / 1024)}MB`,
        };
      }

      if (statusCode >= 500) {
        this.logger.error(
          `HTTP ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
          JSON.stringify(logData),
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `HTTP ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
          JSON.stringify(logData),
        );
      } else if (responseTime > 1000) {
        this.logger.warn(
          `Slow response: HTTP ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
          JSON.stringify(logData),
        );
      } else {
        this.logger.log(
          `HTTP ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
          JSON.stringify(logData),
          'HTTP',
        );
      }
    });

    next();
  }
}
