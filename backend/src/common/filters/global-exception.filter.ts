import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { I18nContext } from 'nestjs-i18n';
import { AppException } from '../exceptions';

interface ExceptionResponse {
  errorCode?: string;
  message?: string | string[];
  error?: string;
  context?: Record<string, unknown>;
}

interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

/**
 * Global Exception Filter
 *
 * Перехоплює всі винятки в застосунку та:
 * 1. Генерує унікальний errorId для кожної помилки
 * 2. Логує помилку з повним контекстом та stack trace
 * 3. Повертає структуровану відповідь клієнту
 * 4. Включає traceId для наскрізного відстеження
 * 5. Повертає локалізовані повідомлення про помилки
 *
 * Структура відповіді:
 * {
 *   errorId: string,      // Унікальний ідентифікатор помилки (для звернення до підтримки)
 *   errorCode: string,    // Код помилки (для програмної обробки)
 *   message: string,      // Повідомлення про помилку (локалізоване)
 *   statusCode: number,   // HTTP статус код
 *   timestamp: string,    // Час виникнення помилки
 *   path: string,         // URL запиту
 *   traceId?: string,     // ID для трасування запиту через систему
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const i18n = I18nContext.current(host);

    const errorId = uuidv4();

    const traceId = request.headers['x-trace-id'] as string;

    let status: HttpStatus;
    let errorCode: string;
    let message: string;
    let context: Record<string, unknown> | undefined;
    let stack: string | undefined;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      errorCode = exceptionResponse.errorCode || 'UNKNOWN_ERROR';
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : exceptionResponse.message || exception.message;
      context = exceptionResponse.context;
      stack = exception.stack;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      errorCode = exceptionResponse.error || 'HTTP_EXCEPTION';
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : exceptionResponse.message || exception.message;
      stack = exception.stack;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      message = exception.message || 'An unexpected error occurred';
      stack = exception.stack;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'UNKNOWN_ERROR';
      message = 'An unexpected error occurred';
      stack = String(exception);
    }

    const localizedMessage =
      i18n?.translate(`errors.${errorCode}`, {
        defaultValue: message,
      }) || message;

    const logContext = {
      errorId,
      traceId,
      errorCode,
      statusCode: status,
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as RequestWithUser).user?.id,
      timestamp: new Date().toISOString(),
      context,
      stack,
      language: i18n?.lang || 'en',
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${errorId}] ${message}`, JSON.stringify(logContext));
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(`[${errorId}] ${message}`, JSON.stringify(logContext));
    } else {
      this.logger.log(`[${errorId}] ${message}`, JSON.stringify(logContext));
    }

    const errorResponse = {
      errorId,
      errorCode,
      message: localizedMessage,
      technicalMessage: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(traceId && { traceId }),
    };

    response.status(status).json(errorResponse);
  }
}
