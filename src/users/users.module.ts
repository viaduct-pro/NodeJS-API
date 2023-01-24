import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { RecoveryPassword } from '../entities/recovery-password.entity';
import DefaultAdminSite from 'nestjs-admin/dist/src/adminCore/adminSite';
import { DefaultAdminModule } from 'nestjs-admin';
import { UserNotice } from '../entities/user-notice.entity';
import { Interest } from '../entities/interest.entity';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../entities/notification.entity';
import { TeamService } from '../team/team.service';
import { Team } from '../entities/team.entity';
import { DropIn } from '../entities/drop-in.entity';
import { Invite } from '../entities/invite.entity';
import { SlackProfile } from 'src/entities/slack-profile.entity';
import { Organization } from 'src/entities/organization.entity';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { MulterExtendedModule } from 'nestjs-multer-extended';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      RecoveryPassword,
      UserNotice,
      Interest,
      Notification,
      Team,
      DropIn,
      Invite,
      SlackProfile,
      Organization,
    ]),

    MulterExtendedModule.register({
      awsConfig: {
        // ... any options you want to pass to the AWS instance
        region: 'us-east-1',
      },
      s3Config: {
        // Only set this in dev to use localstack, should be undefined in other environments
        endpoint: process.env.S3_DEV_ENDPOINT,
      },
      bucket: process.env.S3_BUCKET,
      basePath: 'upload',
      fileSize: 100 * 1024 * 1024,
    }),
    DefaultAdminModule,
  ],
  controllers: [UserController],
  providers: [
    UsersService,
    NotificationService,
    TeamService,
    OrganizationsService,
  ],
  exports: [UsersService],
})
export class UsersModule {
  constructor(private readonly adminSite: DefaultAdminSite) {
    // Register the User entity under the "User" section
    adminSite.register('User', User);
  }
}
