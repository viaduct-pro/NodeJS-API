import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { SlackProfileModule } from './slack-profile/slack-profile.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { DefaultAdminModule } from 'nestjs-admin';
import { roles } from './app.roles';
import { AccessControlModule } from 'nest-access-control';
import { TeamModule } from './team/team.module';
import { DropInModule } from './drop-in/drop-in.module';
import { InterestsModule } from './interests/interests.module';
import { MulterModule } from '@nestjs/platform-express';
import { DashboardModule } from './dashboard/dashboard.module';
import { MomentModule } from '@ccmos/nestjs-moment';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';
import { NotificationModule } from './notification/notification.module';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MomentModule.forRoot({}),
    CacheModule.register(),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './upload',
      }),
    }),
    SendGridModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        apiKey: process.env.SENDGRID_API_KEY,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({}),
    AuthModule,
    UsersModule,
    RolesModule,
    TeamModule,
    OrganizationsModule,
    CreditCardsModule,
    SlackProfileModule,
    DefaultAdminModule,
    AccessControlModule.forRoles(roles),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT, 10) || 1025,
        auth: {
          user: process.env.SMTP_AUTH_USER || 'username',
          pass: process.env.SMTP_AUTH_PASS || 'password',
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true,
        },
      },
    }),
    DropInModule,
    InterestsModule,
    DashboardModule,
    TaskModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
