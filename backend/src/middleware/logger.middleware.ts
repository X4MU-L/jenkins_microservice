// src/logger/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logStream = fs.createWriteStream(
    path.resolve('logs', 'requests.log'),
    { flags: 'a' },
  );

  use(req: Request, res: Response, next: NextFunction) {
    morgan('combined', { stream: this.logStream })(req, res, next);
  }
}
