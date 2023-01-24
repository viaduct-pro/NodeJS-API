import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Interest } from './interest.entity';
import { UserNotice } from './user-notice.entity';
import { DraftNotice } from './draft-notice.entity';
import { Team } from './team.entity';

@Entity()
export class Draft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ type: 'text' })
  visualArray: string;

  @Column()
  audioTime: string;

  @JoinTable()
  @ManyToOne((type) => User, (user) => user.drafts)
  user: User;

  @ManyToOne((type) => Team, (team) => team.drafts, { nullable: true })
  team: Team;

  @ManyToMany((type) => Interest, (interest) => interest.drafts, {
    eager: true,
  })
  @JoinTable()
  interests: Interest[];

  @OneToMany(() => DraftNotice, (draftNotice) => draftNotice.draft)
  public notices: DraftNotice[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
