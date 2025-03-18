import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap Logger');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Apply global pipes and other middleware
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for development
  if (configService.get<string>('NODE_ENV') === 'development') {
    app.enableCors();
  }

  // Signal handlers for graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];

  for (const signal of signals) {
    process.on(signal, () => {
      (async () => {
        try {
          logger.log(`Received ${signal} signal - Starting graceful shutdown`);

          // Close NestJS application
          await app.close();
          logger.log('Application closed successfully');

          // Exit process
          process.exit(0);
        } catch (err) {
          logger.error('Error during graceful shutdown', err);
          process.exit(1);
        }
      })().catch((err) => {
        logger.error('Error during signal handling', err);
        process.exit(1);
      });
    });
  }

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
