import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { ContactGroup } from './contact-group.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => Company, company => company.contacts, { nullable: true })
  company: Company;

  @Column({ nullable: true })
  companyId: string;

  @ManyToMany(() => ContactGroup, group => group.contacts)
  @JoinTable()
  groups: ContactGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
