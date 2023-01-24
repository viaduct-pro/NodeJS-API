import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegistrationDto } from 'src/auth/dto/registration.dto';
import { updateUserDto } from 'src/auth/dto/updateUser.dto';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';
import { Interest } from '../entities/interest.entity';
import { UserNotice } from '../entities/user-notice.entity';
import { TeamService } from '../team/team.service';
import _ = require('lodash');
import { Team } from '../entities/team.entity';
import { ManagementClient } from 'auth0';
import { SlackProfile } from 'src/entities/slack-profile.entity';
import { LogLevel, WebClient } from '@slack/web-api';
import { Organization } from 'src/entities/organization.entity';

@Injectable()
export class UsersService {
  private auth0: ManagementClient;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository(UserNotice)
    private readonly userNoticeRepository: Repository<UserNotice>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly teamService: TeamService,
    @InjectRepository(SlackProfile)
    private readonly slackProfileRepository: Repository<SlackProfile>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {
    this.auth0 = new ManagementClient({
      domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'read:users update:users',
    });
  }

  async findOne(params: {}): Promise<User | undefined> {
    return await this.userRepository.findOne({ ...params });
  }

  async getUserById(id, teamId, request) {
    const authedUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });
    const user = await this.userRepository.findOne(
      { id: id },
      {
        relations: ['interests', 'ownerForTeams', 'teamLeader', 'teamMember'],
      },
    );

    const team = await this.teamRepository.findOne(
      { id: teamId },
      {
        relations: ['leaders', 'members', 'owner'],
      },
    );

    if (team != null) {
      const userAccess = await this.teamService.checkUserAccessToTheTeam(
        authedUser,
        team,
      );

      if (userAccess == false) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: "You don't have the access to this user",
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        return user;
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User has no team',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadAvatar(request, file) {
    const findUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });
    findUser.imgUrl =
      'https://' +
      process.env.S3_BUCKET +
      '.s3.amazonaws.com/' +
      'user/avatar/' +
      file.filename +
      '.' +
      file.mimetype;
    findUser.imgPath = file.path;
    await this.userRepository.save(findUser);

    return findUser;
  }

  async save(object: RegistrationDto): Promise<void> {
    const { role: userRole }: any = object;

    const role = await this.roleRepository.findOne({
      id: userRole?.id ? userRole.id : 1,
    });
    const data = this.userRepository.create({
      ...object,
      role,
    });
    await this.userRepository.save(data);
  }

  async getNotices(id, request) {
    const owner = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });
    const findUser = await this.userRepository.findOne(id);

    const notices = await this.userNoticeRepository.find({
      where: {
        ownerId: owner.id,
        noticeUserId: findUser.id,
      },
    });

    return notices;
  }

  async addNotices(userId, request) {
    const owner = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });

    const noticedUser = await this.userRepository.findOne(userId);

    const notices = await noticedUser.notices;

    if (notices.length > 0) {
      for (const userNotice of await noticedUser.notices) {
        await this.userNoticeRepository.remove(userNotice);
      }
    }

    const requestNotices = request.body.notices;

    const noticesArray = [];

    for (const notice of requestNotices) {
      // console.log(notice);
      const findInterest = await this.interestRepository.findOne({
        name: notice,
      });

      if (findInterest == undefined) {
        const newInterest = new Interest();
        newInterest.name = notice;
        newInterest.ownerId = owner.id;
        // newInterest.users = [owner];

        const newNoticeInterest = await this.interestRepository.save(
          newInterest,
        );

        const findNotice = await this.userNoticeRepository.findOne({
          where: {
            ownerId: owner.id,
            noticeUserId: noticedUser.id,
            interest: newNoticeInterest,
          },
        });

        if (findNotice == undefined) {
          const newNotice = await this.userNoticeRepository.create({
            ownerId: owner.id,
            noticeUserId: noticedUser.id,
            user: noticedUser,
          });
          newNotice.interest = Promise.resolve(newNoticeInterest);
          noticesArray.push(await this.userNoticeRepository.save(newNotice));
        } else {
          noticesArray.push(findNotice);
        }
      } else {
        const findNotice = await this.userNoticeRepository.findOne({
          where: {
            ownerId: owner.id,
            noticeUserId: noticedUser.id,
            interest: findInterest,
          },
        });

        if (findNotice == undefined) {
          const newNotice = await this.userNoticeRepository.create({
            ownerId: owner.id,
            noticeUserId: noticedUser.id,
            user: noticedUser,
          });
          newNotice.interest = Promise.resolve(findInterest);
          noticesArray.push(await this.userNoticeRepository.save(newNotice));
        } else {
          noticesArray.push(findNotice);
        }
      }
    }
    noticedUser.notices = Promise.resolve(noticesArray);

    await this.userRepository.save(noticedUser);

    return noticesArray;
  }

  async upload(object: updateUserDto) {
    const { role: userRole }: any = object;

    const role = await this.roleRepository.findOne({
      id: userRole?.id ? userRole.id : 1,
    });

    const user = await this.userRepository.preload({
      ...object,
      role,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.save(user);
  }

  async getAll() {
    return await this.userRepository.find({
      relations: ['role'],
    });
  }

  async getProfile(request) {
    return await this.userRepository.findOne({
      where: { auth0Id: request.user.id },
      relations: ['interests'],
    });
  }

  async saveProfile(request) {
    const findUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });
    findUser.firstName = request.body.firstName;
    findUser.lastName = request.body.lastName;
    findUser.workTitle = request.body.workTitle;
    findUser.communicationPreferences = request.body.communicationPreferences;

    if (request.body.newInterests) {
      const newInterestsArray = JSON.parse(request.body.newInterests);
      const userInterests = await this.interestRepository.find({
        where: {
          id: In(newInterestsArray),
        },
      });
      if (Array.isArray(newInterestsArray)) {
        for (const interest of newInterestsArray) {
          const findInterest = await this.interestRepository.findOne({
            where: {
              name: interest,
            },
          });
          if (findInterest != undefined || findInterest != null) {
            userInterests.push(findInterest);
          } else {
            const newUserInterest = new Interest();
            newUserInterest.name = interest;
            newUserInterest.ownerId = findUser.id;

            userInterests.push(
              await this.interestRepository.save(newUserInterest),
            );
          }
        }
        findUser.interests = Promise.resolve(userInterests);
      }
    }

    const savedUser = await this.userRepository.save(findUser);

    /* If user is still using auto-generated avatar, update with new initials */
    if (
      savedUser.firstName &&
      savedUser.lastName &&
      savedUser.imgUrl &&
      savedUser.imgUrl.includes('cdn.auth0.com')
    ) {
      const initials = savedUser.firstName[0] + savedUser.lastName[0];
      await this.auth0.updateUser(
        {
          id: savedUser.auth0Id,
        },
        {
          given_name: savedUser.firstName,
          family_name: savedUser.lastName,
          name: savedUser.firstName + ' ' + savedUser.lastName,
          picture: `https://i2.wp.com/cdn.auth0.com/avatars/${initials}.png`,
        },
      );
    }

    return savedUser;
  }

  async linkAuth0Accounts(currentAuth0User, existingDbUser) {
    const existingAuth0Account = await this.auth0.getUser({
      id: existingDbUser.auth0Id,
    });

    if (!existingAuth0Account) {
      return;
    }

    /* Check if the current logged-in user exists in the identity array */
    const accountMatch = existingAuth0Account.identities.filter((identity) => {
      if (
        `${identity.provider}|${identity.user_id}` === currentAuth0User.user_id
      ) {
        return true;
      }
    });

    /* If there wasn't an existing match, link the users */
    if (accountMatch.length === 0) {
      await this.auth0.linkUsers(currentAuth0User.user_id, {
        user_id: existingAuth0Account.user_id,
        provider: existingAuth0Account.identities[0].provider,
      });

      /* Update the existing db user to the newest auth0Id */
      existingDbUser.auth0Id = currentAuth0User.user_id;
      await this.userRepository.save(existingDbUser);
    }
  }

  async createFromAuth0Request(request) {
    const auth0User = await this.auth0.getUser({ id: request.user.id });
    if (auth0User) {
      let slackProfile, organization;
      if (auth0User.user_id.includes('slack')) {
        /* Slack Specific Logic */
        slackProfile = await this.slackProfileRepository.findOne({
          slackUserId: auth0User.user_id.split('|')[2],
        });

        /* If we don't have a slack profile for this user, create one */
        if (slackProfile == undefined) {
          slackProfile = new SlackProfile();
          slackProfile.slackUserId = auth0User?.user_id.split('|')[2];
          slackProfile.slackAccessToken = auth0User?.slack?.user_access_token;
          slackProfile.slackBotAccessToken = auth0User?.slack?.bot_access_token;
          slackProfile.code = 'code';
          slackProfile.teamId = auth0User?.slack?.team;
          /*
            Temporarily disabling the storing of channel information.
            The incoming_webhook feature isn't being used yet,
            and there are some questions about UX. - J.A.
          */
          slackProfile.channelName = '';
          slackProfile.channelId = '';
        } else {
          slackProfile.slackAccessToken = auth0User?.slack?.user_access_token;
          slackProfile.slackBotAccessToken = auth0User?.slack?.bot_access_token;
        }

        const web = new WebClient(auth0User?.slack?.bot_access_token, {
          logLevel: LogLevel.ERROR,
          retryConfig: { retries: 0 },
          timeout: 1000,
          rejectRateLimitedCalls: true,
        });

        const teamData = await web.team.info({
          team: auth0User?.slack?.team,
        });

        if (teamData?.team?.name) {
          slackProfile.teamName = teamData.team.name;
        }

        organization = await this.organizationRepository.findOne({
          name: teamData.team.name,
        });

        if (!organization) {
          organization = new Organization();
          organization.name = teamData.team.name;
        }
      }

      const newQueryUser = await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.teamMember', 'teamMember')
        .leftJoinAndSelect('users.organization', 'organization')
        .leftJoinAndSelect('users.slackProfile', 'slackProfile')
        .leftJoinAndSelect('users.ownerForTeams', 'ownerForTeams')
        .leftJoinAndSelect('users.teamLeader', 'teamLeader')
        .leftJoinAndSelect('users.invitesToThisUser', 'invitesToThisUser')
        .where('users.email = :userEmail', {
          userEmail: auth0User.email,
        })
        .getOne();

      console.log('___USER___');
      console.log(newQueryUser);

      if (newQueryUser) {
        if (!newQueryUser.auth0Id) {
          newQueryUser.auth0Id = auth0User.user_id;
          /*
            If the auth0 ID's don't match, check if this social identity
            needs to be linked.
          */
        } else if (auth0User.user_id !== newQueryUser.auth0Id) {
          this.linkAuth0Accounts(auth0User, newQueryUser);
        }
        newQueryUser.firstName = auth0User.given_name;
        newQueryUser.lastName = auth0User.family_name;
        newQueryUser.imgUrl = auth0User.picture;

        if (!newQueryUser.slackProfile && slackProfile) {
          /* Link the Slack Profile to the User */
          slackProfile.userId = newQueryUser.id;
          const savedSlackProfile = await this.slackProfileRepository.save(
            slackProfile,
          );
          newQueryUser.slackProfile = savedSlackProfile;
        }

        await this.userRepository.save(newQueryUser);
        return {
          user: newQueryUser,
          inTeams:
            newQueryUser.ownerForTeams?.length > 0 ||
            newQueryUser.teamLeader?.length > 0 ||
            newQueryUser.teamMember?.length > 0,
          isInvite: newQueryUser.invitesToThisUser?.length > 0,
        };
      }

      const newUser = new User();
      newUser.email = auth0User.email;
      newUser.firstName = auth0User.given_name;
      newUser.lastName = auth0User.family_name;
      newUser.auth0Id = auth0User.user_id;
      newUser.imgUrl = auth0User.picture;

      const savedUser = await this.userRepository.save(newUser);

      if (slackProfile) {
        /* Link the Organization to the User */
        if (organization) {
          organization.leaderId = savedUser.id;
          const savedOrganization = await this.organizationRepository.save(
            organization,
          );
          savedUser.organization = savedOrganization;
        }

        /* Link the Slack Profile to the User */
        slackProfile.userId = savedUser.id;
        const savedSlackProfile = await this.slackProfileRepository.save(
          slackProfile,
        );
        savedUser.slackProfile = savedSlackProfile;

        /* Re-save User */
        await this.userRepository.save(savedUser);
      }

      return {
        user: savedUser,
        inTeams:
          savedUser.ownerForTeams?.length > 0 ||
          savedUser.teamLeader?.length > 0 ||
          savedUser.teamMember?.length > 0,
        isInvite: savedUser.invitesToThisUser?.length > 0,
      };
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Code for Slack is expired',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
