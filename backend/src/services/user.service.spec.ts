// 2. USER SERVICE TESTS
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '../repository';

import {
  createMockUser,
  createMockUserDocument,
  createMockUserDto,
  mockUserRepository,
} from '../../test/factories';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUser = createMockUser({
    _id: 'user-id',
    comparePassword: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto = createMockUserDto();

    it('should create a user if email is not taken', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email is already in use', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'Password123!';

    it('should return user if credentials are valid', async () => {
      const userWithPassword = createMockUserDocument({
        email,
        password,
        comparePassword: jest.fn().mockResolvedValue(true),
      });
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(
        userWithPassword,
      );

      const result = await service.validateUser(email, password);

      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        email,
      );
      expect(userWithPassword.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toEqual(userWithPassword);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const userWithPassword = createMockUserDocument(
        {
          email,
          password: 'InvalidPassword123!',
        },
        false,
      );
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(
        userWithPassword,
      );

      await expect(service.validateUser(email, password)).rejects.toThrow(
        BadRequestException,
      );
      expect(userWithPassword.comparePassword).toHaveBeenCalledWith(password);
    });
  });

  describe('findUserByEmail', () => {
    const email = 'test@example.com';

    it('should return user if found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findUserByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findUserId', () => {
    const id = 'user-id';

    it('should return user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findUserId(id);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findUserId(id)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
