import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Organization } from './organization.entity';
import { CreditCard } from './credit-card.entity';
import { SlackProfile } from './slack-profile.entity';
import { Team } from './team.entity';
import { Invite } from './invite.entity';
import { DropIn } from './drop-in.entity';
import { Interest } from './interest.entity';
import { UserNotice } from './user-notice.entity';
import { Draft } from './draft.entity';
import { Notification } from './notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  auth0Id: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  imgUrl: string;

  @Column({ nullable: true })
  imgPath: string;

  @Column({ nullable: true })
  workTitle: string;

  @Column({ nullable: true })
  communicationPreferences: string;

  @ManyToOne((type) => Role, (role) => role.users, {
    eager: true,
  })
  role: Role;

  @ManyToOne((type) => Organization, (organization) => organization.members, {
    eager: true,
  })
  organization: Organization;

  @ManyToOne((type) => Organization, (organization) => organization.leaders)
  organizationLead: Organization;

  @JoinTable()
  @OneToMany((type) => CreditCard, (creditCard) => creditCard.user, {
    cascade: ['insert', 'update'],
  })
  creditCards: CreditCard[];

  @OneToOne((type) => SlackProfile, (slackProfile) => slackProfile.user, {
    eager: true,
    nullable: true,
  })
  slackProfile: SlackProfile;

  @OneToMany((type) => Team, (team) => team.owner, { eager: false })
  @JoinTable()
  ownerForTeams: Team[];

  @ManyToMany((type) => Team, (team) => team.leaders, { eager: false })
  @JoinTable()
  teamLeader: Team[];

  @ManyToMany((type) => Team, (team) => team.members, { eager: false })
  @JoinTable()
  teamMember: Team[];

  @OneToMany((type) => Invite, (invite) => invite.invited)
  invitesToThisUser: Invite[];

  @OneToMany((type) => Invite, (invite) => invite.inviter)
  invitesFromThisUser: Invite[];

  @OneToMany((type) => DropIn, (dropIn) => dropIn.owner, { lazy: true })
  dropInsOwner: Promise<DropIn[]>;

  @OneToMany((type) => DropIn, (dropIn) => dropIn.recipient, { lazy: true })
  dropInsRecipient: Promise<DropIn[]>;

  @ManyToMany((type) => Interest, (interest) => interest.users)
  @JoinTable()
  interests: Promise<Interest[]>;

  @OneToMany(() => UserNotice, (userNotice) => userNotice.user)
  notices: Promise<UserNotice[]>;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.owner)
  notificationsOwner: Notification[];

  @OneToMany(() => Draft, (draft) => draft.user)
  drafts: Draft[];

  // @OneToMany(
  //   (type) => DropIn,
  //   (dropIn) => {
  //     dropIn.owner, dropIn.recipient;
  //   },
  // )
  // dropIns: DropIn[];
  @Column({ nullable: false, default: false })
  isActivated: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
