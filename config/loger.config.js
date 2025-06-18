/* eslint-disable no-shadow */
// logger.js
import path from 'path';
import { createLogger, format, transports } from 'winston';

// Calculate __dirname in ES modules
const logPath = path.join(process.cwd(), 'logs');

// Winston format destructuring
const { combine, timestamp, printf, errors, colorize, json } = format;

const devFormat = printf(
  ({ level, message, timestamp, stack }) =>
    `${timestamp} ${level}: ${stack || message}`
);

// Create logger
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'app-service' },
  transports: [
    new transports.File({
      filename: path.join(logPath, 'error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(logPath, 'combined.log'),
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logPath, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(logPath, 'rejections.log'),
    }),
  ],
});

// If not in production, add colored console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
    })
  );
}

// Export
export default logger;
