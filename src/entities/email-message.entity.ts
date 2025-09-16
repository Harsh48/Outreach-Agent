import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { EmailThread } from './email-thread.entity';

@Entity('email_messages')
export class EmailMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  from: string;

  @Column({ type: 'simple-array' })
  to: string[];

  @Column({ type: 'simple-array', nullable: true })
  cc: string[];

  @Column({ type: 'simple-array', nullable: true })
  bcc: string[];

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: false })
  isHtml: boolean;

  @Column({ default: 'inbound' })
  direction: string; // inbound, outbound

  @Column({ default: 'sent' })
  status: string; // draft, sent, delivered, read

  @ManyToOne(() => EmailThread, thread => thread.messages)
  thread: EmailThread;

  @Column()
  threadId: string;

  @CreateDateColumn()
  createdAt: Date;
}
