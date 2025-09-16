import { Controller, Get } from '@nestjs/common';
import { VectorService } from '../services/vector.service';
import { LLMService } from '../services/llm.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly vectorService: VectorService,
    private readonly llmService: LLMService,
  ) {}

  @Get()
  async getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        vectorStore: {
          status: 'ready',
          documentCount: this.vectorService.getDocumentCount()
        },
        llm: {
          status: this.llmService.isEnabled() ? 'enabled' : 'disabled (mock mode)'
        }
      },
      version: '1.0.0'
    };
  }
}
