import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RAGModule } from './modules/rag.module';
import { AgentModule } from './modules/agent.module';
import { EmailModule } from './modules/email.module';
import { HealthController } from './controllers/health.controller';
import { VectorService } from './services/vector.service';
import { LLMService } from './services/llm.service';
import { Contact } from './entities/contact.entity';
import { Company } from './entities/company.entity';
import { Deal } from './entities/deal.entity';
import { Document } from './entities/document.entity';
import { Job } from './entities/job.entity';
import { JobEvent } from './entities/job-event.entity';
import { EmailThread } from './entities/email-thread.entity';
import { EmailMessage } from './entities/email-message.entity';
import { ContactGroup } from './entities/contact-group.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || './data/crm.sqlite',
      entities: [
        Contact,
        Company,
        Deal,
        Document,
        Job,
        JobEvent,
        EmailThread,
        EmailMessage,
        ContactGroup,
      ],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    RAGModule,
    AgentModule,
    EmailModule,
  ],
  controllers: [HealthController],
  providers: [VectorService, LLMService],
})
export class AppModule {}
