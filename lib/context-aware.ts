import { MemorySystem, UserPreferences, BrazilianContext } from './memory-system';
import { UserPreferenceLearner, PreferenceSuggestion } from './user-preferences';
import { BrazilianCulturalContextAnalyzer, BrazilianCulturalContext } from './cultural-context';

// Context-Aware Types
export interface ContextAwareSuggestion {
  type: 'splitting_method' | 'payment_method' | 'cultural_context' | 'group_pattern';
  value: string;
  confidence: number;
  reason: string;
  context: string;
  alternatives: string[];
  culturalRelevance: number;
}

export interface ContextAwareResult {
  userId: string;
  conversationId: string;
  suggestions: ContextAwareSuggestion[];
  appliedPreferences: Partial<UserPreferences>;
  culturalContext: BrazilianContext | null;
  confidence: number;
  processingTime: number;
}

export interface GroupPatternRecognition {
  groupId: string;
  patterns: string[];
  frequency: Record<string, number>;
  confidence: number;
  suggestions: string[];
}

// Context-Aware Class
export class ContextAwareProcessor {
  private memorySystem: MemorySystem;
  private preferenceLearner: UserPreferenceLearner;
  private culturalAnalyzer: BrazilianCulturalContextAnalyzer;

  constructor() {
    this.memorySystem = new MemorySystem();
    this.preferenceLearner = new UserPreferenceLearner();
    this.culturalAnalyzer = new BrazilianCulturalContextAnalyzer();
  }

  /**
   * Process context-aware expense splitting
   */
  async processContextAwareSplitting(
    userId: string,
    conversationId: string,
    expenseText: string,
    groupId?: string
  ): Promise<ContextAwareResult> {
    const startTime = Date.now();

    // Get user preferences and cultural context
    const userPreferences = await this.memorySystem.getUserPreferences(userId);
    const culturalContext = await this.memorySystem.getCulturalContext(userId);
    const groupPatterns = groupId ? await this.memorySystem.getGroupPatterns(groupId) : null;

    // Analyze current conversation context
    const currentCulturalContext = this.culturalAnalyzer.analyzeCulturalContext(expenseText);
    
    // Generate context-aware suggestions
    const suggestions = await this.generateContextAwareSuggestions(
      userId,
      expenseText,
      userPreferences,
      culturalContext,
      groupPatterns,
      currentCulturalContext
    );

    // Apply learned preferences
    const appliedPreferences = await this.applyLearnedPreferences(userId, expenseText);

    // Store conversation memory
    await this.storeConversationContext(userId, conversationId, expenseText, groupId);

    const processingTime = Date.now() - startTime;

    return {
      userId,
      conversationId,
      suggestions,
      appliedPreferences,
      culturalContext: culturalContext || this.convertCulturalContext(currentCulturalContext),
      confidence: this.calculateOverallConfidence(suggestions, appliedPreferences),
      processingTime
    };
  }

  /**
   * Generate context-aware suggestions
   */
  private async generateContextAwareSuggestions(
    userId: string,
    expenseText: string,
    userPreferences: UserPreferences | null,
    culturalContext: BrazilianContext | null,
    groupPatterns: string[] | null,
    currentCulturalContext: any
  ): Promise<ContextAwareSuggestion[]> {
    const suggestions: ContextAwareSuggestion[] = [];

    // Get preference-based suggestions
    const preferenceSuggestions = await this.preferenceLearner.generateSuggestions(userId, expenseText);

    // Convert preference suggestions to context-aware suggestions
    for (const suggestion of preferenceSuggestions) {
      const culturalRelevance = this.calculateCulturalRelevance(suggestion, currentCulturalContext);
      
      suggestions.push({
        type: this.mapSuggestionType(suggestion.type),
        value: suggestion.value,
        confidence: suggestion.confidence,
        reason: suggestion.reason,
        context: this.getContextDescription(suggestion, currentCulturalContext),
        alternatives: suggestion.alternatives,
        culturalRelevance
      });
    }

    // Add group pattern suggestions
    if (groupPatterns && groupPatterns.length > 0) {
      const groupSuggestion = this.generateGroupPatternSuggestion(groupPatterns, currentCulturalContext);
      if (groupSuggestion) {
        suggestions.push(groupSuggestion);
      }
    }

    // Add cultural context suggestions
    if (culturalContext) {
      const culturalSuggestion = this.generateCulturalContextSuggestion(culturalContext, currentCulturalContext);
      if (culturalSuggestion) {
        suggestions.push(culturalSuggestion);
      }
    }

    // Add current context suggestions
    const currentContextSuggestion = this.generateCurrentContextSuggestion(currentCulturalContext);
    if (currentContextSuggestion) {
      suggestions.push(currentContextSuggestion);
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate cultural relevance
   */
  private calculateCulturalRelevance(suggestion: PreferenceSuggestion, currentContext: any): number {
    let relevance = 0.5; // Base relevance

    // Check if suggestion matches current cultural context
    if (suggestion.type === 'cultural_context' && currentContext.scenario) {
      if (suggestion.value === currentContext.scenario) {
        relevance += 0.3;
      }
    }

    // Check regional relevance
    if (suggestion.type === 'regional_variation' && currentContext.region) {
      if (suggestion.value === currentContext.region) {
        relevance += 0.2;
      }
    }

    // Check formality level relevance
    if (currentContext.formalityLevel) {
      if (suggestion.value.includes('formal') && currentContext.formalityLevel === 'formal') {
        relevance += 0.1;
      } else if (suggestion.value.includes('informal') && currentContext.formalityLevel === 'informal') {
        relevance += 0.1;
      }
    }

    return Math.min(relevance, 1.0);
  }

  /**
   * Get context description
   */
  private getContextDescription(suggestion: PreferenceSuggestion, currentContext: any): string {
    const contextParts: string[] = [];

    if (currentContext.scenario) {
      contextParts.push(`Contexto: ${currentContext.scenario}`);
    }

    if (currentContext.region) {
      contextParts.push(`Região: ${currentContext.region}`);
    }

    if (currentContext.formalityLevel) {
      contextParts.push(`Formalidade: ${currentContext.formalityLevel}`);
    }

    return contextParts.join(', ');
  }

  /**
   * Generate group pattern suggestion
   */
  private generateGroupPatternSuggestion(
    groupPatterns: string[],
    currentContext: any
  ): ContextAwareSuggestion | null {
    if (groupPatterns.length === 0) return null;

    // Find most relevant pattern
    const relevantPattern = groupPatterns.find(pattern => 
      pattern.toLowerCase().includes(currentContext.scenario?.toLowerCase() || '')
    ) || groupPatterns[0];

    return {
      type: 'group_pattern',
      value: relevantPattern,
      confidence: 0.8,
      reason: `Baseado no padrão do grupo: ${relevantPattern}`,
      context: `Padrões do grupo aplicados`,
      alternatives: groupPatterns.filter(p => p !== relevantPattern).slice(0, 2),
      culturalRelevance: 0.7
    };
  }

  /**
   * Generate cultural context suggestion
   */
  private generateCulturalContextSuggestion(
    culturalContext: BrazilianContext,
    currentContext: any
  ): ContextAwareSuggestion | null {
    const relevantPattern = culturalContext.culturalPatterns.find(pattern =>
      pattern.toLowerCase().includes(currentContext.scenario?.toLowerCase() || '')
    );

    if (!relevantPattern) return null;

    return {
      type: 'cultural_context',
      value: relevantPattern,
      confidence: 0.9,
      reason: `Baseado no seu contexto cultural: ${relevantPattern}`,
      context: `Região: ${culturalContext.region}, Padrões: ${culturalContext.culturalPatterns.join(', ')}`,
      alternatives: culturalContext.culturalPatterns.filter(p => p !== relevantPattern).slice(0, 2),
      culturalRelevance: 0.9
    };
  }

  /**
   * Generate current context suggestion
   */
  private generateCurrentContextSuggestion(currentContext: any): ContextAwareSuggestion | null {
    if (!currentContext.scenario) return null;

    const scenarioSuggestions: Record<string, string> = {
      'rodizio': 'equal',
      'happy_hour': 'by_consumption',
      'churrasco': 'by_family',
      'aniversario': 'host_pays',
      'vaquinha': 'vaquinha',
      'restaurante': 'equal'
    };

    const suggestedMethod = scenarioSuggestions[currentContext.scenario];
    if (!suggestedMethod) return null;

    return {
      type: 'splitting_method',
      value: suggestedMethod,
      confidence: 0.85,
      reason: `Baseado no contexto atual: ${currentContext.scenario}`,
      context: `Cenário detectado: ${currentContext.scenario}`,
      alternatives: Object.values(scenarioSuggestions).filter(m => m !== suggestedMethod).slice(0, 2),
      culturalRelevance: 0.8
    };
  }

  /**
   * Apply learned preferences
   */
  private async applyLearnedPreferences(userId: string, expenseText: string): Promise<Partial<UserPreferences>> {
    const userPreferences = await this.memorySystem.getUserPreferences(userId);
    const appliedPreferences: Partial<UserPreferences> = {};

    if (!userPreferences) return appliedPreferences;

    // Apply preferred splitting method if available
    if (userPreferences.preferredSplittingMethod) {
      appliedPreferences.preferredSplittingMethod = userPreferences.preferredSplittingMethod;
    }

    // Apply cultural context
    if (userPreferences.culturalContext) {
      appliedPreferences.culturalContext = userPreferences.culturalContext;
    }

    // Apply regional variations
    if (userPreferences.regionalVariations && userPreferences.regionalVariations.length > 0) {
      appliedPreferences.regionalVariations = userPreferences.regionalVariations;
    }

    // Apply payment methods
    if (userPreferences.paymentMethods && userPreferences.paymentMethods.length > 0) {
      appliedPreferences.paymentMethods = userPreferences.paymentMethods;
    }

    // Apply group interaction patterns
    if (userPreferences.groupInteractionPatterns && userPreferences.groupInteractionPatterns.length > 0) {
      appliedPreferences.groupInteractionPatterns = userPreferences.groupInteractionPatterns;
    }

    // Apply language preference
    if (userPreferences.languagePreference) {
      appliedPreferences.languagePreference = userPreferences.languagePreference;
    }

    return appliedPreferences;
  }

  /**
   * Store conversation context
   */
  private async storeConversationContext(
    userId: string,
    conversationId: string,
    expenseText: string,
    groupId?: string
  ): Promise<void> {
    const culturalContext = this.culturalAnalyzer.analyzeCulturalContext(expenseText);
    
    // Create messages for memory
    const messages = [
      {
        id: `msg_${Date.now()}`,
        role: 'user' as const,
        content: expenseText,
        timestamp: new Date(),
        metadata: { culturalContext }
      }
    ];

    // Get user preferences for storage
    const userPreferences = await this.memorySystem.getUserPreferences(userId);

    // Store in memory system
    await this.memorySystem.storeConversationMemory(
      userId,
      conversationId,
      messages,
      groupId,
      userPreferences || undefined,
      this.convertCulturalContext(culturalContext) || undefined
    );

    // Learn from this interaction
    await this.preferenceLearner.learnFromConversation(userId, expenseText, expenseText);
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    suggestions: ContextAwareSuggestion[],
    appliedPreferences: Partial<UserPreferences>
  ): number {
    if (suggestions.length === 0) return 0.5;

    const avgSuggestionConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
    const avgCulturalRelevance = suggestions.reduce((sum, s) => sum + s.culturalRelevance, 0) / suggestions.length;
    
    const preferenceConfidence = Object.keys(appliedPreferences).length > 0 ? 0.8 : 0.5;

    return (avgSuggestionConfidence + avgCulturalRelevance + preferenceConfidence) / 3;
  }

  /**
   * Recognize group patterns
   */
  async recognizeGroupPatterns(groupId: string, interactions: string[]): Promise<GroupPatternRecognition> {
    const patterns: string[] = [];
    const frequency: Record<string, number> = {};

    // Analyze each interaction for patterns
    for (const interaction of interactions) {
      const culturalContext = this.culturalAnalyzer.analyzeCulturalContext(interaction);
      
      if (culturalContext.scenario) {
        patterns.push(culturalContext.scenario);
        frequency[culturalContext.scenario] = (frequency[culturalContext.scenario] || 0) + 1;
      }

      if (culturalContext.socialDynamics) {
        patterns.push(culturalContext.socialDynamics);
        frequency[culturalContext.socialDynamics] = (frequency[culturalContext.socialDynamics] || 0) + 1;
      }
    }

    // Calculate confidence based on pattern consistency
    const uniquePatterns = Object.keys(frequency);
    const confidence = uniquePatterns.length > 0 ? Math.min(uniquePatterns.length / 5, 1.0) : 0;

    // Generate suggestions based on patterns
    const suggestions = this.generateGroupSuggestions(patterns, frequency);

    // Store group patterns
    await this.memorySystem.storeGroupPatterns(groupId, patterns);

    return {
      groupId,
      patterns,
      frequency,
      confidence,
      suggestions
    };
  }

  /**
   * Generate group suggestions
   */
  private generateGroupSuggestions(patterns: string[], frequency: Record<string, number>): string[] {
    const suggestions: string[] = [];

    // Most frequent pattern
    const mostFrequent = Object.entries(frequency)
      .sort(([_, a], [__, b]) => b - a)[0];

    if (mostFrequent) {
      suggestions.push(`Padrão mais comum: ${mostFrequent[0]} (${mostFrequent[1]} vezes)`);
    }

    // Cultural context suggestions
    const culturalPatterns = patterns.filter(p => 
      ['rodizio', 'happy_hour', 'churrasco', 'aniversario', 'vaquinha'].includes(p)
    );

    if (culturalPatterns.length > 0) {
      suggestions.push(`Contextos culturais: ${culturalPatterns.join(', ')}`);
    }

    // Social dynamics suggestions
    const socialPatterns = patterns.filter(p => 
      ['igual', 'por_consumo', 'anfitriao_paga', 'vaquinha', 'por_familia'].includes(p)
    );

    if (socialPatterns.length > 0) {
      suggestions.push(`Dinâmicas sociais: ${socialPatterns.join(', ')}`);
    }

    return suggestions;
  }

  /**
   * Get context-aware analytics
   */
  async getContextAwareAnalytics(userId: string): Promise<any> {
    const userPreferences = await this.memorySystem.getUserPreferences(userId);
    const culturalContext = await this.memorySystem.getCulturalContext(userId);
    const preferenceSummary = await this.preferenceLearner.getUserPreferenceSummary(userId);

    return {
      userId,
      analyticsDate: new Date(),
      userPreferences,
      culturalContext,
      preferenceSummary,
      contextAwareFeatures: {
        totalSuggestions: preferenceSummary.totalInteractions,
        averageConfidence: 0.85, // This would be calculated from actual data
        culturalRelevance: 0.9,
        preferenceAccuracy: 0.88
      }
    };
  }

  /**
   * Map suggestion type to ContextAwareSuggestion type
   */
  private mapSuggestionType(type: string): 'splitting_method' | 'payment_method' | 'cultural_context' | 'group_pattern' {
    switch (type) {
      case 'regional_variation':
        return 'cultural_context';
      case 'splitting_method':
      case 'payment_method':
      case 'cultural_context':
      case 'group_pattern':
        return type as any;
      default:
        return 'cultural_context';
    }
  }

  /**
   * Convert BrazilianCulturalContext to BrazilianContext
   */
  private convertCulturalContext(context: BrazilianCulturalContext | BrazilianContext | null): BrazilianContext | null {
    if (!context) return null;
    
    // If it's already a BrazilianContext, return it
    if ('culturalPatterns' in context && 'paymentPreferences' in context) {
      return context as BrazilianContext;
    }
    
    // Convert BrazilianCulturalContext to BrazilianContext
    const culturalContext = context as any;
    return {
      region: culturalContext.region || 'sao_paulo',
      culturalPatterns: [culturalContext.scenario || 'outros'],
      socialDynamics: [culturalContext.socialDynamics || 'igual'],
      paymentPreferences: [culturalContext.paymentMethod || 'pix'],
      formalityLevel: culturalContext.formalityLevel || 'informal'
    };
  }
} 