import { Controller, Get, Post, Body, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Public } from '@modules/auth/decorators/public.decorator';

interface WebVitalDto {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  @Post('web-vitals')
  @Public()
  recordWebVitals(@Body() vital: WebVitalDto): { success: boolean } {
    console.log('[Web Vitals]', {
      metric: vital.name,
      value: vital.value,
      rating: vital.rating,
      url: vital.url,
    });

    return { success: true };
  }
}
