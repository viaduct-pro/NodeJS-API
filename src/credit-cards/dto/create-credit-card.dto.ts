import { IsOptional, IsString } from 'class-validator';

export class CreateCreditCardDto {
  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  readonly address: string;

  @IsString()
  readonly city: string;

  @IsString()
  readonly state: string;

  @IsString()
  readonly zipCode: string;

  @IsString()
  readonly last4: string;

  @IsString()
  readonly expiration: string;

  @IsString()
  @IsOptional()
  readonly cardToken?: string;
}
