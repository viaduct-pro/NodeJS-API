import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly newPassword: string;

  @IsString()
  readonly newPasswordToken: string;

  @IsString()
  readonly currentPassword: string;
}
