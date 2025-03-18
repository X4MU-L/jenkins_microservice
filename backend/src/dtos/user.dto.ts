import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRoleEnum } from '../types';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsStrongPassword()
  password: string;
  @IsOptional()
  @IsArray()
  @IsEnum(UserRoleEnum, { each: true })
  roles?: UserRoleEnum[];
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsStrongPassword()
  password: string;
  @IsOptional()
  @IsString()
  roles: string;
}
