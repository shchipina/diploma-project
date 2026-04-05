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
      const traceId = getTraceId();

      const userId = (req as RequestWithUser).user?.id;

      const logData = {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent,
        traceId,
        userId,
      };

      if (statusCode >= 500) {
        this.logger.error(
          `HTTP ${method} ${originalUrl} ${statusCode}`,
          JSON.stringify(logData),
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `HTTP ${method} ${originalUrl} ${statusCode}`,
          JSON.stringify(logData),
        );
      } else {
        this.logger.log(
          `HTTP ${method} ${originalUrl} ${statusCode}`,
          JSON.stringify(logData),
          'HTTP',
        );
      }
    });

    next();
  }
}
