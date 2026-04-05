import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;

  public readonly httpRequestsTotal: Counter;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestsActive: Gauge;

  public readonly cacheHitsTotal: Counter;
  public readonly cacheMissesTotal: Counter;

  public readonly dbQueryDuration: Histogram;
  public readonly dbQueriesTotal: Counter;

  public readonly userRegistrations: Counter;
  public readonly userLogins: Counter;

  constructor() {
    this.registry = new Registry();

    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestsActive = new Gauge({
      name: 'http_requests_active',
      help: 'Number of active HTTP requests',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });

    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_key'],
      registers: [this.registry],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_key'],
      registers: [this.registry],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'model'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.dbQueriesTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'model'],
      registers: [this.registry],
    });

    this.userRegistrations = new Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      registers: [this.registry],
    });

    this.userLogins = new Counter({
      name: 'user_logins_total',
      help: 'Total number of successful user logins',
      registers: [this.registry],
    });
  }

  onModuleInit() {}

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestsTotal.inc({ method, route, status: statusCode });
    this.httpRequestDuration.observe(
      { method, route, status: statusCode },
      duration / 1000,
    );
  }

  incrementActiveRequests(method: string, route: string) {
    this.httpRequestsActive.inc({ method, route });
  }

  decrementActiveRequests(method: string, route: string) {
    this.httpRequestsActive.dec({ method, route });
  }

  recordCacheHit(cacheKey: string) {
    this.cacheHitsTotal.inc({ cache_key: cacheKey });
  }

  recordCacheMiss(cacheKey: string) {
    this.cacheMissesTotal.inc({ cache_key: cacheKey });
  }

  recordDbQuery(operation: string, model: string, duration: number) {
    this.dbQueriesTotal.inc({ operation, model });
    this.dbQueryDuration.observe({ operation, model }, duration / 1000);
  }

  recordUserRegistration() {
    this.userRegistrations.inc();
  }

  recordUserLogin() {
    this.userLogins.inc();
  }
}
