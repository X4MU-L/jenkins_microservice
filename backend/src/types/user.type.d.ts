import { UserRoleEnum } from './enums';

declare global {
  type UserRole = UserRoleEnum;
}

export {};
