// app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule, HealthModule, UserModule } from './modules';
import { configValidationSchema } from './config';
import { LoggerMiddleware } from './middleware';
import { AppLoggerService } from './services';
import { GlobalExceptionFilter } from './filters/global-exception.filters';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    // Configure MongoDB connection globally
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost/nest',
      }),
      inject: [ConfigService],
    }),

    // Config module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      validationSchema: configValidationSchema,
    }),

    // Feature modules
    AuthModule,
    UserModule,
    HealthModule,
  ],
  providers: [
    AppLoggerService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
