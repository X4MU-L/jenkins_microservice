import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppLoggerService } from '../services';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<CustomRequest>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };
    this.logger.error(
      `HTTP ${status} - ${JSON.stringify(message)} - ${request.method} ${request.url}`,
    );

    response.status(status).json({
      statusCode: status,
      ...(message instanceof Object ? message : { message }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
