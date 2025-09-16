import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from '../services/agent.service';
import { OutreachSimulationDto, OutreachSimulationResponseDto } from '../dto/agent.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('outreach/simulate')
  async simulateOutreach(@Body() dto: OutreachSimulationDto): Promise<OutreachSimulationResponseDto> {
    return await this.agentService.simulateOutreach(dto);
  }
}
