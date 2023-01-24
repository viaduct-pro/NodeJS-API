import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UsersModule} from '../users/users.module';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {AuthController} from './auth.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../entities/user.entity';
import {Role} from '../entities/role.entity';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.API_KEY,
        signOptions: { expiresIn: '1800s' },
      }),
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
