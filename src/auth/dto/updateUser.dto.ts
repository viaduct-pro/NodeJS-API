import { PartialType } from '@nestjs/mapped-types';
import { RegistrationDto } from './registration.dto';

export class updateUserDto extends PartialType(RegistrationDto) {}
