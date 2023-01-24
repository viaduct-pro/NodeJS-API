import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RecoveryPassword } from '../entities/recovery-password.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    @InjectRepository(RecoveryPassword)
    private usersService: UsersService,
    private httpService: HttpService,
  ) {}

  async refresh(): Promise<any> {
    return {
      access_token: '',
      refresh_token: '',
    };
  }

  async sendEmailForgotPassword(email: string): Promise<any> {
    const userFromDb = await this.usersService.findOne({ email: email });

    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    return this.httpService.post(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        connection: 'Username-Password-Authentication',
      },
    );
  }
}
