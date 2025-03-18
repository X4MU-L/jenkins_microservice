// modules/user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers';
import { UserService } from '../services';
import { UserSchema, User } from '../schema/user.schema';
import { UserRepository } from '../repository';
import { AuthStrategyModule } from './auth-strategy.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthStrategyModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [
    UserService,
    UserRepository,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UserModule {}
