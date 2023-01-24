import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { WebClient, LogLevel } from '@slack/web-api';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  private readonly token = process.env.SLACK_ACCESS_TOKEN;

  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async index() {
    return this.appService.getHello();
  }
}
