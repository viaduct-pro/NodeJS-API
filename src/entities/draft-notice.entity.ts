import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DropIn } from './drop-in.entity';
import { Interest } from './interest.entity';
import { Draft } from './draft.entity';

@Entity()
export class DraftNotice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @Column()
  noticeUserId: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne((type) => Draft, (draft) => draft.notices)
  public draft: Draft;

  @ManyToOne((type) => Interest, (interest) => interest.draftNotices)
  public interest: Interest;
}
