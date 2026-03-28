import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'action_type' })
  actionType: string;

  @Column({ name: 'performed_by', nullable: true })
  performedById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User | null;

  @Column({ name: 'entity_name', type: 'varchar', length: 50, nullable: true })
  entityName: string | null;

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId: number | null;

  @Column({ name: 'action_details', type: 'text', nullable: true })
  actionDetails: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
