import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from '../controllers/email.controller';
import { EmailService } from '../services/email.service';
import { LLMService } from '../services/llm.service';
import { EmailThread } from '../entities/email-thread.entity';
import { EmailMessage } from '../entities/email-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailThread, EmailMessage])
  ],
  controllers: [EmailController],
  providers: [EmailService, LLMService],
  exports: [EmailService]
})
export class EmailModule {}
