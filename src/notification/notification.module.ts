import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from './notification.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [NotificationService],
})
export class NotificationModule {}
