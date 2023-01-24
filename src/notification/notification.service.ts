import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { find } from 'rxjs/operators';
import { type } from 'os';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addNotification(title, message, user, owner, team) {
    const newNotification = new Notification();
    newNotification.user = user;
    newNotification.type = 'notification';
    newNotification.owner = owner;
    newNotification.title = title;
    newNotification.message = message;
    newNotification.team = team;
    newNotification.status = 'active';
    return await this.notificationRepository.save(newNotification);
  }

  async disableNotification(id) {
    const notification = await this.notificationRepository.findOne(id);
    notification.status = 'disabled';
    return await this.notificationRepository.save(notification);
  }

  async disableAllNotifications(teamId, request) {
    const findUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });
    const notifications = await this.notificationRepository.find({
      where: {
        user: findUser,
        team: {
          id: teamId,
        },
        type: 'notification',
      },
      relations: ['user', 'team'],
    });
    for (const notification of notifications) {
      notification.status = 'disabled';
      await this.notificationRepository.save(notification);
    }
    return true;
  }

  async getUserNotifications(teamId, request) {
    const findUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });
    const notifications = await this.notificationRepository.find({
      relations: ['user', 'owner', 'team'],
      where: {
        user: findUser,
        type: 'notification',
        status: 'active',
        team: { id: teamId },
      },
      order: { id: 'DESC' },
    });
    return notifications;
  }

  async getRecommendedActions(teamId, request) {
    const findUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });

    const recommendedActions = await this.notificationRepository.find({
      relations: ['user', 'owner', 'team'],
      where: {
        user: findUser,
        type: 'action',
        status: 'active',
        team: { id: teamId },
      },
      order: { id: 'DESC' },
    });

    return recommendedActions;
  }

  async disableRecommendedAction(id) {
    const recommendedAction = await this.notificationRepository.findOne(id);
    recommendedAction.status = 'disabled';
    return await this.notificationRepository.save(recommendedAction);
  }
}
