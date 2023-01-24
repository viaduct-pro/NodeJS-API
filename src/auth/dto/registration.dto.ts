import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegistrationDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  @IsOptional()
  readonly refreshToken?: string;

  @IsNumber()
  @IsOptional()
  readonly roleId?: number;
}
