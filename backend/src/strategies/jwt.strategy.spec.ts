// jwt.strategy.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../repository';

import { createMockUser, mockUserRepository } from '../../test/factories';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: UserRepository;

  const mockUser = createMockUser();

  beforeEach(async () => {
    // Set environment variable to override app's MongoDB connection
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'JWT_SECRET') {
          return 'test-secret';
        }
        // Return default values for other config keys as needed
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user if token payload is valid', async () => {
      const payload = { id: 'user-id', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload = { id: 'nonexistent-id', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.id);
    });

    it('should throw UnauthorizedException if repository throws an error', async () => {
      const payload = { id: 'user-id', email: 'test@example.com' };
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.id);
    });
  });
});
