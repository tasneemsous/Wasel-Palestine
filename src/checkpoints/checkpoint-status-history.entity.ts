import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Checkpoint } from './checkpoint.entity';

@Entity('checkpoint_status_history')
export class CheckpointStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Checkpoint, (cp) => cp.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checkpoint_id' })
  checkpoint: Checkpoint;

  @Column({ name: 'checkpoint_id' })
  checkpointId: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  changedBy: User | null;

  @Column({ name: 'changed_by', nullable: true })
  changedById: number | null;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
