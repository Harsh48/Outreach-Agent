import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class OutreachSimulationDto {
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsOptional()
  @IsObject()
  templateVariables?: Record<string, any>;
}

export class OutreachSimulationResponseDto {
  jobId: string;
  status: string;
  createdAt: Date;
  results?: {
    emailsSent: number;
    events: Array<{
      type: string;
      contactId: string;
      emailAddress: string;
      timestamp: Date;
      data?: any;
    }>;
  };
}
