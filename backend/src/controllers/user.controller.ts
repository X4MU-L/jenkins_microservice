// controllers/user.controller.ts
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from '../services';
import { JwtAuthGuard, RoleGuard } from '../guards';
import { Roles } from '../decorators';
import { UserRoleEnum } from '../types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: CustomRequest) {
    return this.userService.findUserId(String(req?.user?._id));
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findUserId(id);
  }
}
