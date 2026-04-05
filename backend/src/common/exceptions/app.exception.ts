import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly context?: Record<string, any>,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(
      {
        errorCode,
        message,
        context,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

export class ValidationException extends AppException {
  constructor(message: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', message, context, HttpStatus.BAD_REQUEST);
  }
}

export class AuthenticationException extends AppException {
  constructor(message: string, context?: Record<string, any>) {
    super('AUTH_ERROR', message, context, HttpStatus.UNAUTHORIZED);
  }
}

export class AuthorizationException extends AppException {
  constructor(message: string, context?: Record<string, any>) {
    super('AUTHORIZATION_ERROR', message, context, HttpStatus.FORBIDDEN);
  }
}

export class BusinessLogicException extends AppException {
  constructor(message: string, context?: Record<string, any>) {
    super('BUSINESS_ERROR', message, context, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(
    resource: string,
    identifier?: string | number,
    context?: Record<string, any>,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super('NOT_FOUND', message, context, HttpStatus.NOT_FOUND);
  }
}

export class ConflictException extends AppException {
  constructor(message: string, context?: Record<string, any>) {
    super('CONFLICT_ERROR', message, context, HttpStatus.CONFLICT);
  }
}

export class InternalServerException extends AppException {
  constructor(
    message: string = 'Internal server error',
    context?: Record<string, any>,
  ) {
    super(
      'INTERNAL_SERVER_ERROR',
      message,
      context,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
