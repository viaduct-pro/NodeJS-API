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

@Entity()
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @JoinTable()
  @ManyToOne((type) => User, (user) => user.invitesToThisUser, {
    cascade: ['insert', 'update'],
  })
  invited: User;

  @JoinTable()
  @ManyToOne((type) => User, (user) => user.invitesFromThisUser, {
    cascade: ['insert', 'update'],
  })
  inviter: User;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
