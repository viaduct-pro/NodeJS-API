import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from '../notification/notification.service';
import { AmazonS3FileInterceptor } from 'nestjs-multer-extended';
import { diskStorage } from 'multer';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = path.extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

@Controller('user')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('/')
  @ApiExcludeEndpoint()
  getRoles() {
    return this.userService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @ApiExcludeEndpoint()
  @UseInterceptors(
    AmazonS3FileInterceptor('file', {
      dynamicPath: 'avatar',
    }),
  )
  async avatar(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.uploadAvatar(request, file);
  }

  @Get('avatar/:fileId')
  @ApiExcludeEndpoint()
  async getAvatarImage(@Param('fileId') fileId, @Res() res) {
    res.sendFile(fileId, { root: './upload/avatar' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/notifications/:teamId')
  @ApiBearerAuth()
  async getNotifications(
    @Param('teamId') teamId: string,
    @Req() request: Request,
  ) {
    return await this.notificationService.getUserNotifications(teamId, request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/notification/disable/:id')
  @ApiBearerAuth()
  async disableNotification(@Param('id') id: string) {
    return await this.notificationService.disableNotification(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/notifications/disable-all/:teamId')
  async disableAllNotifications(
    @Param('teamId') teamId,
    @Req() request: Request,
  ) {
    return await this.notificationService.disableAllNotifications(
      teamId,
      request,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/recommended-actions/:teamId')
  @ApiBearerAuth()
  async getRecommendedActions(
    @Param('teamId') teamId: string,
    @Req() request: Request,
  ) {
    return await this.notificationService.getRecommendedActions(
      teamId,
      request,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/recommended-action/disable/:id')
  async disableRecommendedAction(@Param('id') id: string) {
    return await this.notificationService.disableRecommendedAction(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/profile')
  async getProfile(@Req() request: Request) {
    return await this.userService.getProfile(request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/profile')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          default: 'Test',
        },
        lastName: {
          type: 'string',
          default: 'Testify',
        },
        workTitle: {
          type: 'string',
          default: 'Developer',
        },
        communicationPreferences: {
          type: 'string',
          default: 'every',
        },
        interests: {
          type: 'string',
          default: '[19,23,24,26,31,44,48]',
        },
        newInterests: {
          type: 'string',
          default: '["New Interest", "Soccer", "Dance"]',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    AmazonS3FileInterceptor('file', {
      dynamicPath: 'user/avatar',
      randomFilename: true,
    }),
  )
  async saveProfile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file != undefined) {
      await this.userService.uploadAvatar(request, file);
    }
    return await this.userService.saveProfile(request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/add-notices/:id')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['notices'],
      properties: {
        notices: {
          type: 'array',
          default: '["string1","string2"]',
        },
      },
    },
  })
  @ApiBearerAuth()
  async postUserNotices(@Param('id') id: string, @Req() request: Request) {
    return await this.userService.addNotices(id, request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/get-notices-by-user-id/:id')
  @ApiBearerAuth()
  async getUserNotices(@Param('id') id: string, @Req() request: Request) {
    return await this.userService.getNotices(id, request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user-info-by-id/:id/:teamId')
  async getUserInfoById(@Param() params, @Req() request: Request) {
    return await this.userService.getUserById(
      params.id,
      params.teamId,
      request,
    );
  }
}
