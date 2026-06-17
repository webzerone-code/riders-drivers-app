import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNumberString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(['rider', 'driver'])
  userType?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'phone'] as const),
) {}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class TokenUserDto {
  id: string;
  email: string;
  phone: string;
  access_token: string;
}

export class UserResponseDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phone: string;
  @Expose()
  userType: string;
  @Expose()
  onLine: boolean;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
