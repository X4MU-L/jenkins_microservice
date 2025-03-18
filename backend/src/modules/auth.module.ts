// modules/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from '../controllers';
import { AuthService } from '../services';
import { UserModule } from './user.module';
import { AuthStrategyModule } from './auth-strategy.module';

@Module({
  imports: [UserModule, AuthStrategyModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
