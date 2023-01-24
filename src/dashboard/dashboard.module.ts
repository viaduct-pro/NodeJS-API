import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Interest } from '../entities/interest.entity';
import { DropIn } from '../entities/drop-in.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Interest, DropIn])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
