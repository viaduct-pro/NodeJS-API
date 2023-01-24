import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RecoveryPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  email: string;

  @Column()
  newPasswordToken: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;
}
