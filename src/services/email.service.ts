import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailThread } from '../entities/email-thread.entity';
import { EmailMessage } from '../entities/email-message.entity';
import { LLMService } from './llm.service';
import { EmailDraftDto, EmailDraftResponseDto } from '../dto/email.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailThread)
    private emailThreadRepository: Repository<EmailThread>,
    @InjectRepository(EmailMessage)
    private emailMessageRepository: Repository<EmailMessage>,
    private llmService: LLMService,
    private configService: ConfigService,
  ) {}

  async generateDraft(dto: EmailDraftDto): Promise<EmailDraftResponseDto> {
    const thread = await this.emailThreadRepository.findOne({
      where: { id: dto.threadId },
      relations: ['messages']
    });

    if (!thread) {
      throw new Error('Email thread not found');
    }

    // Get the last inbound message
    const lastInboundMessage = thread.messages
      .filter(msg => msg.direction === 'inbound')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!lastInboundMessage) {
      throw new Error('No inbound messages found in thread');
    }

    // Generate draft
    const draft = await this.generateEmailDraft(
      thread,
      lastInboundMessage,
      dto.goal,
      dto.tone,
      dto.additionalContext
    );

    // Perform safety checks
    const safetyChecks = await this.performSafetyChecks(draft.body);

    const response: EmailDraftResponseDto = {
      subject: draft.subject,
      body: draft.body,
      signature: this.configService.get<string>('DEFAULT_SIGNATURE') || 'Best regards,\nSoftSync CRM Team',
      threadId: dto.threadId,
      goal: dto.goal,
      timestamp: new Date(),
      safetyChecks
    };

    // If safety issues found, modify or refuse
    if (safetyChecks.toxicContent) {
      response.body = '[DRAFT BLOCKED] This email contains potentially harmful content and has been blocked for review.';
      response.subject = 'Draft Blocked - Review Required';
    } else if (safetyChecks.piiDetected) {
      // Redact PII
      response.body = this.redactPII(response.body);
      safetyChecks.warnings.push('PII has been automatically redacted from this draft.');
    }

    return response;
  }

  private async generateEmailDraft(
    thread: EmailThread,
    lastInboundMessage: EmailMessage,
    goal: string,
    tone?: string,
    additionalContext?: string
  ): Promise<{ subject: string; body: string }> {
    const conversationHistory = thread.messages
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(msg => `[${msg.direction.toUpperCase()}] From: ${msg.from}\nSubject: ${msg.subject}\nBody: ${msg.body}`)
      .join('\n\n---\n\n');

    const systemMessage = `You are a professional email assistant helping to draft follow-up emails.
    
Guidelines:
- Be professional and ${tone || 'courteous'}
- Reference the conversation context appropriately
- Focus on achieving the stated goal
- Keep the email concise but complete
- Use a clear subject line that reflects the purpose
- Do not include any personally identifiable information beyond what's necessary
- Avoid making promises or commitments that require approval`;

    const prompt = `Based on this email conversation, draft a follow-up email to achieve the goal: "${goal}"

Current thread subject: ${thread.subject}

Conversation history:
${conversationHistory}

Last inbound message details:
From: ${lastInboundMessage.from}
Subject: ${lastInboundMessage.subject}
Body: ${lastInboundMessage.body}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Generate a professional email response with:
1. An appropriate subject line
2. A well-structured body that addresses the goal

Format your response as:
SUBJECT: [subject line]
BODY: [email body]`;

    const response = await this.llmService.generateResponse(prompt, systemMessage);
    
    return this.parseEmailResponse(response, thread.subject);
  }

  private parseEmailResponse(response: string, originalSubject: string): { subject: string; body: string } {
    const lines = response.split('\n');
    let subject = '';
    let body = '';
    let inBody = false;

    for (const line of lines) {
      if (line.toUpperCase().startsWith('SUBJECT:')) {
        subject = line.substring(8).trim();
      } else if (line.toUpperCase().startsWith('BODY:')) {
        inBody = true;
        const bodyStart = line.substring(5).trim();
        if (bodyStart) {
          body = bodyStart + '\n';
        }
      } else if (inBody) {
        body += line + '\n';
      }
    }

    // Fallback parsing if structured format not found
    if (!subject || !body) {
      const subjectMatch = response.match(/subject:\s*(.+)/i);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
      }
      
      if (!body) {
        // Use everything after subject as body, or entire response if no subject found
        const bodyStart = response.indexOf(subject) + subject.length;
        body = response.substring(bodyStart).replace(/^body:\s*/i, '').trim();
      }
    }

    return {
      subject: subject || `Re: ${originalSubject}`,
      body: body.trim() || response.trim()
    };
  }

  private async performSafetyChecks(content: string): Promise<{
    piiDetected: boolean;
    toxicContent: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let piiDetected = false;
    let toxicContent = false;

    // Basic PII detection patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
      /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, // Phone numbers
    ];

    for (const pattern of piiPatterns) {
      if (pattern.test(content)) {
        piiDetected = true;
        warnings.push('Potential PII detected in email content');
        break;
      }
    }

    // Basic toxicity detection (simple keyword approach)
    const toxicKeywords = [
      'hate', 'kill', 'die', 'stupid', 'idiot', 'moron',
      'threat', 'violence', 'harm', 'attack'
    ];

    const lowerContent = content.toLowerCase();
    for (const keyword of toxicKeywords) {
      if (lowerContent.includes(keyword)) {
        toxicContent = true;
        warnings.push('Potentially harmful content detected');
        break;
      }
    }

    // Check for inappropriate business language
    const inappropriatePatterns = [
      /guarantee.*100%/i,
      /risk.free/i,
      /no.obligation/i,
      /act.now/i,
      /limited.time/i
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(content)) {
        warnings.push('Potentially inappropriate business language detected');
        break;
      }
    }

    return { piiDetected, toxicContent, warnings };
  }

  private redactPII(content: string): string {
    // Redact common PII patterns
    return content
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX')
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX')
      .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, 'XXX-XXX-XXXX');
  }
}
