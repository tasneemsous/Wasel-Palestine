import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ReportCategory {
  CLOSURE = 'CLOSURE',
  DELAY = 'DELAY',
  ACCIDENT = 'ACCIDENT',
  WEATHER_HAZARD = 'WEATHER_HAZARD',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  DUPLICATE = 'DUPLICATE',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'reporter_id', nullable: true })
  reporterId: number;

  @Column({ type: 'enum', enum: ReportCategory })
  category: ReportCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 9, scale: 6 })
  locationLat: number;

  @Column({ name: 'location_long', type: 'decimal', precision: 9, scale: 6 })
  locationLong: number;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ name: 'confidence_score', default: 0 })
  confidenceScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}