import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class LLMService {
  private openai: OpenAI | null = null;
  private isLLMOff: boolean;

  constructor(private configService: ConfigService) {
    this.isLLMOff = this.configService.get<string>('LLM_OFF') === 'true';
    
    if (!this.isLLMOff) {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (apiKey && apiKey !== 'your_openai_api_key_here') {
        this.openai = new OpenAI({ apiKey });
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.isLLMOff || !this.openai) {
      // Return mock embedding for testing
      return new Array(1536).fill(0).map(() => Math.random() - 0.5);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.warn('Failed to generate embedding, using mock:', error.message);
      return new Array(1536).fill(0).map(() => Math.random() - 0.5);
    }
  }

  async generateResponse(
    prompt: string,
    systemMessage?: string,
    temperature: number = 0.7
  ): Promise<string> {
    if (this.isLLMOff || !this.openai) {
      return `[LLM_OFF] Mock response for prompt: "${prompt.substring(0, 100)}..."`;
    }

    try {
      const messages: any[] = [];
      
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('LLM_MODEL') || 'gpt-3.5-turbo',
        messages,
        temperature,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'No response generated';
    } catch (error) {
      console.warn('Failed to generate response, using mock:', error.message);
      return `[ERROR] Mock response for prompt: "${prompt.substring(0, 100)}..."`;
    }
  }

  isEnabled(): boolean {
    return !this.isLLMOff && this.openai !== null;
  }
}
