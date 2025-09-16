import { Controller, Post, Body } from '@nestjs/common';
import { RAGService } from '../services/rag.service';
import { RAGQueryDto, RAGResponseDto } from '../dto/rag.dto';

@Controller('rag')
export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  @Post('query')
  async query(@Body() queryDto: RAGQueryDto): Promise<RAGResponseDto> {
    return await this.ragService.query(queryDto);
  }
}
