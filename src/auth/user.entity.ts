import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ default: 'CITIZEN' })
  role: string;

  @Column({ name: 'reputation_score', default: 0 })
  reputationScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}