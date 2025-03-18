import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({
            timestamp,
            level,
            message,
          }: {
            timestamp: string;
            level: string;
            message: string;
          }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
          },
        ),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.resolve('logs', 'app.log'),
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} - ${trace || ''}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}
