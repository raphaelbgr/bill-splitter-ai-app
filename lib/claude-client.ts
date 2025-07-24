import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Types and Interfaces
export interface ConversationContext {
  userId: string;
  conversationId: string;
  groupId?: string;
  messageHistory: Message[];
  userPreferences?: UserPreferences;
  culturalContext?: BrazilianContext;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  modelUsed?: ClaudeModel;
  tokensUsed?: number;
  costBRL?: number;
}

export interface UserPreferences {
  language: 'pt-BR' | 'en';
  formalityLevel: 'informal' | 'formal' | 'professional';
  region: string;
  paymentPreference: 'pix' | 'boleto' | 'cartao' | 'dinheiro';
}

export interface BrazilianContext {
  region: string;
  scenario: 'restaurante' | 'uber' | 'churrasco' | 'happy_hour' | 'viagem' | 'vaquinha' | 'outros';
  groupType: 'amigos' | 'familia' | 'trabalho' | 'faculdade';
  timeOfDay: 'manha' | 'almoco' | 'tarde' | 'jantar' | 'noite';
}

export type ClaudeModel = 'claude-3-haiku-20240307' | 'claude-3-sonnet-20240229' | 'claude-3-opus-20240229';

export interface ClaudeResponse {
  content: string;
  modelUsed: ClaudeModel;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  costBRL: number;
  processingTimeMs: number;
  confidence: number;
  cached: boolean;
}

// Validation schemas
const MessageSchema = z.object({
  content: z.string().min(1).max(10000),
  role: z.enum(['user', 'assistant', 'system']),
});

const ConversationContextSchema = z.object({
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
});

export class RachaAIClaudeClient {
  private claude: Anthropic;
  private redis: Redis;
  private exchangeRate: number;
  private dailyBudgetBRL: number;
  private costAlertThreshold: number;

  // Model pricing in USD (per 1K tokens)
  private readonly MODEL_PRICING = {
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
    'claude-3-opus-20240229': { input: 15.0, output: 75.0 }
  } as const;

  // Brazilian system prompt base
  private readonly BRAZILIAN_SYSTEM_PROMPT = `Você é o RachaAI, assistente especializado em dividir contas no Brasil.

REGRAS FUNDAMENTAIS:
- Responda SEMPRE em português brasileiro natural e informal
- Seja preciso com cálculos matemáticos (zero tolerância a erros)
- Confirme divisões antes de finalizar
- Use contexto cultural brasileiro (churrasco, happy hour, galera, etc.)
- Mantenha respostas concisas (máximo 150 palavras)
- Use emojis apropriados mas com moderação

CONTEXTOS BRASILEIROS COMUNS:
- "Galera" = grupo de pessoas
- "Rachar" = dividir igualmente  
- "Vaquinha" = coleta para pagar algo
- "Rodízio" = cada pessoa paga uma rodada
- PIX é método preferido de pagamento
- "Pila" ou "conto" = dinheiro/reais

FORMATO DE RESPOSTA:
1. Confirme o entendimento da situação
2. Apresente o cálculo claramente
3. Pergunte confirmação
4. Sugira método de pagamento quando relevante

CENÁRIOS TÍPICOS: restaurante, uber, churrasco, happy hour, cinema, viagem, balada, lanchonete`;

  constructor() {
    // Initialize Claude client
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    // Initialize Redis client (optional for testing)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } else {
      // Mock Redis for testing
      this.redis = {
        get: async () => null,
        setex: async () => 'OK',
        incrbyfloat: async () => 0,
        incr: async () => 0,
        expire: async () => 1,
      } as any;
    }

    // Load configuration
    this.exchangeRate = parseFloat(process.env.USD_TO_BRL_EXCHANGE_RATE || '5.20');
    this.dailyBudgetBRL = parseFloat(process.env.DAILY_BUDGET_BRL || '100');
    this.costAlertThreshold = parseFloat(process.env.COST_ALERT_THRESHOLD || '80');
  }

  /**
   * Main method to process a conversation message
   * Implements 70/25/5 model routing strategy
   */
  async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<ClaudeResponse> {
    const startTime = Date.now();

    try {
      // Validate input
      MessageSchema.parse({ content: message, role: 'user' });
      ConversationContextSchema.parse(context);

      // Check daily budget first
      await this.checkDailyBudget(context.userId);

      // Check cache for similar responses
      const cachedResponse = await this.getCachedResponse(message, context);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Select optimal model based on complexity (70/25/5 strategy)
      const selectedModel = await this.selectOptimalModel(message, context);

      // Enhance message with Brazilian context
      const enhancedPrompt = await this.enhanceWithBrazilianContext(message, context);

      // Prepare conversation history
      const conversationHistory = await this.prepareConversationHistory(context);

      // Make Claude API call
      const response = await this.callClaude(
        enhancedPrompt,
        selectedModel,
        conversationHistory
      );

      // Calculate costs and metrics
      const tokensUsed = {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens
      };

      const costBRL = this.calculateCostBRL(tokensUsed, selectedModel);
      const processingTimeMs = Date.now() - startTime;

      // Create response object
      const claudeResponse: ClaudeResponse = {
        content: response.content[0].text,
        modelUsed: selectedModel,
        tokensUsed,
        costBRL,
        processingTimeMs,
        confidence: this.calculateConfidence(response, selectedModel),
        cached: false
      };

      // Track usage and costs
      await this.trackUsage(context.userId, claudeResponse);

      // Cache response for future use
      await this.cacheResponse(message, context, claudeResponse);

      return claudeResponse;

    } catch (error) {
      console.error('Claude processing error:', error);
      return this.handleError(error, message, context);
    }
  }

  /**
   * Intelligent model selection based on message complexity
   * Implements 70% Haiku, 25% Sonnet, 5% Opus distribution strategy
   */
  private async selectOptimalModel(
    message: string,
    context: ConversationContext
  ): Promise<ClaudeModel> {
    const complexity = this.analyzeComplexity(message, context);

    // Haiku - 70% of cases (simple confirmations, basic calculations)
    if (
      complexity <= 3 ||
      this.isSimpleConfirmation(message) ||
      this.isBasicCalculation(message) ||
      this.isGreeting(message)
    ) {
      return 'claude-3-haiku-20240307';
    }

    // Opus - 5% of cases (highly complex scenarios, failed Sonnet attempts)
    if (
      complexity >= 8 ||
      this.isHighlyComplex(message) ||
      this.isCorporateExpense(message) ||
      context.messageHistory.some(m => m.modelUsed === 'claude-3-sonnet-20240229' && m.content.includes('não entendi'))
    ) {
      return 'claude-3-opus-20240229';
    }

    // Sonnet - 25% of cases (moderate complexity, ambiguous context)
    return 'claude-3-sonnet-20240229';
  }

  /**
   * Analyze message complexity for model selection
   */
  private analyzeComplexity(message: string, context: ConversationContext): number {
    let complexity = 1;

    // Language complexity
    if (this.hasRegionalSlang(message)) complexity += 1;
    if (this.hasCodeSwitching(message)) complexity += 1;
    if (this.hasAmbiguousPronouns(message)) complexity += 2;

    // Business logic complexity
    const groupSize = this.extractGroupSize(message);
    if (groupSize > 6) complexity += 2;
    if (this.hasPercentageRules(message)) complexity += 3;
    if (this.hasConditionalLogic(message)) complexity += 3;
    if (this.hasMultipleCurrencies(message)) complexity += 4;

    // Context complexity
    if (context.messageHistory.length > 10) complexity += 1;
    if (context.groupId) complexity += 1;

    return Math.min(complexity, 10);
  }

  /**
   * Enhance message with Brazilian cultural context
   */
  private async enhanceWithBrazilianContext(
    message: string,
    context: ConversationContext
  ): Promise<string> {
    let enhanced = message;

    // Add cultural context if available
    if (context.culturalContext) {
      const contextInfo = [
        `Cenário: ${context.culturalContext.scenario}`,
        `Tipo de grupo: ${context.culturalContext.groupType}`,
        `Região: ${context.culturalContext.region}`,
        `Horário: ${context.culturalContext.timeOfDay}`
      ].join(' | ');

      enhanced = `[Contexto brasileiro: ${contextInfo}]\n\n${message}`;
    }

    // Add user preferences
    if (context.userPreferences) {
      const prefInfo = [
        `Preferência de pagamento: ${context.userPreferences.paymentPreference}`,
        `Nível de formalidade: ${context.userPreferences.formalityLevel}`
      ].join(' | ');

      enhanced = `[Preferências: ${prefInfo}]\n\n${enhanced}`;
    }

    return enhanced;
  }

  /**
   * Calculate costs in Brazilian Reais
   */
  private calculateCostBRL(
    tokensUsed: { input: number; output: number; total: number },
    model: ClaudeModel
  ): number {
    const pricing = this.MODEL_PRICING[model];
    const costUSD = (
      (tokensUsed.input / 1000) * pricing.input +
      (tokensUsed.output / 1000) * pricing.output
    );
    return costUSD * this.exchangeRate;
  }

  /**
   * Track usage and costs for budget management
   */
  private async trackUsage(userId: string, response: ClaudeResponse): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Update daily costs
    const dailyCostKey = `daily_cost:${today}`;
    await this.redis.incrbyfloat(dailyCostKey, response.costBRL);
    await this.redis.expire(dailyCostKey, 86400 * 2); // 2 days TTL

    // Update user costs
    const userCostKey = `user_cost:${userId}:${today}`;
    await this.redis.incrbyfloat(userCostKey, response.costBRL);
    await this.redis.expire(userCostKey, 86400 * 7); // 7 days TTL

    // Update model usage statistics
    const modelKey = `model_usage:${response.modelUsed}:${today}`;
    await this.redis.incr(modelKey);
    await this.redis.expire(modelKey, 86400 * 7);

    // Check for cost alerts
    await this.checkCostAlerts();
  }

  /**
   * Check daily budget and enforce limits
   */
  private async checkDailyBudget(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyCostKey = `daily_cost:${today}`;
    
    const currentSpend = parseFloat(await this.redis.get(dailyCostKey) || '0');
    
    if (currentSpend >= this.dailyBudgetBRL) {
      throw new Error(`Orçamento diário de R$ ${this.dailyBudgetBRL.toFixed(2)} excedido. Gasto atual: R$ ${currentSpend.toFixed(2)}`);
    }
    
    if (currentSpend >= this.dailyBudgetBRL * (this.costAlertThreshold / 100)) {
      console.warn(`⚠️ Aproximando do limite orçamentário: R$ ${currentSpend.toFixed(2)} / R$ ${this.dailyBudgetBRL.toFixed(2)}`);
    }
  }

  /**
   * Cache response for future similar queries
   */
  private async cacheResponse(
    message: string,
    context: ConversationContext,
    response: ClaudeResponse
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(message, context);
    const cacheData = {
      ...response,
      cached: true,
      originalMessage: message,
      cachedAt: new Date().toISOString()
    };

    // Cache for 2 hours for expensive models, 1 hour for Haiku
    const ttl = response.modelUsed === 'claude-3-opus-20240229' ? 7200 : 
                response.modelUsed === 'claude-3-sonnet-20240229' ? 3600 : 1800;

    await this.redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
  }

  /**
   * Get cached response if available
   */
  private async getCachedResponse(
    message: string,
    context: ConversationContext
  ): Promise<ClaudeResponse | null> {
    const cacheKey = this.generateCacheKey(message, context);
    const cached = await this.redis.get(cacheKey);
    
    if (cached && typeof cached === 'string') {
      const response = JSON.parse(cached) as ClaudeResponse;
      response.cached = true;
      return response;
    }
    
    return null;
  }

  /**
   * Generate cache key for message and context
   */
  private generateCacheKey(message: string, context: ConversationContext): string {
    const normalized = message.toLowerCase().trim();
    const contextKey = context.culturalContext ? 
      `${context.culturalContext.scenario}_${context.culturalContext.groupType}` : 'general';
    return `response_cache:${contextKey}:${Buffer.from(normalized).toString('base64').slice(0, 32)}`;
  }

  /**
   * Handle errors with fallback responses
   */
  private async handleError(
    error: unknown,
    message: string,
    context: ConversationContext
  ): Promise<ClaudeResponse> {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    console.error('Claude client error:', errorMessage);

    // Return fallback response
    return {
      content: 'Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente? 🤔',
      modelUsed: 'claude-3-haiku-20240307',
      tokensUsed: { input: 0, output: 0, total: 0 },
      costBRL: 0,
      processingTimeMs: 0,
      confidence: 0,
      cached: false
    };
  }

  // Helper methods for complexity analysis
  private isSimpleConfirmation(message: string): boolean {
    const confirmationWords = ['sim', 'não', 'ok', 'confirma', 'correto', 'certo', 'blz', 'beleza'];
    return confirmationWords.some(word => message.toLowerCase().includes(word)) && message.length < 50;
  }

  private isBasicCalculation(message: string): boolean {
    const numbers = message.match(/\d+/g);
    const divisionWords = ['dividir', 'rachar', 'split'];
    return !!numbers && numbers.length <= 3 && divisionWords.some(word => message.toLowerCase().includes(word));
  }

  private isGreeting(message: string): boolean {
    const greetings = ['oi', 'olá', 'eai', 'opa', 'bom dia', 'boa tarde', 'boa noite'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting)) && message.length < 100;
  }

  private isHighlyComplex(message: string): boolean {
    return message.length > 500 || 
           message.split('.').length > 5 ||
           /percentual|porcentagem|proporcional|complexo/.test(message.toLowerCase());
  }

  private isCorporateExpense(message: string): boolean {
    const corporateWords = ['empresa', 'corporativo', 'reunião', 'cliente', 'nota fiscal', 'cnpj'];
    return corporateWords.some(word => message.toLowerCase().includes(word));
  }

  private hasRegionalSlang(message: string): boolean {
    const slangWords = ['mano', 'véi', 'brow', 'parça', 'trampo', 'rolê'];
    return slangWords.some(word => message.toLowerCase().includes(word));
  }

  private hasCodeSwitching(message: string): boolean {
    return /[a-z]+/i.test(message) && /[português|ok|app|split]/i.test(message);
  }

  private hasAmbiguousPronouns(message: string): boolean {
    const pronouns = message.match(/\b(ele|ela|isso|aquilo|fulano)\b/gi);
    return pronouns ? pronouns.length > 2 : false;
  }

  private extractGroupSize(message: string): number {
    const numbers = message.match(/(\d+)\s*pessoas?/gi);
    return numbers ? parseInt(numbers[0]) : 1;
  }

  private hasPercentageRules(message: string): boolean {
    return /(\d+)%|porcent|percentual/.test(message.toLowerCase());
  }

  private hasConditionalLogic(message: string): boolean {
    const conditionals = ['se', 'caso', 'quando', 'menos', 'exceto', 'só'];
    return conditionals.some(word => message.toLowerCase().includes(word));
  }

  private hasMultipleCurrencies(message: string): boolean {
    return /usd|dolar|euro|real/gi.test(message);
  }

  private calculateConfidence(response: any, model: ClaudeModel): number {
    // Simple confidence calculation based on model and response characteristics
    const baseConfidence = {
      'claude-3-haiku-20240307': 0.8,
      'claude-3-sonnet-20240229': 0.9,
      'claude-3-opus-20240229': 0.95
    };
    
    return baseConfidence[model];
  }

  private async prepareConversationHistory(context: ConversationContext): Promise<any[]> {
    // Return simplified conversation history for now
    // This will be enhanced in Story 4 with Patricia Lima's memory system
    return context.messageHistory.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  private async callClaude(
    message: string,
    model: ClaudeModel,
    history: any[]
  ): Promise<any> {
    return await this.claude.messages.create({
      model,
      max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096'),
      temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
      system: this.BRAZILIAN_SYSTEM_PROMPT,
      messages: [
        ...history,
        { role: 'user', content: message }
      ]
    });
  }

  private async checkCostAlerts(): Promise<void> {
    // Implementation for cost alerts - to be enhanced with proper notification system
    const today = new Date().toISOString().split('T')[0];
    const currentSpend = parseFloat(await this.redis.get(`daily_cost:${today}`) || '0');
    
    if (currentSpend >= this.dailyBudgetBRL * 0.9) {
      console.warn('🚨 ALERTA: 90% do orçamento diário utilizado');
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<{
    dailySpend: number;
    budget: number;
    percentageUsed: number;
    modelDistribution: Record<string, number>;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const dailySpend = parseFloat(await this.redis.get(`daily_cost:${today}`) || '0');
    
    const modelStats = await Promise.all([
      this.redis.get(`model_usage:claude-3-haiku-20240307:${today}`),
      this.redis.get(`model_usage:claude-3-sonnet-20240229:${today}`),
      this.redis.get(`model_usage:claude-3-opus-20240229:${today}`)
    ]);

    return {
      dailySpend,
      budget: this.dailyBudgetBRL,
      percentageUsed: (dailySpend / this.dailyBudgetBRL) * 100,
      modelDistribution: {
        haiku: parseInt(String(modelStats[0] || '0')),
        sonnet: parseInt(String(modelStats[1] || '0')),
        opus: parseInt(String(modelStats[2] || '0'))
      }
    };
  }
} 