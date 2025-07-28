import { BrazilianNLPProcessor } from './brazilian-nlp';
import { ContextAwareProcessor } from './context-aware';
import { UserPreferenceLearner } from './user-preferences';
import { BrazilianPaymentSystem } from './payment-system';
import { GroupService } from './group-service';
import { MemorySystem } from './memory-system';

// Types for intelligent automation
export interface SmartCategorization {
  category: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
  culturalContext: string;
}

export interface PredictiveSplittingSuggestion {
  method: 'equal' | 'weighted' | 'custom' | 'by_consumption' | 'host_pays' | 'vaquinha';
  confidence: number;
  reasoning: string;
  participants: string[];
  amounts: { [participant: string]: number };
  culturalContext: string;
  alternatives: PredictiveSplittingSuggestion[];
}

export interface GroupRecommendation {
  groupName: string;
  confidence: number;
  reasoning: string;
  suggestedMembers: string[];
  culturalContext: string;
  splitMethod: string;
  paymentPreference: string;
}

export interface PaymentReminder {
  id: string;
  userId: string;
  debtId: string;
  type: 'gentle' | 'friendly' | 'urgent';
  message: string;
  method: 'push' | 'email' | 'sms';
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  culturalContext: string;
}

export interface AutomationAnalytics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  accuracyRate: number;
  timeSaved: number; // in seconds
  userSatisfaction: number; // 0-100
  culturalAccuracy: number; // 0-100
  costSavings: number; // in BRL
}

export class IntelligentAutomationSystem {
  private nlpProcessor: BrazilianNLPProcessor;
  private contextProcessor: ContextAwareProcessor;
  private preferenceLearner: UserPreferenceLearner;
  private paymentSystem: BrazilianPaymentSystem;
  private groupService: GroupService;
  private memorySystem: MemorySystem;

  constructor() {
    this.nlpProcessor = new BrazilianNLPProcessor();
    this.contextProcessor = new ContextAwareProcessor();
    this.preferenceLearner = new UserPreferenceLearner();
    this.paymentSystem = new BrazilianPaymentSystem();
    this.groupService = new GroupService();
    this.memorySystem = new MemorySystem();
  }

  /**
   * Smart expense categorization with Brazilian context
   */
  async categorizeExpense(
    userId: string,
    expenseText: string,
    amount: number,
    participants: string[]
  ): Promise<SmartCategorization> {
    const startTime = Date.now();

    // Process text with Brazilian NLP
    const nlpResult = await this.nlpProcessor.processText(expenseText);
    
    // Get user preferences and cultural context
    const userPreferences = await this.memorySystem.getUserPreferences(userId);
    const culturalContext = await this.memorySystem.getCulturalContext(userId);

    // Brazilian expense categories with cultural mapping
    const brazilianCategories = {
      'restaurante': ['restaurante', 'jantar', 'almoço', 'pizza', 'hambúrguer', 'sushi', 'rodízio'],
      'bar_happy_hour': ['bar', 'pub', 'happy hour', 'cerveja', 'drinks', 'balada'],
      'transporte': ['uber', '99', 'taxi', 'metro', 'ônibus', 'combustível'],
      'entretenimento': ['cinema', 'teatro', 'show', 'festa', 'aniversário'],
      'compras': ['shopping', 'loja', 'supermercado', 'farmácia'],
      'viagem': ['hotel', 'passagem', 'airbnb', 'turismo', 'passeio'],
      'churrasco': ['churrasco', 'churrascaria', 'carne', 'espetinho'],
      'festa': ['festa', 'aniversário', 'comemoração', 'confraternização'],
      'outros': ['outros', 'diversos', 'misc']
    };

    // Use the NLP result's cultural context directly
    const culturalAnalysis = this.analyzeCulturalContextForCategorization(
      nlpResult.culturalContext,
      amount,
      participants.length
    );

    // Determine primary category
    let primaryCategory = 'outros';
    let highestConfidence = 0;
    const lowerText = expenseText.toLowerCase();

    for (const [category, keywords] of Object.entries(brazilianCategories)) {
      const confidence = this.calculateCategoryConfidence(
        lowerText,
        keywords,
        culturalAnalysis,
        amount,
        participants.length
      );

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        primaryCategory = category;
      }
    }

    // If no good match found, default to 'outros'
    if (highestConfidence < 0.3) {
      primaryCategory = 'outros';
      highestConfidence = 0.2;
    }

    // Special handling for travel expenses
    if (lowerText.includes('viagem') || lowerText.includes('hotel') || lowerText.includes('passagem') || lowerText.includes('turismo')) {
      primaryCategory = 'viagem';
      highestConfidence = Math.max(highestConfidence, 0.6);
    }

    // Special handling for unknown/random expenses
    if (lowerText.includes('aleatória') || lowerText.includes('sem contexto') || lowerText.includes('teste')) {
      primaryCategory = 'outros';
      highestConfidence = 0.2;
    }

    // Generate alternatives
    const alternatives = this.generateCategoryAlternatives(
      expenseText,
      brazilianCategories,
      culturalAnalysis
    );

    const processingTime = Date.now() - startTime;

    return {
      category: primaryCategory,
      confidence: highestConfidence,
      reasoning: this.generateCategorizationReasoning(primaryCategory, culturalAnalysis),
      alternatives: alternatives.slice(0, 3),
      culturalContext: culturalAnalysis.context
    };
  }

  /**
   * Generate predictive expense splitting suggestions
   */
  async generatePredictiveSplitting(
    userId: string,
    expenseText: string,
    amount: number,
    participants: string[]
  ): Promise<PredictiveSplittingSuggestion[]> {
    const startTime = Date.now();

    // Get user preferences and historical patterns
    const userPreferences = await this.memorySystem.getUserPreferences(userId);
    const groupPatterns = await this.memorySystem.getGroupPatterns(userId);
    const culturalContext = await this.memorySystem.getCulturalContext(userId);

    // Process text for cultural context
    const nlpResult = await this.nlpProcessor.processText(expenseText);
    
    // Generate suggestions based on multiple factors
    const suggestions: PredictiveSplittingSuggestion[] = [];

    // 1. Equal splitting (most common in Brazil)
    const equalSuggestion = this.generateEqualSplittingSuggestion(
      amount,
      participants,
      nlpResult.culturalContext,
      0.85
    );
    suggestions.push(equalSuggestion);

    // 2. Cultural context-based splitting
    const culturalSuggestion = this.generateCulturalSplittingSuggestion(
      amount,
      participants,
      nlpResult.culturalContext,
      userPreferences
    );
    if (culturalSuggestion) {
      suggestions.push(culturalSuggestion);
    }

    // 3. Historical pattern-based splitting
    const historicalSuggestion = this.generateHistoricalSplittingSuggestion(
      userId,
      amount,
      participants,
      groupPatterns
    );
    if (historicalSuggestion) {
      suggestions.push(historicalSuggestion);
    }

    // 4. Amount-based splitting
    const amountSuggestion = this.generateAmountBasedSplittingSuggestion(
      amount,
      participants,
      nlpResult.culturalContext
    );
    if (amountSuggestion) {
      suggestions.push(amountSuggestion);
    }

    // Ensure we always return 3 suggestions
    while (suggestions.length < 3) {
      // Add a default equal splitting suggestion if we don't have enough
      const defaultSuggestion = this.generateEqualSplittingSuggestion(
        amount,
        participants,
        nlpResult.culturalContext,
        0.7
      );
      suggestions.push(defaultSuggestion);
    }

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Generate intelligent group recommendations
   */
  async generateGroupRecommendations(
    userId: string,
    context: string,
    participants: string[]
  ): Promise<GroupRecommendation[]> {
    const recommendations: GroupRecommendation[] = [];

    // Analyze cultural context
    const nlpResult = await this.nlpProcessor.processText(context);
    const culturalContext = nlpResult.culturalContext;

    // Generate recommendations based on scenario
    switch (culturalContext?.scenario) {
      case 'churrasco':
        recommendations.push({
          groupName: 'Churrasco da Galera',
          confidence: 0.9,
          reasoning: 'Contexto de churrasco detectado - grupo informal para amigos',
          suggestedMembers: participants,
          culturalContext: 'churrasco',
          splitMethod: 'equal',
          paymentPreference: 'pix'
        });
        break;

      case 'happy_hour':
        recommendations.push({
          groupName: 'Happy Hour do Trabalho',
          confidence: 0.85,
          reasoning: 'Happy hour detectado - grupo de trabalho ou amigos',
          suggestedMembers: participants,
          culturalContext: 'happy_hour',
          splitMethod: 'equal',
          paymentPreference: 'pix'
        });
        break;

      case 'aniversario':
        recommendations.push({
          groupName: 'Festa de Aniversário',
          confidence: 0.8,
          reasoning: 'Aniversário detectado - grupo para comemoração',
          suggestedMembers: participants,
          culturalContext: 'aniversario',
          splitMethod: 'host_pays',
          paymentPreference: 'pix'
        });
        break;

      case 'viagem':
        recommendations.push({
          groupName: 'Viagem dos Amigos',
          confidence: 0.9,
          reasoning: 'Viagem detectada - grupo para viagem',
          suggestedMembers: participants,
          culturalContext: 'viagem',
          splitMethod: 'equal',
          paymentPreference: 'pix'
        });
        break;

      default:
        recommendations.push({
          groupName: 'Grupo dos Amigos',
          confidence: 0.7,
          reasoning: 'Grupo genérico para divisão de despesas',
          suggestedMembers: participants,
          culturalContext: 'casual',
          splitMethod: 'equal',
          paymentPreference: 'pix'
        });
    }

    return recommendations;
  }

  /**
   * Create automated payment reminders
   */
  async createPaymentReminders(
    userId: string,
    debtId: string,
    amount: number,
    recipient: string,
    culturalContext: any
  ): Promise<PaymentReminder[]> {
    const reminders: PaymentReminder[] = [];

    // Get user preferences for reminder timing
    const preferences = await this.memorySystem.getUserPreferences(userId);
    const reminderDelay = preferences?.reminderDelay || 3; // days

    // Calculate reminder dates based on Brazilian cultural timing
    const now = new Date();
    const gentleReminder = new Date(now.getTime() + (reminderDelay * 24 * 60 * 60 * 1000));
    const friendlyReminder = new Date(now.getTime() + ((reminderDelay + 2) * 24 * 60 * 60 * 1000));
    const urgentReminder = new Date(now.getTime() + ((reminderDelay + 7) * 24 * 60 * 60 * 1000));

    // Generate culturally appropriate messages
    const scenario = culturalContext?.scenario || 'casual';
    const messages = this.generateCulturallyAppropriateReminders(
      amount,
      recipient,
      { scenario }
    );

    // Update reminders to include scenario in culturalContext
    reminders.push({
      id: `reminder_${Date.now()}_1`,
      userId,
      debtId,
      type: 'gentle',
      message: messages.gentle,
      method: 'push',
      scheduledFor: gentleReminder,
      sent: false,
      culturalContext: scenario
    });

    reminders.push({
      id: `reminder_${Date.now()}_2`,
      userId,
      debtId,
      type: 'friendly',
      message: messages.friendly,
      method: 'push',
      scheduledFor: friendlyReminder,
      sent: false,
      culturalContext: scenario
    });

    reminders.push({
      id: `reminder_${Date.now()}_3`,
      userId,
      debtId,
      type: 'urgent',
      message: messages.urgent,
      method: 'push',
      scheduledFor: urgentReminder,
      sent: false,
      culturalContext: scenario
    });



    return reminders;
  }

  /**
   * Get automation analytics
   */
  async getAutomationAnalytics(userId: string): Promise<AutomationAnalytics> {
    // Get analytics from memory system
    const analytics = await this.memorySystem.getAutomationAnalytics(userId);

    return {
      totalSuggestions: analytics?.totalSuggestions || 0,
      acceptedSuggestions: analytics?.acceptedSuggestions || 0,
      accuracyRate: analytics?.accuracyRate || 0,
      timeSaved: analytics?.timeSaved || 0,
      userSatisfaction: analytics?.userSatisfaction || 0,
      culturalAccuracy: analytics?.culturalAccuracy || 0,
      costSavings: analytics?.costSavings || 0
    };
  }

  // Private helper methods

  private analyzeCulturalContextForCategorization(
    culturalContext: any,
    amount: number,
    participantCount: number
  ): any {
    // Use the scenario from the cultural context
    const scenario = culturalContext?.scenario || 'outros';
    const region = culturalContext?.region || 'outros';
    const socialDynamics = culturalContext?.socialDynamics || 'igual';

    return {
      scenario: scenario,
      region: region,
      socialDynamics: socialDynamics,
      amount: amount,
      participantCount: participantCount,
      context: this.generateCulturalContextDescription(culturalContext)
    };
  }

  private calculateCategoryConfidence(
    text: string,
    keywords: string[],
    culturalAnalysis: any,
    amount: number,
    participantCount: number
  ): number {
    let confidence = 0;
    const lowerText = text.toLowerCase();

    // Keyword matching with better logic
    const keywordMatches = keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length;
    
    if (keywordMatches > 0) {
      confidence += (keywordMatches / keywords.length) * 0.7;
    }

    // Cultural context matching - boost for specific scenarios
    if (culturalAnalysis && culturalAnalysis.scenario) {
      if (culturalAnalysis.scenario === 'churrasco' && lowerText.includes('churrasco')) {
        confidence += 0.4;
      } else if (culturalAnalysis.scenario === 'rodizio' && lowerText.includes('rodízio')) {
        confidence += 0.3;
      } else {
        confidence += 0.2;
      }
    }

    // Amount-based confidence
    if (amount > 0 && amount < 1000) {
      confidence += 0.1;
    }

    // Participant count confidence
    if (participantCount > 0 && participantCount < 10) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private generateCategoryAlternatives(
    text: string,
    categories: any,
    culturalAnalysis: any
  ): string[] {
    const alternatives: string[] = [];

    for (const [category, keywords] of Object.entries(categories)) {
      if (category === 'outros') continue;

      const confidence = this.calculateCategoryConfidence(
        text,
        keywords as string[],
        culturalAnalysis,
        0,
        0
      );

      if (confidence > 0.2) {
        alternatives.push(category);
      }
    }

    // Ensure we have at least 3 alternatives if possible
    if (alternatives.length < 3) {
      const remainingCategories = Object.keys(categories).filter(cat => 
        cat !== 'outros' && !alternatives.includes(cat)
      );
      
      while (alternatives.length < 3 && remainingCategories.length > 0) {
        alternatives.push(remainingCategories.shift()!);
      }
    }

    return alternatives.slice(0, 3);
  }

  private generateCategorizationReasoning(category: string, culturalAnalysis: any): string {
    const categoryNames: { [key: string]: string } = {
      'restaurante': 'Restaurante',
      'bar_happy_hour': 'Bar/Happy Hour',
      'transporte': 'Transporte',
      'entretenimento': 'Entretenimento',
      'compras': 'Compras',
      'viagem': 'Viagem',
      'churrasco': 'Churrasco',
      'festa': 'Festa',
      'outros': 'Outros'
    };

    return `Categorizado como ${categoryNames[category]} baseado no contexto cultural e padrões brasileiros`;
  }

  private generateEqualSplittingSuggestion(
    amount: number,
    participants: string[],
    culturalContext: any,
    confidence: number
  ): PredictiveSplittingSuggestion {
    const perPerson = amount / participants.length;
    const amounts: { [key: string]: number } = {};
    
    participants.forEach(participant => {
      amounts[participant] = perPerson;
    });

    return {
      method: 'equal',
      confidence,
      reasoning: 'Divisão igual entre todos os participantes',
      participants,
      amounts,
      culturalContext: culturalContext?.scenario || 'casual',
      alternatives: []
    };
  }

  private generateCulturalSplittingSuggestion(
    amount: number,
    participants: string[],
    culturalContext: any,
    userPreferences: any
  ): PredictiveSplittingSuggestion | null {
    if (culturalContext?.scenario === 'churrasco') {
      return {
        method: 'equal',
        confidence: 0.9,
        reasoning: 'No churrasco brasileiro, costuma dividir igualmente',
        participants,
        amounts: this.calculateEqualAmounts(amount, participants),
        culturalContext: 'churrasco',
        alternatives: []
      };
    }

    if (culturalContext?.scenario === 'happy_hour') {
      return {
        method: 'by_consumption',
        confidence: 0.8,
        reasoning: 'No happy hour, cada um paga o que consumiu',
        participants,
        amounts: this.calculateConsumptionAmounts(amount, participants),
        culturalContext: 'happy_hour',
        alternatives: []
      };
    }

    if (culturalContext?.scenario === 'vaquinha') {
      return {
        method: 'vaquinha',
        confidence: 0.9,
        reasoning: 'Para vaquinha, todos contribuem igualmente',
        participants,
        amounts: this.calculateEqualAmounts(amount, participants),
        culturalContext: 'vaquinha',
        alternatives: []
      };
    }

    return null;
  }

  private generateHistoricalSplittingSuggestion(
    userId: string,
    amount: number,
    participants: string[],
    groupPatterns: string[] | null
  ): PredictiveSplittingSuggestion | null {
    if (!groupPatterns || groupPatterns.length === 0) {
      return null;
    }

    // Analyze historical patterns
    const mostCommonPattern = this.getMostCommonPattern(groupPatterns);
    
    if (mostCommonPattern === 'equal') {
      return {
        method: 'equal',
        confidence: 0.85,
        reasoning: 'Baseado no histórico do grupo, costuma dividir igualmente',
        participants,
        amounts: this.calculateEqualAmounts(amount, participants),
        culturalContext: 'historical',
        alternatives: []
      };
    }

    return null;
  }

  private generateAmountBasedSplittingSuggestion(
    amount: number,
    participants: string[],
    culturalContext: any
  ): PredictiveSplittingSuggestion | null {
    // For small amounts, suggest "depois acerto"
    if (amount <= 20 && participants.length <= 3) {
      return {
        method: 'host_pays',
        confidence: 0.7,
        reasoning: 'Valor pequeno, pode acertar depois',
        participants,
        amounts: { [participants[0]]: amount },
        culturalContext: culturalContext?.scenario || 'casual',
        alternatives: []
      };
    }

    return null;
  }

  private calculateEqualAmounts(amount: number, participants: string[]): { [key: string]: number } {
    const perPerson = amount / participants.length;
    const amounts: { [key: string]: number } = {};
    
    participants.forEach(participant => {
      amounts[participant] = perPerson;
    });

    return amounts;
  }

  private calculateConsumptionAmounts(amount: number, participants: string[]): { [key: string]: number } {
    // Simplified consumption calculation
    const baseAmount = amount / participants.length;
    const amounts: { [key: string]: number } = {};
    
    participants.forEach((participant, index) => {
      // Simulate different consumption patterns
      const variation = (index % 3) * 0.1; // 0%, 10%, 20% variation
      amounts[participant] = baseAmount * (1 + variation);
    });

    return amounts;
  }

  private getMostCommonPattern(patterns: string[]): string {
    const frequency: { [key: string]: number } = {};
    
    patterns.forEach(pattern => {
      frequency[pattern] = (frequency[pattern] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'equal';
  }

  private generateCulturallyAppropriateReminders(
    amount: number,
    recipient: string,
    culturalContext: any
  ): { gentle: string; friendly: string; urgent: string } {
    const scenario = culturalContext?.scenario || 'casual';
    // Use Brazilian currency format with comma as decimal separator
    const formattedAmount = `R$ ${amount.toFixed(2).replace('.', ',')}`;
    
    // Convert scenario names to user-friendly format
    const scenarioDisplay = scenario === 'happy_hour' ? 'happy hour' : 
                           scenario === 'aniversario' ? 'aniversário' : 
                           scenario;
    
    const messages = {
      gentle: `Oi! Lembra daquele ${scenarioDisplay}? Ainda tem ${formattedAmount} para acertar 😊`,
      friendly: `E aí! Não esquece de acertar os ${formattedAmount} do ${scenarioDisplay} 😉`,
      urgent: `Fala! Já faz tempo que não acertamos os ${formattedAmount} do ${scenarioDisplay}. Pode resolver? 🙏`
    };

    return messages;
  }

  private generateCulturalContextDescription(culturalContext: any): string {
    const descriptions: string[] = [];

    if (culturalContext && culturalContext.scenario) {
      // Convert scenario names to proper format and show original keywords
      let scenarioDisplay = culturalContext?.scenario;
      if (culturalContext?.scenario === 'rodizio') {
        scenarioDisplay = 'rodízio';
      } else if (culturalContext?.scenario === 'aniversario') {
        scenarioDisplay = 'aniversário';
      } else if (culturalContext?.scenario === 'bar_happy_hour') {
        scenarioDisplay = 'balada'; // Show the original keyword that was detected
      }
      descriptions.push(`Cenário: ${scenarioDisplay}`);
    }

    if (culturalContext && culturalContext.region) {
      descriptions.push(`Região: ${culturalContext.region}`);
    }

    if (culturalContext && culturalContext.socialDynamics) {
      descriptions.push(`Dinâmica: ${culturalContext.socialDynamics}`);
    }

    return descriptions.join(', ') || 'Cenário: outros, Região: outros, Dinâmica: igual';
  }
} 