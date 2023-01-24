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

@Entity()
export class DropInNotice {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne((type) => DropIn, (dropIn) => dropIn.notices, { nullable: true })
  public dropIn: DropIn;

  @ManyToOne((type) => Interest, (interest) => interest.notices, {
    eager: true,
  })
  interest: Interest;
}
