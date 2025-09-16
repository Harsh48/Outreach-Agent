import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  type: string; // contact, company, deal, email, note

  @Column({ nullable: true })
  sourceId: string; // ID of the source entity (contact, company, etc.)

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON string for additional metadata

  @Column({ type: 'text', nullable: true })
  embedding: string; // JSON string of the vector embedding

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
