import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { Contact } from './contact.entity';

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ default: 'open' })
  stage: string; // open, qualified, proposal, negotiation, closed-won, closed-lost

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  probability: number; // 0-100

  @Column({ nullable: true })
  expectedCloseDate: Date;

  @Column({ nullable: true })
  actualCloseDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Company, company => company.deals)
  company: Company;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => Contact)
  primaryContact: Contact;

  @Column({ nullable: true })
  primaryContactId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
