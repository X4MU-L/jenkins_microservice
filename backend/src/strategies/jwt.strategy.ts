import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UserService } from '../services';
import { UserRepository } from '../repository';
import { UserDocument } from 'src/schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userRepo: UserRepository,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: jwtPayload): Promise<UserDocument> {
    try {
      const user = await this.userRepo.findById(payload.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // Return user info that will be accessible in req.user
      return user;
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
