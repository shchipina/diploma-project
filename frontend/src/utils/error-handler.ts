import { AxiosError } from 'axios';

export interface ErrorResponse {
  errorId: string;
  errorCode: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  traceId?: string;
}

export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

export function extractErrorResponse(error: unknown): ErrorResponse | null {
  if (!isAxiosError(error)) {
    return null;
  }

  return error.response?.data as ErrorResponse;
}

export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (isAxiosError(error)) {
    const errorResponse = extractErrorResponse(error);
    if (errorResponse?.message) {
      return errorResponse.message;
    }

    if (error.response?.statusText) {
      return error.response.statusText;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getErrorId(error: unknown): string | undefined {
  const errorResponse = extractErrorResponse(error);
  return errorResponse?.errorId;
}

export function getTraceId(error: unknown): string | undefined {
  const errorResponse = extractErrorResponse(error);
  return errorResponse?.traceId;
}

export function formatErrorForUser(error: unknown): {
  message: string;
  errorId?: string;
  traceId?: string;
  canReport: boolean;
} {
  const message = getErrorMessage(error);
  const errorId = getErrorId(error);
  const traceId = getTraceId(error);

  return {
    message,
    errorId,
    traceId,
    canReport: !!errorId,
  };
}

export function isNetworkError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  return (
    !error.response && (error.code === 'ERR_NETWORK' || error.message.includes('Network Error'))
  );
}

export function isTimeoutError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  return error.code === 'ECONNABORTED' || error.message.includes('timeout');
}

export function classifyError(
  error: unknown,
): 'network' | 'timeout' | 'auth' | 'validation' | 'server' | 'unknown' {
  if (isNetworkError(error)) {
    return 'network';
  }

  if (isTimeoutError(error)) {
    return 'timeout';
  }

  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return 'auth';
    }

    if (status && status >= 400 && status < 500) {
      return 'validation';
    }

    if (status && status >= 500) {
      return 'server';
    }
  }

  return 'unknown';
}
