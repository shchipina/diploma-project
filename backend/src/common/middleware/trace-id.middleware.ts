import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

export const traceStorage = new AsyncLocalStorage<Map<string, unknown>>();

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

    const store = new Map<string, unknown>();
    store.set('traceId', traceId);

    store.set('userId', (req as RequestWithUser).user?.id);
    store.set('requestPath', req.path);
    store.set('requestMethod', req.method);

    res.setHeader('X-Trace-ID', traceId);

    traceStorage.run(store, () => {
      next();
    });
  }
}

export function getTraceId(): string | undefined {
  const store = traceStorage.getStore();

  return store?.get('traceId') as string | undefined;
}

export function getCurrentUserId(): string | undefined {
  const store = traceStorage.getStore();

  return store?.get('userId') as string | undefined;
}

export function getTraceContext(): Record<string, unknown> {
  const store = traceStorage.getStore();
  if (!store) return {};

  const context: Record<string, unknown> = {};

  store.forEach((value, key) => {
    context[key] = value;
  });
  return context;
}
