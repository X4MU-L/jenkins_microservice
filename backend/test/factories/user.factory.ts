import { User } from '../../src/schema/user.schema';
import { UserRoleEnum } from '../../src/types';
import mongoose from 'mongoose';

export function createMockUser(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Test User',
    email: 'test@example.com',
    roles: [UserRoleEnum.USER],
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockAdmin(overrides = {}) {
  return createMockUser({
    name: 'Admin User',
    email: 'admin@example.com',
    roles: [UserRoleEnum.ADMIN],
    ...overrides,
  });
}

export function createMockUserDocument(overrides = {}, resolve = true) {
  const userData = createMockUser(overrides);

  return {
    ...userData,
    toObject: jest.fn().mockReturnValue({
      ...userData,
    }),
    comparePassword: jest.fn().mockResolvedValue(resolve),
  };
}

export const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByEmailWithPassword: jest.fn(),
};

export const mockUserModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  exec: jest.fn(),
  select: jest.fn().mockReturnThis(),
};

export const mockUserService = {
  findUserId: jest.fn(),
};
