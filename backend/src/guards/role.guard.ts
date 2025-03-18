import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    console.log(requiredRoles, 'requiredRoles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<CustomRequest>();
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
