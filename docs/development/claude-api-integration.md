# Claude API Integration Documentation

## Overview

The Claude API integration provides the core AI capabilities for RachaAI, enabling intelligent bill splitting suggestions in Portuguese with Brazilian cultural context understanding.

## Architecture

### Core Components

1. **RachaAIClaudeClient** (`lib/claude-client.ts`)
   - Main client for Claude API interactions
   - Model routing logic (Haiku/Sonnet/Opus)
   - Cost tracking and optimization
   - Brazilian cultural context integration

2. **API Endpoint** (`pages/api/ai/chat.ts`)
   - RESTful endpoint for chat interactions
   - Rate limiting and security
   - Conversation storage in Supabase
   - Error handling and fallbacks

3. **Rate Limiting** (`lib/rate-limit.ts`)
   - Request rate limiting per user
   - Claude API call limiting
   - Budget monitoring and alerts

## Model Routing Logic

### Haiku Model (claude-3-haiku-20240307)
**Use Cases:**
- Simple calculations
- Basic expense splitting
- Confirmation questions
- Greetings and simple queries

**Performance Targets:**
- Response time: <1 second
- Cost: ~$0.25/1K input tokens, $1.25/1K output tokens

**Example Queries:**
- "Quanto cada um paga?"
- "Dividir R$ 100 entre 4 pessoas"
- "Confirmar divisão"

### Sonnet Model (claude-3-sonnet-20240229)
**Use Cases:**
- Complex expense scenarios
- Cultural context understanding
- Regional Portuguese variations
- Multi-step calculations

**Performance Targets:**
- Response time: <2.5 seconds
- Cost: ~$3.0/1K input tokens, $15.0/1K output tokens

**Example Queries:**
- "Fizemos um rodízio japonês com 8 pessoas. A conta foi R$ 320, mas 2 pessoas não beberam álcool"
- "Happy hour com os colegas do trabalho"
- "Churrasco com família, alguns trouxeram bebidas"

### Opus Model (claude-3-opus-20240229)
**Use Cases:**
- Advanced cultural scenarios
- Complex group dynamics
- Multi-currency situations
- Ambiguous or unclear descriptions

**Performance Targets:**
- Response time: <5 seconds
- Cost: ~$15.0/1K input tokens, $75.0/1K output tokens

**Example Queries:**
- "Organizei um churrasco para 15 pessoas. Comprei carne por R$ 180, bebidas por R$ 120, e cada um trouxe algo"
- "Viagem em grupo com diferentes orçamentos"

## Brazilian Cultural Context

### Supported Cultural Scenarios

1. **Rodízio** (All-you-can-eat)
   - Equal splitting among all participants
   - Special considerations for non-drinkers

2. **Happy Hour**
   - Social work gatherings
   - Equal split or by consumption

3. **Churrasco** (Brazilian BBQ)
   - Family-oriented events
   - Host pays for meat, others bring sides

4. **Vaquinha** (Group contribution)
   - Collective gift purchases
   - Group activities and events

5. **Aniversário** (Birthday parties)
   - Birthday person doesn't pay
   - Equal split among guests

6. **Viagem** (Travel expenses)
   - Accommodation and transportation
   - Activity and food expenses

### Regional Portuguese Support

**São Paulo (SP):**
- Formal business language
- "Cara" and "tipo" expressions
- Professional payment methods

**Rio de Janeiro (RJ):**
- Casual, friendly language
- "Mano" and "beleza" expressions
- Social payment methods

**Nordeste (NE):**
- Warm, family-oriented language
- "Meu" and "parça" expressions
- Community payment methods

**Sul (Sul):**
- Direct, precise language
- "Bah" and "tchê" expressions
- Efficient payment methods

## Cost Optimization

### Budget Management

- **Daily Budget:** R$ 50 per user (configurable)
- **Alert Threshold:** 80% of daily budget
- **Model Distribution:** 70% Haiku, 25% Sonnet, 5% Opus

### Cost Tracking

```typescript
interface CostMetrics {
  dailySpend: number;
  budget: number;
  percentageUsed: number;
  modelDistribution: Record<string, number>;
}
```

### Optimization Strategies

1. **Caching:** Repeated queries cached for 24 hours
2. **Model Selection:** Automatic routing based on complexity
3. **Token Optimization:** Efficient prompt engineering
4. **Fallback Mechanisms:** Graceful degradation on errors

## Security Implementation

### API Key Management

- Environment variables for all API keys
- No hardcoded secrets in code
- Secure key rotation procedures

### Input Validation

- XSS protection
- SQL injection prevention
- Rate limiting per user
- Request size limits

### Data Protection

- LGPD compliance for all data
- 90-day retention policy
- User consent management
- Data encryption at rest

## Error Handling

### Common Error Scenarios

1. **API Rate Limits**
   - Automatic retry with exponential backoff
   - User-friendly error messages
   - Fallback to cached responses

2. **Network Issues**
   - Connection timeout handling
   - Automatic retry mechanisms
   - Offline mode support

3. **Invalid Input**
   - Input validation and sanitization
   - Clear error messages in Portuguese
   - Suggestion for correct format

4. **Budget Exceeded**
   - Graceful degradation
   - User notification
   - Alternative calculation methods

### Fallback Mechanisms

```typescript
interface FallbackResponse {
  content: string;
  method: 'cached' | 'basic_calculation' | 'error_message';
  confidence: number;
}
```

## Performance Monitoring

### Key Metrics

1. **Response Times**
   - Haiku: <1 second
   - Sonnet: <2.5 seconds
   - Opus: <5 seconds

2. **Accuracy Rates**
   - Portuguese parsing: 90%+
   - Cultural context: 95%+
   - Mathematical accuracy: 100%

3. **Cost Efficiency**
   - Average cost per request: <R$ 0.10
   - Daily budget utilization: <80%
   - Model optimization: 70% Haiku usage

### Monitoring Tools

- Real-time cost tracking
- Performance dashboards
- Error rate monitoring
- User satisfaction metrics

## Testing Strategy

### Unit Tests

- Model routing logic
- Cost calculation accuracy
- Error handling scenarios
- Security validations

### Integration Tests

- End-to-end API flows
- Database interactions
- Rate limiting functionality
- Caching mechanisms

### Performance Tests

- Response time benchmarks
- Load testing scenarios
- Cost optimization validation
- Memory usage monitoring

## Deployment Considerations

### Environment Configuration

```bash
# Required Environment Variables
ANTHROPIC_API_KEY=your_claude_api_key
REDIS_URL=your_redis_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Optional Configuration
DAILY_BUDGET_BRL=50
REQUESTS_PER_MINUTE=30
CLAUDE_CALLS_PER_MINUTE=10
```

### Production Checklist

- [ ] API keys securely configured
- [ ] Rate limiting enabled
- [ ] Monitoring and alerting set up
- [ ] Error tracking implemented
- [ ] Performance monitoring active
- [ ] Security audits completed
- [ ] LGPD compliance verified

## Troubleshooting

### Common Issues

1. **High Response Times**
   - Check network connectivity
   - Verify model selection logic
   - Monitor cache hit rates

2. **High Costs**
   - Review model distribution
   - Check for unnecessary Opus usage
   - Optimize prompt engineering

3. **Accuracy Issues**
   - Validate cultural context integration
   - Check Portuguese language processing
   - Review training data quality

### Debug Tools

- Request/response logging
- Cost tracking dashboards
- Performance monitoring
- Error reporting systems

## Future Enhancements

### Planned Improvements

1. **Advanced Caching**
   - Semantic similarity caching
   - Context-aware responses
   - Personalized suggestions

2. **Enhanced Cultural Understanding**
   - More regional variations
   - Deeper cultural context
   - Improved slang recognition

3. **Cost Optimization**
   - Dynamic model selection
   - Predictive caching
   - Advanced budget management

4. **Performance Improvements**
   - Response streaming
   - Parallel processing
   - Edge caching

---

*This documentation provides comprehensive coverage of the Claude API integration, ensuring maintainability, security, and performance for the RachaAI application.* 