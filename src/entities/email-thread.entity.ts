import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EmailMessage } from './email-message.entity';

@Entity('email_threads')
export class EmailThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column({ type: 'simple-array' })
  participants: string[]; // Array of email addresses

  @Column({ nullable: true })
  contactId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => EmailMessage, message => message.thread)
  messages: EmailMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
