import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class RAGQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsString()
  context?: string; // For @mention context

  @IsOptional()
  @IsBoolean()
  llmOff?: boolean; // Override global LLM_OFF setting
}

export class RAGResponseDto {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    score: number;
    metadata?: any;
  }>;
  query: string;
  timestamp: Date;
}
