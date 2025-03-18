import { JwtService } from '@nestjs/jwt';
import { createMockUser } from './user.factory';

export function createMockJwtToken(user = createMockUser()) {
  const jwtService = new JwtService({
    secret: 'test-secret',
  });

  return jwtService.sign({
    id: user._id,
    email: user.email,
    roles: user.roles,
  });
}

export function createMockAuthRequest(user = createMockUser()) {
  return {
    user: user,
  };
}
