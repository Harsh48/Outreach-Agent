import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Job } from './job.entity';

@Entity('job_events')
export class JobEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // email_sent, email_opened, email_replied, email_bounced, etc.

  @Column({ type: 'text', nullable: true })
  data: string; // JSON string of event data

  @Column({ nullable: true })
  contactId: string;

  @Column({ nullable: true })
  emailAddress: string;

  @ManyToOne(() => Job, job => job.events)
  job: Job;

  @Column()
  jobId: string;

  @CreateDateColumn()
  createdAt: Date;
}
