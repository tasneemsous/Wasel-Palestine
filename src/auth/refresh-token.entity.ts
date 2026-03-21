import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

//import { User } from './user.entity';
import { User } from '../users/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  token: string;

  @Column({ name: 'expiry_date' })
  expiryDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}