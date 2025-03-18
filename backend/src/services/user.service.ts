// services/user.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from '../dtos/user.dto';
import { UserRepository } from '../repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: CreateUserDto) {
    // Check if user with this email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    return this.userRepository.create(userData);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Compare password using model method
    const isPasswordValid = await user.comparePassword(password);
    console.log(isPasswordValid, 'isPasswordValid');
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findUserId(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
