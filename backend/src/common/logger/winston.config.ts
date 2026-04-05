import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import {
  getTraceId,
  getCurrentUserId,
} from '../middleware/trace-id.middleware';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV !== 'production';

const addTraceContext = winston.format((info) => {
  const traceId = getTraceId();
  const userId = getCurrentUserId();

  if (traceId) {
    info.traceId = traceId;
  }
  if (userId) {
    info.userId = userId;
  }

  return info;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('SkillShare', {
    colors: true,
    prettyPrint: true,
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  addTraceContext(),
  winston.format.json(),
);

const consoleTransport = new winston.transports.Console({
  format: isDevelopment ? consoleFormat : fileFormat,
});

const combinedFileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

const errorFileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: fileFormat,
});

const httpFileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: 'http-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'http',
  format: fileFormat,
});

export const winstonConfig = {
  level: logLevel,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  transports: [
    consoleTransport,
    combinedFileTransport,
    errorFileTransport,
    httpFileTransport,
  ],
};
