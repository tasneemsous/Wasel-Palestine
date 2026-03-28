import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CheckpointStatusHistory } from './checkpoint-status-history.entity';

@Entity('checkpoints')
export class Checkpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 9, scale: 6 })
  locationLat: string;

  @Column({ name: 'location_long', type: 'decimal', precision: 9, scale: 6 })
  locationLong: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(
    () => CheckpointStatusHistory,
    (history) => history.checkpoint,
  )
  statusHistory?: CheckpointStatusHistory[];
}
