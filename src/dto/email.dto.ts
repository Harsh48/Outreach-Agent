import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EmailDraftDto {
  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  goal: string; // e.g., "book meeting", "follow up on proposal"

  @IsOptional()
  @IsString()
  tone?: string; // professional, friendly, urgent, etc.

  @IsOptional()
  @IsString()
  additionalContext?: string;
}

export class EmailDraftResponseDto {
  subject: string;
  body: string;
  signature: string;
  threadId: string;
  goal: string;
  timestamp: Date;
  safetyChecks: {
    piiDetected: boolean;
    toxicContent: boolean;
    warnings: string[];
  };
}
