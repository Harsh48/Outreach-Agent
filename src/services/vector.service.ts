import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface VectorDocument {
  id: string;
  embedding: number[];
  metadata: any;
}

@Injectable()
export class VectorService implements OnModuleInit {
  private documents: VectorDocument[] = [];
  private indexPath: string;

  constructor(private configService: ConfigService) {
    this.indexPath = this.configService.get<string>('FAISS_INDEX_PATH') || './data/faiss_index';
  }

  async onModuleInit() {
    await this.loadIndex();
  }

  async addDocument(id: string, embedding: number[], metadata: any): Promise<void> {
    const existingIndex = this.documents.findIndex(doc => doc.id === id);
    
    if (existingIndex >= 0) {
      this.documents[existingIndex] = { id, embedding, metadata };
    } else {
      this.documents.push({ id, embedding, metadata });
    }
    
    await this.saveIndex();
  }

  async search(queryEmbedding: number[], k: number = 5): Promise<Array<{ id: string; score: number; metadata: any }>> {
    const results = this.documents
      .map(doc => ({
        id: doc.id,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding),
        metadata: doc.metadata
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return results;
  }

  async removeDocument(id: string): Promise<void> {
    this.documents = this.documents.filter(doc => doc.id !== id);
    await this.saveIndex();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  private async loadIndex(): Promise<void> {
    try {
      if (fs.existsSync(this.indexPath)) {
        const data = fs.readFileSync(this.indexPath, 'utf-8');
        this.documents = JSON.parse(data);
        console.log(`Loaded ${this.documents.length} documents from vector index`);
      }
    } catch (error) {
      console.warn('Failed to load vector index:', error.message);
      this.documents = [];
    }
  }

  private async saveIndex(): Promise<void> {
    try {
      const dir = path.dirname(this.indexPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.indexPath, JSON.stringify(this.documents, null, 2));
    } catch (error) {
      console.error('Failed to save vector index:', error.message);
    }
  }

  getDocumentCount(): number {
    return this.documents.length;
  }
}
