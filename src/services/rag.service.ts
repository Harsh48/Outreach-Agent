import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Contact } from '../entities/contact.entity';
import { Company } from '../entities/company.entity';
import { Deal } from '../entities/deal.entity';
import { LLMService } from './llm.service';
import { VectorService } from './vector.service';
import { RAGQueryDto, RAGResponseDto } from '../dto/rag.dto';

@Injectable()
export class RAGService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    private llmService: LLMService,
    private vectorService: VectorService,
  ) {}

  async query(queryDto: RAGQueryDto): Promise<RAGResponseDto> {
    const { query, context, llmOff } = queryDto;
    const isLLMDisabled = llmOff || !this.llmService.isEnabled();

    // Handle @mention queries
    if (context) {
      const contextResults = await this.handleMentionQuery(context);
      if (contextResults.length > 0) {
        const sources = contextResults.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          type: doc.type,
          score: 1.0,
          metadata: doc.metadata ? JSON.parse(doc.metadata) : {}
        }));

        if (isLLMDisabled) {
          return {
            answer: `Found ${sources.length} documents related to "${context}"`,
            sources,
            query,
            timestamp: new Date()
          };
        }

        const answer = await this.generateAnswerFromSources(query, sources);
        return { answer, sources, query, timestamp: new Date() };
      }
    }

    // Vector similarity search
    const queryEmbedding = await this.llmService.generateEmbedding(query);
    const searchResults = await this.vectorService.search(queryEmbedding, 5);

    const sources = [];
    for (const result of searchResults) {
      const doc = await this.documentRepository.findOne({ where: { id: result.id } });
      if (doc) {
        sources.push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          type: doc.type,
          score: result.score,
          metadata: doc.metadata ? JSON.parse(doc.metadata) : {}
        });
      }
    }

    if (isLLMDisabled) {
      return {
        answer: `Found ${sources.length} relevant documents`,
        sources,
        query,
        timestamp: new Date()
      };
    }

    const answer = await this.generateAnswerFromSources(query, sources);
    return { answer, sources, query, timestamp: new Date() };
  }

  private async handleMentionQuery(mention: string): Promise<Document[]> {
    // Search for contacts, companies, or deals by name
    const [contacts, companies, deals] = await Promise.all([
      this.contactRepository.find({
        where: [
          { firstName: Like(`%${mention}%`) },
          { lastName: Like(`%${mention}%`) },
          { email: Like(`%${mention}%`) }
        ],
        relations: ['company']
      }),
      this.companyRepository.find({
        where: { name: Like(`%${mention}%`) }
      }),
      this.dealRepository.find({
        where: { title: Like(`%${mention}%`) },
        relations: ['company', 'primaryContact']
      })
    ]);

    const documents = [];

    // Create documents from found entities
    for (const contact of contacts) {
      const doc = await this.documentRepository.findOne({
        where: { type: 'contact', sourceId: contact.id }
      });
      if (doc) documents.push(doc);
    }

    for (const company of companies) {
      const doc = await this.documentRepository.findOne({
        where: { type: 'company', sourceId: company.id }
      });
      if (doc) documents.push(doc);
    }

    for (const deal of deals) {
      const doc = await this.documentRepository.findOne({
        where: { type: 'deal', sourceId: deal.id }
      });
      if (doc) documents.push(doc);
    }

    return documents;
  }

  private async generateAnswerFromSources(query: string, sources: any[]): Promise<string> {
    if (sources.length === 0) {
      return "I couldn't find any relevant information to answer your query.";
    }

    const context = sources
      .map(source => `[${source.type}] ${source.title}: ${source.content}`)
      .join('\n\n');

    const systemMessage = `You are a helpful CRM assistant. Use the provided context to answer the user's question. 
    If the context doesn't contain enough information, say so. Always cite your sources by mentioning the document type and title.
    
    Context:
    ${context}`;

    return await this.llmService.generateResponse(query, systemMessage);
  }

  async indexDocument(
    title: string,
    content: string,
    type: string,
    sourceId?: string,
    metadata?: any
  ): Promise<Document> {
    const embedding = await this.llmService.generateEmbedding(content);
    
    const document = this.documentRepository.create({
      title,
      content,
      type,
      sourceId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      embedding: JSON.stringify(embedding)
    });

    const savedDoc = await this.documentRepository.save(document);
    
    // Add to vector index
    await this.vectorService.addDocument(
      savedDoc.id,
      embedding,
      { title, type, sourceId, ...metadata }
    );

    return savedDoc;
  }

  async reindexAllDocuments(): Promise<void> {
    const documents = await this.documentRepository.find();
    
    for (const doc of documents) {
      let embedding: number[];
      
      if (doc.embedding) {
        try {
          embedding = JSON.parse(doc.embedding);
        } catch {
          embedding = await this.llmService.generateEmbedding(doc.content);
          doc.embedding = JSON.stringify(embedding);
          await this.documentRepository.save(doc);
        }
      } else {
        embedding = await this.llmService.generateEmbedding(doc.content);
        doc.embedding = JSON.stringify(embedding);
        await this.documentRepository.save(doc);
      }

      await this.vectorService.addDocument(
        doc.id,
        embedding,
        {
          title: doc.title,
          type: doc.type,
          sourceId: doc.sourceId,
          ...doc.metadata ? JSON.parse(doc.metadata) : {}
        }
      );
    }
  }
}
