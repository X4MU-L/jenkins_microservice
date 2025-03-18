import { ExecutionContext } from '@nestjs/common';

export const mockExecutionContext = {
  getHandler: jest.fn(),
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn(),
} as unknown as ExecutionContext;

