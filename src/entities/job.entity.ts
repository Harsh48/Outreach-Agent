import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JobEvent } from './job-event.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // outreach, email_draft, etc.

  @Column({ default: 'pending' })
  status: string; // pending, running, completed, failed

  @Column({ type: 'text', nullable: true })
  parameters: string; // JSON string of job parameters

  @Column({ type: 'text', nullable: true })
  results: string; // JSON string of job results

  @Column({ nullable: true })
  groupId: string; // For outreach jobs

  @Column({ nullable: true })
  templateId: string; // For outreach jobs

  @Column({ nullable: true })
  error: string;

  @OneToMany(() => JobEvent, event => event.job)
  events: JobEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
