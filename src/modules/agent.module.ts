import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from '../controllers/agent.controller';
import { AgentService } from '../services/agent.service';
import { LLMService } from '../services/llm.service';
import { Job } from '../entities/job.entity';
import { JobEvent } from '../entities/job-event.entity';
import { Contact } from '../entities/contact.entity';
import { ContactGroup } from '../entities/contact-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobEvent, Contact, ContactGroup])
  ],
  controllers: [AgentController],
  providers: [AgentService, LLMService],
  exports: [AgentService]
})
export class AgentModule {}
