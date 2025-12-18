import winston from 'winston';
import { Config } from '../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// -- Log Format --
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),

  Config.IS_PRODUCTION
    ? winston.format.uncolorize()
    : winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// -- Transports --
const transports = [
  new winston.transports.Console({
    level: Config.IS_PRODUCTION ? 'http' : 'debug',
  }),

  // In production file logs
  ...(Config.IS_PRODUCTION
    ? [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/all.log',
          level: 'http',
        }),
      ]
    : []),
];

const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports,
});

export default logger;
