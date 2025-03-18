import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(userData: LoginDto) {
    const user = await this.userService.validateUser(
      userData.email,
      userData.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: jwtPayload = {
      email: user.email,
      id: user._id as string,
      roles: user.roles,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
