#!/bin/bash

# SoftSync CRM API Test Script
# Make sure the server is running: npm run start:dev

BASE_URL="http://localhost:3000"

echo "🧪 Testing SoftSync CRM API Endpoints"
echo "======================================"

# Test RAG Query
echo ""
echo "1. Testing RAG Query..."
curl -s -X POST "$BASE_URL/rag/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about TechCorp Solutions"}' | jq '.'

# Test RAG with @mention
echo ""
echo "2. Testing RAG with @mention..."
curl -s -X POST "$BASE_URL/rag/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "What deals do we have?", "context": "@TechCorp"}' | jq '.'

# Test RAG with LLM_OFF
echo ""
echo "3. Testing RAG with LLM_OFF..."
curl -s -X POST "$BASE_URL/rag/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me our contacts", "llmOff": true}' | jq '.'

# Test Outreach Simulation
echo ""
echo "4. Testing Outreach Simulation..."
curl -s -X POST "$BASE_URL/agent/outreach/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "7a6eadab-fcc0-4c30-ae1f-a62de0a6fbde",
    "template": "Hi {{firstName}}, interested in our CRM solution?",
    "templateVariables": {"discount": "20%"}
  }' | jq '.'

# Test Email Draft
echo ""
echo "5. Testing Email Draft Generation..."
curl -s -X POST "$BASE_URL/emails/draft" \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "a5e2ef73-8822-43f6-a57b-a3f93921997b",
    "goal": "book meeting",
    "tone": "professional"
  }' | jq '.'

# Test Error Handling
echo ""
echo "6. Testing Error Handling (Invalid Thread)..."
curl -s -X POST "$BASE_URL/emails/draft" \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "invalid-thread-id",
    "goal": "book meeting"
  }' | jq '.'

# Test Validation
echo ""
echo "7. Testing Validation (Empty Query)..."
curl -s -X POST "$BASE_URL/rag/query" \
  -H "Content-Type: application/json" \
  -d '{"query": ""}' | jq '.'

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "📝 Notes:"
echo "- Make sure to run 'npm run seed' first to populate sample data"
echo "- Set OPENAI_API_KEY in .env for full functionality"
echo "- Use LLM_OFF=true for mock responses without API calls"
echo "- Check the Postman collection for more detailed testing"
