import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { DropIn } from './drop-in.entity';
import { Draft } from './draft.entity';
import { Notification } from './notification.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  conversationId: string;

  @Column({ unique: true, nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionStatus: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne((type) => User, (user) => user.ownerForTeams, { eager: true })
  owner: User;

  @ManyToMany((type) => User, (user) => user.teamLeader, { eager: true })
  leaders: User[];

  @ManyToMany((type) => User, (user) => user.teamMember, { eager: true })
  members: User[];

  @ManyToOne((type) => Organization, (organization) => organization.teams)
  organization: Organization;

  @OneToMany((type) => DropIn, (dropIn) => dropIn.team)
  dropIns: DropIn[];

  @OneToMany((type) => Draft, (draft) => draft.team, { nullable: true })
  drafts: Draft[];

  @OneToMany((type) => Notification, (notification) => notification.team)
  notifications: Notification[];
}
