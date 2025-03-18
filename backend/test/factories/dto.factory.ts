// test/factories/dto.factory.ts
import { CreateUserDto } from '../../src/dtos/user.dto';

export function createMockUserDto(overrides = {}): CreateUserDto {
  return {
    name: 'Test User',
    email: 'test@example.com',
    password: 'StrongPassword123!',
    ...overrides,
  };
}
