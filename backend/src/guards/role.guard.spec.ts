// role.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { UserRoleEnum } from '../types';
import { ROLES_KEY } from '../decorators';
import { mockExecutionContext } from '../../test/factories';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(null);

    const result = guard.canActivate(mockExecutionContext);

    expect(reflector.get).toHaveBeenCalledWith(
      ROLES_KEY,
      mockExecutionContext.getHandler(),
    );
    expect(result).toBe(true);
  });

  it('should return true if user has required role', () => {
    const mockRequest = {
      user: {
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.USER],
      },
    };

    jest.spyOn(reflector, 'get').mockReturnValue([UserRoleEnum.ADMIN]);
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as any);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });

  it('should return false if user does not have required role', () => {
    const mockRequest = {
      user: {
        roles: [UserRoleEnum.USER],
      },
    };

    jest.spyOn(reflector, 'get').mockReturnValue([UserRoleEnum.ADMIN]);
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as any);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);
  });

  it('should return false if user has no roles', () => {
    const mockRequest = {
      user: {
        roles: [],
      },
    };

    jest.spyOn(reflector, 'get').mockReturnValue([UserRoleEnum.ADMIN]);
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as any);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);
  });
});
