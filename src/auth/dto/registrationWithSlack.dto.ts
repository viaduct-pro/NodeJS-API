import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegistrationWithSlackDto {
  @IsString()
  @IsEmail()
  readonly access_token: string;

  @IsString()
  readonly bot_user_id: string;

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
