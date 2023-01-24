import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Team } from './team.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  type: string;

  @Column()
  status: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @JoinTable()
  @ManyToOne((type) => User, (user) => user.notifications, {
    cascade: ['insert', 'update', 'remove'],
  })
  user: User;

  @JoinTable()
  @ManyToOne((type) => User, (user) => user.notificationsOwner, {
    cascade: ['insert', 'update', 'remove'],
  })
  owner: User;

  @ManyToOne((type) => Team, (team) => team.notifications, {
    nullable: true,
    cascade: ['insert', 'update', 'remove'],
  })
  team: Team;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
