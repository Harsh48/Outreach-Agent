import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Job } from '../entities/job.entity';
import { JobEvent } from '../entities/job-event.entity';
import { Contact } from '../entities/contact.entity';
import { ContactGroup } from '../entities/contact-group.entity';
import { LLMService } from './llm.service';
import { OutreachSimulationDto, OutreachSimulationResponseDto } from '../dto/agent.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(JobEvent)
    private jobEventRepository: Repository<JobEvent>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(ContactGroup)
    private contactGroupRepository: Repository<ContactGroup>,
    private llmService: LLMService,
    private configService: ConfigService,
  ) {}

  async simulateOutreach(dto: OutreachSimulationDto): Promise<OutreachSimulationResponseDto> {
    // Check for existing job within 10 minutes (idempotency)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingJob = await this.jobRepository.findOne({
      where: {
        type: 'outreach',
        groupId: dto.groupId,
        templateId: dto.template,
        createdAt: MoreThan(tenMinutesAgo)
      },
      relations: ['events']
    });

    if (existingJob) {
      return this.formatJobResponse(existingJob);
    }

    // Create new job
    const job = this.jobRepository.create({
      type: 'outreach',
      status: 'running',
      groupId: dto.groupId,
      templateId: dto.template,
      parameters: JSON.stringify({
        template: dto.template,
        templateVariables: dto.templateVariables || {}
      })
    });

    const savedJob = await this.jobRepository.save(job);

    // Get contacts from group
    const group = await this.contactGroupRepository.findOne({
      where: { id: dto.groupId },
      relations: ['contacts']
    });

    if (!group || !group.contacts.length) {
      savedJob.status = 'failed';
      savedJob.error = 'Group not found or has no contacts';
      await this.jobRepository.save(savedJob);
      
      return {
        jobId: savedJob.id,
        status: 'failed',
        createdAt: savedJob.createdAt
      };
    }

    // Simulate email generation and outcomes
    const events = [];
    const seed = parseInt(this.configService.get<string>('RANDOM_SEED') || '42');
    const random = this.createSeededRandom(seed + Date.now());

    for (const contact of group.contacts) {
      // Generate personalized email
      const personalizedEmail = await this.generatePersonalizedEmail(
        dto.template,
        contact,
        dto.templateVariables || {}
      );

      // Create email sent event
      const sentEvent = await this.createJobEvent(savedJob.id, 'email_sent', {
        contactId: contact.id,
        emailAddress: contact.email,
        subject: personalizedEmail.subject,
        body: personalizedEmail.body
      });
      events.push(sentEvent);

      // Simulate outcomes with realistic probabilities
      const outcomes = this.simulateEmailOutcomes(random);
      
      for (const outcome of outcomes) {
        const event = await this.createJobEvent(savedJob.id, outcome.type, {
          contactId: contact.id,
          emailAddress: contact.email,
          ...outcome.data
        });
        events.push(event);
      }
    }

    // Update job as completed
    savedJob.status = 'completed';
    savedJob.results = JSON.stringify({
      emailsSent: group.contacts.length,
      totalEvents: events.length
    });
    await this.jobRepository.save(savedJob);

    return this.formatJobResponse(savedJob);
  }

  private async generatePersonalizedEmail(
    template: string,
    contact: Contact,
    variables: Record<string, any>
  ): Promise<{ subject: string; body: string }> {
    const systemMessage = `You are an AI assistant helping to personalize cold outreach emails.
    Generate a professional email based on the template and contact information.
    Keep it concise and personalized.`;

    const prompt = `Template: ${template}

Contact Information:
- Name: ${contact.fullName}
- Email: ${contact.email}
- Company: ${contact.company?.name || 'Unknown'}
- Position: ${contact.position || 'Unknown'}

Variables: ${JSON.stringify(variables)}

Generate a personalized email with subject and body.`;

    const response = await this.llmService.generateResponse(prompt, systemMessage);
    
    // Parse response or use fallback
    try {
      const lines = response.split('\n');
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
      const subject = subjectLine ? subjectLine.replace(/subject:\s*/i, '') : `Regarding ${template}`;
      
      const bodyStart = lines.findIndex(line => line.toLowerCase().includes('body:') || line.toLowerCase().includes('dear'));
      const body = bodyStart >= 0 ? lines.slice(bodyStart).join('\n').replace(/body:\s*/i, '') : response;
      
      return { subject, body };
    } catch {
      return {
        subject: `Personalized message for ${contact.firstName}`,
        body: template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          if (key === 'firstName') return contact.firstName;
          if (key === 'lastName') return contact.lastName;
          if (key === 'company') return contact.company?.name || 'your company';
          return variables[key] || match;
        })
      };
    }
  }

  private simulateEmailOutcomes(random: () => number): Array<{ type: string; data: any }> {
    const outcomes = [];
    
    // 70% chance of being opened
    if (random() < 0.7) {
      outcomes.push({
        type: 'email_opened',
        data: { timestamp: new Date() }
      });
      
      // 15% chance of reply if opened
      if (random() < 0.15) {
        outcomes.push({
          type: 'email_replied',
          data: {
            timestamp: new Date(),
            replyType: random() < 0.6 ? 'positive' : 'negative'
          }
        });
      }
    }
    
    // 5% chance of bounce
    if (random() < 0.05) {
      outcomes.push({
        type: 'email_bounced',
        data: {
          timestamp: new Date(),
          reason: 'Invalid email address'
        }
      });
    }
    
    return outcomes;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  private async createJobEvent(
    jobId: string,
    type: string,
    data: any
  ): Promise<JobEvent> {
    const event = this.jobEventRepository.create({
      jobId,
      type,
      contactId: data.contactId,
      emailAddress: data.emailAddress,
      data: JSON.stringify(data)
    });
    
    return await this.jobEventRepository.save(event);
  }

  private formatJobResponse(job: Job): OutreachSimulationResponseDto {
    const response: OutreachSimulationResponseDto = {
      jobId: job.id,
      status: job.status,
      createdAt: job.createdAt
    };

    if (job.results) {
      try {
        const results = JSON.parse(job.results);
        response.results = {
          emailsSent: results.emailsSent || 0,
          events: job.events?.map(event => ({
            type: event.type,
            contactId: event.contactId,
            emailAddress: event.emailAddress,
            timestamp: event.createdAt,
            data: event.data ? JSON.parse(event.data) : {}
          })) || []
        };
      } catch (error) {
        console.warn('Failed to parse job results:', error);
      }
    }

    return response;
  }
}
