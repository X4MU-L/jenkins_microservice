// user.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from './user.repository';
import { User, UserDocument } from '../schema';
import { CreateUserDto } from '../dtos';
import { UserRoleEnum } from '../types';
// In user.service.spec.ts
import {
  createMockUser,
  createMockUserDocument,
  createMockUserDto,
  mockUserModel,
} from '../../test/factories';

describe('UserRepository', () => {
  let repository: UserRepository;
  let model: Model<UserDocument>;
  const data = createMockUser();
  const mockUser = createMockUserDocument(data);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and return it without password', async () => {
      const createUserDto = createMockUserDto();

      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await repository.create(createUserDto);

      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUser.toObject).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(data);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email without password', async () => {
      const email = 'test@example.com';
      mockUserModel.findOne.mockReturnValue(mockUserModel);
      mockUserModel.exec.mockResolvedValue(mockUser);

      const result = await repository.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockUserModel.select).toHaveBeenCalledWith('-password');
      expect(mockUserModel.exec).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      const email = 'nonexistent@example.com';
      mockUserModel.findOne.mockReturnValue(mockUserModel);
      mockUserModel.exec.mockResolvedValue(null);

      const result = await repository.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by ID without password', async () => {
      const id = 'some-id';
      mockUserModel.findById.mockReturnValue(mockUserModel);
      mockUserModel.exec.mockResolvedValue(mockUser);

      const result = await repository.findById(id);

      expect(mockUserModel.findById).toHaveBeenCalledWith(id);
      expect(mockUserModel.select).toHaveBeenCalledWith('-password');
      expect(mockUserModel.exec).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      const id = 'nonexistent-id';
      mockUserModel.findById.mockReturnValue(mockUserModel);
      mockUserModel.exec.mockResolvedValue(null);

      const result = await repository.findById(id);

      expect(mockUserModel.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should find a user by email with password included', async () => {
      const email = 'test@example.com';
      mockUserModel.findOne.mockReturnValue(mockUserModel);
      mockUserModel.exec.mockResolvedValue(mockUser);

      const result = await repository.findByEmailWithPassword(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockUserModel.select).toHaveBeenCalledWith('+password');
      expect(mockUserModel.exec).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
});
