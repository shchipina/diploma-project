import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method } = req;
    const route = this.normalizeRoute(req.originalUrl);

    this.metricsService.incrementActiveRequests(method, route);

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      this.metricsService.recordHttpRequest(
        method,
        route,
        statusCode,
        duration,
      );

      this.metricsService.decrementActiveRequests(method, route);
    });

    next();
  }

  private normalizeRoute(url: string): string {
    const urlWithoutQuery = url.split('?')[0];

    return urlWithoutQuery
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:id',
      )
      .replace(/\/\d+/g, '/:id');
  }
}
