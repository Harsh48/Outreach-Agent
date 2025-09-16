# SoftSync CRM - AI Developer Challenge

A comprehensive AI-powered CRM system with RAG (Retrieval-Augmented Generation), intelligent outreach agents, and AI-generated email drafts.

## Features

### 🔍 RAG on CRM Data
- **Smart Query System**: Query your CRM data using natural language
- **@Mention Support**: Type `@company` or `@contact` to get contextual information
- **Vector Search**: Advanced semantic search across all CRM documents
- **LLM_OFF Mode**: Return raw retrieved chunks without AI generation

### 🤖 AI Outreach Agent
- **Cold Email Simulation**: Generate and simulate email campaigns
- **Outcome Prediction**: Realistic simulation of opens, replies, and bounces
- **Job Tracking**: Complete audit trail of all outreach activities
- **Idempotency**: Repeated calls within 10 minutes return the same job

### ✉️ AI Email Drafts
- **Context-Aware**: Generate follow-ups based on email thread history
- **Goal-Oriented**: Specify objectives like "book meeting" or "follow up on proposal"
- **Safety Checks**: Built-in PII detection and toxicity filtering
- **Professional Tone**: Customizable tone and style options

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - works in mock mode without it)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd softsync-crm
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

3. **Set up database and seed data**
   ```bash
   npm run seed
   ```

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### RAG Query
```http
POST /rag/query
Content-Type: application/json

{
  "query": "What deals do we have with TechCorp?",
  "context": "@TechCorp",  // Optional: @mention for context
  "llmOff": false          // Optional: override LLM_OFF setting
}
```

**Response:**
```json
{
  "answer": "TechCorp Solutions has one active deal...",
  "sources": [
    {
      "id": "uuid",
      "title": "Deal: TechCorp CRM Implementation",
      "content": "Full deal description...",
      "type": "deal",
      "score": 0.95,
      "metadata": {...}
    }
  ],
  "query": "What deals do we have with TechCorp?",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Outreach Simulation
```http
POST /agent/outreach/simulate
Content-Type: application/json

{
  "groupId": "uuid-of-contact-group",
  "template": "Hi {{firstName}}, I wanted to reach out about...",
  "templateVariables": {
    "productName": "SoftSync CRM",
    "offer": "20% discount"
  }
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "results": {
    "emailsSent": 5,
    "events": [
      {
        "type": "email_sent",
        "contactId": "uuid",
        "emailAddress": "contact@example.com",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "type": "email_opened",
        "contactId": "uuid",
        "emailAddress": "contact@example.com",
        "timestamp": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

### Email Draft Generation
```http
POST /emails/draft
Content-Type: application/json

{
  "threadId": "uuid-of-email-thread",
  "goal": "book meeting",
  "tone": "professional",        // Optional
  "additionalContext": "..."     // Optional
}
```

**Response:**
```json
{
  "subject": "Re: CRM Implementation Discussion",
  "body": "Hi John,\n\nThank you for your interest...",
  "signature": "Best regards,\nSoftSync CRM Team",
  "threadId": "uuid",
  "goal": "book meeting",
  "timestamp": "2024-01-15T10:30:00Z",
  "safetyChecks": {
    "piiDetected": false,
    "toxicContent": false,
    "warnings": []
  }
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM functionality | - |
| `DATABASE_PATH` | SQLite database file path | `./data/crm.sqlite` |
| `VECTOR_DIMENSIONS` | Embedding vector dimensions | `1536` |
| `FAISS_INDEX_PATH` | Vector index storage path | `./data/faiss_index` |
| `PORT` | Server port | `3000` |
| `LLM_OFF` | Disable LLM and return raw chunks | `false` |
| `RANDOM_SEED` | Seed for reproducible simulations | `42` |

### LLM_OFF Mode

When `LLM_OFF=true`, the system operates in mock mode:
- RAG queries return top retrieved chunks without generation
- Outreach emails use template substitution instead of AI generation
- Email drafts return structured responses without LLM processing

This is useful for:
- Testing without API costs
- Demonstrating retrieval quality
- Development environments

## Sample Data

The seed script creates:
- **4 Companies**: TechCorp Solutions, Global Manufacturing Inc, StartupXYZ, Healthcare Partners
- **8 Contacts**: CTOs, VPs, Directors across different industries
- **4 Deals**: Various stages from open to negotiation
- **3 Contact Groups**: Enterprise Prospects, Tech Leaders, Startup Founders
- **2 Email Threads**: Active conversations with sample messages
- **Knowledge Documents**: Product features, implementation processes

## Development

### Available Scripts

```bash
npm run start:dev    # Start development server with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run seed         # Populate database with sample data
npm run test         # Run tests
```

### Project Structure

```
src/
├── controllers/     # API route handlers
├── services/        # Business logic and AI services
├── entities/        # Database models
├── dto/            # Data transfer objects
├── modules/        # NestJS modules
├── scripts/        # Utility scripts (seeding, etc.)
└── utils/          # Helper functions
```

### Key Services

- **LLMService**: Handles OpenAI API interactions and mock responses
- **VectorService**: In-memory vector search with cosine similarity
- **RAGService**: Orchestrates retrieval and generation
- **AgentService**: Manages outreach campaigns and simulations
- **EmailService**: Draft generation with safety checks

## Testing

### Manual Testing with curl

```bash
# Test RAG query
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about TechCorp Solutions"}'

# Test @mention query
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What deals do we have?", "context": "@TechCorp"}'

# Test outreach simulation
curl -X POST http://localhost:3000/agent/outreach/simulate \
  -H "Content-Type: application/json" \
  -d '{"groupId": "enterprise-prospects-id", "template": "Hi {{firstName}}, interested in our CRM?"}'

# Test email draft
curl -X POST http://localhost:3000/emails/draft \
  -H "Content-Type: application/json" \
  -d '{"threadId": "thread-id", "goal": "book meeting"}'
```

### LLM_OFF Testing

Set `LLM_OFF=true` in your `.env` file to test without API calls:

```bash
# All endpoints will work but return mock/template responses
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "llmOff": true}'
```

## Architecture Decisions

### Vector Database
- **Choice**: In-memory vector store with file persistence
- **Rationale**: Simplicity for demo, easy setup, no external dependencies
- **Production**: Would use pgvector, Pinecone, or Weaviate

### LLM Integration
- **Choice**: OpenAI with comprehensive fallback system
- **Rationale**: Reliable API, good documentation, fallback ensures demo works
- **Production**: Would add multiple providers, caching, rate limiting

### Database
- **Choice**: SQLite with TypeORM
- **Rationale**: Zero-config setup, perfect for demo and development
- **Production**: Would use PostgreSQL for scalability

### Safety Checks
- **Choice**: Rule-based PII detection and keyword filtering
- **Rationale**: Fast, deterministic, no external dependencies
- **Production**: Would use dedicated safety APIs (OpenAI Moderation, etc.)

## Improvements for Day 2

### Performance
- [ ] Implement vector database connection pooling
- [ ] Add Redis caching for frequent queries
- [ ] Batch embedding generation for large datasets
- [ ] Implement pagination for large result sets

### Features
- [ ] Advanced email template engine
- [ ] Multi-language support for outreach
- [ ] Real-time notifications for job status
- [ ] Advanced analytics and reporting dashboard

### Security
- [ ] API authentication and authorization
- [ ] Rate limiting and request throttling
- [ ] Enhanced PII detection with ML models
- [ ] Audit logging for all AI operations

### Scalability
- [ ] Microservices architecture
- [ ] Kubernetes deployment manifests
- [ ] Database migrations and versioning
- [ ] Horizontal scaling for vector operations

### Monitoring
- [ ] Application performance monitoring
- [ ] LLM usage and cost tracking
- [ ] Vector search performance metrics
- [ ] Business intelligence dashboards

## Troubleshooting

### Common Issues

**"No documents found"**
- Run `npm run seed` to populate sample data
- Check database connection in logs

**"LLM API errors"**
- Verify `OPENAI_API_KEY` in `.env`
- Set `LLM_OFF=true` for mock mode

**"Vector index not loading"**
- Check file permissions on `./data/` directory
- Delete and recreate with `npm run seed`

**"Port already in use"**
- Change `PORT` in `.env` file
- Kill existing processes: `lsof -ti:3000 | xargs kill`

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For questions or support, please open an issue on GitHub.
