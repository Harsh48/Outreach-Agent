import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RAGController } from '../controllers/rag.controller';
import { RAGService } from '../services/rag.service';
import { LLMService } from '../services/llm.service';
import { VectorService } from '../services/vector.service';
import { Document } from '../entities/document.entity';
import { Contact } from '../entities/contact.entity';
import { Company } from '../entities/company.entity';
import { Deal } from '../entities/deal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Contact, Company, Deal])
  ],
  controllers: [RAGController],
  providers: [RAGService, LLMService, VectorService],
  exports: [RAGService, LLMService, VectorService]
})
export class RAGModule {}
