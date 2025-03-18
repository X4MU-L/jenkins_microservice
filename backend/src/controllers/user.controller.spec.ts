// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services';
import { JwtAuthGuard, RoleGuard } from '../guards';
import { UserRoleEnum } from '../types';
import {
  createMockUser,
  mockUserService,
  createRequest,
} from '../../test/factories';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser = createMockUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return the user profile based on JWT token', async () => {
      mockUserService.findUserId.mockResolvedValue(mockUser);
      const req = createRequest({
        _id: 'user-id',
      });

      const result = await controller.getProfile(req);

      expect(mockUserService.findUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should return user by id when called by admin', async () => {
      const userId = 'user-id';
      mockUserService.findUserId.mockResolvedValue(mockUser);

      const result = await controller.getUserById(userId);

      expect(mockUserService.findUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });
});
