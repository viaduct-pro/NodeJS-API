import { Controller, Post, Get, UseGuards, Param, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/callback')
  async getAuth0Callback(@Req() request) {
    try {
      if (request?.user) {
        return this.userService.createFromAuth0Request(request);
      }
    } catch (err) {
      return err.message;
    }
  }

  @Post('/refresh')
  async refresh(): Promise<any> {
    return await this.authService.refresh();
  }

  @Get('/forgot-password/:email')
  @ApiExcludeEndpoint()
  public async sendEmailForgotPassword(@Param() params): Promise<any> {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(
        params.email,
      );
      return isEmailSent;
    } catch (error) {
      return error.message;
    }
  }
}
