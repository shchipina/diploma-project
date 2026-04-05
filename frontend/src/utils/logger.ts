import log from 'loglevel';
import { nanoid } from 'nanoid';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

const logLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
log.setLevel(logLevel);

const SESSION_TRACE_ID_KEY = 'session-trace-id';

export function getSessionTraceId(): string {
  let traceId = sessionStorage.getItem(SESSION_TRACE_ID_KEY);
  if (!traceId) {
    traceId = nanoid();
    sessionStorage.setItem(SESSION_TRACE_ID_KEY, traceId);
  }
  return traceId;
}

export function generateTraceId(): string {
  return nanoid();
}

function formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const traceId = getSessionTraceId();

  const logObject = {
    timestamp,
    level,
    message,
    traceId,
    ...context,
  };

  return JSON.stringify(logObject);
}

export const logger = {
  trace(message: string, context?: Record<string, unknown>) {
    log.trace(formatMessage('TRACE', message, context));
  },

  debug(message: string, context?: Record<string, unknown>) {
    log.debug(formatMessage('DEBUG', message, context));
  },

  info(message: string, context?: Record<string, unknown>) {
    log.info(formatMessage('INFO', message, context));
  },

  warn(message: string, context?: Record<string, unknown>) {
    log.warn(formatMessage('WARN', message, context));
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };

    log.error(formatMessage('ERROR', message, errorContext));
  },

  setLevel(level: LogLevel) {
    log.setLevel(level);
  },

  getLevel(): LogLevel {
    return log.getLevel() as unknown as LogLevel;
  },
};

async function sendErrorToBackend(
  message: string,
  error: Error | unknown,
  context?: Record<string, unknown>,
) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      traceId: getSessionTraceId(),
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : String(error),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.debug('Error logged to backend:', payload);
  } catch (err) {
    console.error('Failed to send error to backend:', err);
  }
}

export default logger;
