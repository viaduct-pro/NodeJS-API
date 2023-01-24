import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('interests-usage/:teamId')
  async getInterestsUsage(
    @Param('teamId') teamId: string,
    @Req() request: Request,
  ) {
    return await this.dashboardService.getInterestsUsage(request, teamId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('dropins-count')
  async getUserDropInsCount(@Req() request: Request) {
    return await this.dashboardService.getDropInsCount(request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('drop-ins-by-dates')
  async getDropInsByDate(@Req() request: Request) {
    return await this.dashboardService.getDropInsWithFilter(request);
  }
}
