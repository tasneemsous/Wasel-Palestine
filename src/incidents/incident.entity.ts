import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Report } from '../Reports/reports.entity';

export enum IncidentType {
  CLOSURE = 'CLOSURE',
  DELAY = 'DELAY',
  ACCIDENT = 'ACCIDENT',
  WEATHER_HAZARD = 'WEATHER_HAZARD',
  OTHER = 'OTHER',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: IncidentType })
  type: IncidentType;

  @Column({ type: 'enum', enum: IncidentSeverity })
  severity: IncidentSeverity;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 9, scale: 6 })
  locationLat: number;

  @Column({ name: 'location_long', type: 'decimal', precision: 9, scale: 6 })
  locationLong: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User | null;

  @Column({ name: 'verified_by', nullable: true })
  verifiedById: number | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', default: () => 'NOW()' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamp', nullable: true })
  endsAt: Date | null;

  @ManyToOne(() => Report, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_report_id' })
  sourceReport: Report | null;

  @Column({ name: 'source_report_id', nullable: true })
  sourceReportId: number | null;
}
