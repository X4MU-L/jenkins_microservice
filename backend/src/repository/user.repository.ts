// src/user/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema';
import { CreateUserDto } from '../dtos';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: CreateUserDto) {
    const user = await this.userModel.create(userData);
    return user.toObject({
      versionKey: false,
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    });
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('-password').exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }
  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select('+password').exec();
  }
}
