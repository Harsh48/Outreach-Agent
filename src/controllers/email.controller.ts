import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { EmailDraftDto, EmailDraftResponseDto } from '../dto/email.dto';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('draft')
  async generateDraft(@Body() dto: EmailDraftDto): Promise<EmailDraftResponseDto> {
    return await this.emailService.generateDraft(dto);
  }
}
