import { MemorySystem, UserPreferences, BrazilianContext } from './memory-system';
import { BrazilianCulturalContextAnalyzer } from './cultural-context';

// Preference Learning Types
export interface PreferenceLearningData {
  userId: string;
  interactionType: 'expense_split' | 'group_creation' | 'payment_method' | 'cultural_context';
  data: any;
  timestamp: Date;
  confidence: number;
}

export interface LearnedPreferences {
  splittingMethods: Record<string, number>; // method -> frequency
  culturalContexts: Record<string, number>; // context -> frequency
  regionalVariations: Record<string, number>; // region -> frequency
  paymentMethods: Record<string, number>; // method -> frequency
  groupPatterns: Record<string, number>; // pattern -> frequency
  formalityLevels: Record<string, number>; // level -> frequency
  languagePreferences: Record<string, number>; // language -> frequency
}

export interface PreferenceSuggestion {
  type: 'splitting_method' | 'payment_method' | 'cultural_context' | 'regional_variation';
  value: string;
  confidence: number;
  reason: string;
  alternatives: string[];
}

// Preference Learning Class
export class UserPreferenceLearner {
  private memorySystem: MemorySystem;
  private culturalAnalyzer: BrazilianCulturalContextAnalyzer;
  private learningThreshold = 0.7; // Minimum confidence for learning
  private minInteractions = 3; // Minimum interactions before suggesting

  constructor() {
    this.memorySystem = new MemorySystem();
    this.culturalAnalyzer = new BrazilianCulturalContextAnalyzer();
  }

  /**
   * Learn from user interaction
   */
  async learnFromInteraction(learningData: PreferenceLearningData): Promise<void> {
    // Check if we should learn from this interaction
    if (learningData.confidence < this.learningThreshold) {
      return;
    }

    const existingPreferences = await this.memorySystem.getUserPreferences(learningData.userId);
    const learnedPreferences = await this.getLearnedPreferences(learningData.userId);

    // Update learned preferences based on interaction type
    switch (learningData.interactionType) {
      case 'expense_split':
        await this.learnSplittingMethod(learningData, learnedPreferences);
        break;
      case 'group_creation':
        await this.learnGroupPattern(learningData, learnedPreferences);
        break;
      case 'payment_method':
        await this.learnPaymentMethod(learningData, learnedPreferences);
        break;
      case 'cultural_context':
        await this.learnCulturalContext(learningData, learnedPreferences);
        break;
    }

    // Update user preferences with learned data
    await this.updateUserPreferencesFromLearning(learningData.userId, learnedPreferences);
  }

  /**
   * Learn splitting method preferences
   */
  private async learnSplittingMethod(
    learningData: PreferenceLearningData,
    learnedPreferences: LearnedPreferences
  ): Promise<void> {
    const method = learningData.data.splittingMethod;
    if (method) {
      learnedPreferences.splittingMethods[method] = (learnedPreferences.splittingMethods[method] || 0) + 1;
    }
  }

  /**
   * Learn group interaction patterns
   */
  private async learnGroupPattern(
    learningData: PreferenceLearningData,
    learnedPreferences: LearnedPreferences
  ): Promise<void> {
    const pattern = learningData.data.groupPattern;
    if (pattern) {
      learnedPreferences.groupPatterns[pattern] = (learnedPreferences.groupPatterns[pattern] || 0) + 1;
    }
  }

  /**
   * Learn payment method preferences
   */
  private async learnPaymentMethod(
    learningData: PreferenceLearningData,
    learnedPreferences: LearnedPreferences
  ): Promise<void> {
    const method = learningData.data.paymentMethod;
    if (method) {
      learnedPreferences.paymentMethods[method] = (learnedPreferences.paymentMethods[method] || 0) + 1;
    }
  }

  /**
   * Learn cultural context preferences
   */
  private async learnCulturalContext(
    learningData: PreferenceLearningData,
    learnedPreferences: LearnedPreferences
  ): Promise<void> {
    const context = learningData.data.culturalContext;
    if (context) {
      learnedPreferences.culturalContexts[context] = (learnedPreferences.culturalContexts[context] || 0) + 1;
    }

    const region = learningData.data.region;
    if (region) {
      learnedPreferences.regionalVariations[region] = (learnedPreferences.regionalVariations[region] || 0) + 1;
    }

    const formality = learningData.data.formalityLevel;
    if (formality) {
      learnedPreferences.formalityLevels[formality] = (learnedPreferences.formalityLevels[formality] || 0) + 1;
    }
  }

  /**
   * Get learned preferences for user
   */
  async getLearnedPreferences(userId: string): Promise<LearnedPreferences> {
    const preferencesId = `learned_preferences:${userId}`;
    const preferencesData = await this.memorySystem['redis'].get(preferencesId);

    if (!preferencesData) {
      return {
        splittingMethods: {},
        culturalContexts: {},
        regionalVariations: {},
        paymentMethods: {},
        groupPatterns: {},
        formalityLevels: {},
        languagePreferences: {}
      };
    }

    return JSON.parse(preferencesData) as LearnedPreferences;
  }

  /**
   * Update user preferences from learned data
   */
  private async updateUserPreferencesFromLearning(
    userId: string,
    learnedPreferences: LearnedPreferences
  ): Promise<void> {
    const existingPreferences = await this.memorySystem.getUserPreferences(userId);
    const updatedPreferences: Partial<UserPreferences> = {};

    // Determine preferred splitting method
    const preferredSplittingMethod = this.getMostFrequent(learnedPreferences.splittingMethods);
    if (preferredSplittingMethod) {
      updatedPreferences.preferredSplittingMethod = preferredSplittingMethod;
    }

    // Determine cultural context
    const preferredCulturalContext = this.getMostFrequent(learnedPreferences.culturalContexts);
    if (preferredCulturalContext) {
      updatedPreferences.culturalContext = preferredCulturalContext;
    }

    // Determine regional variations
    const regionalVariations = Object.keys(learnedPreferences.regionalVariations)
      .filter(region => learnedPreferences.regionalVariations[region] >= this.minInteractions)
      .sort((a, b) => learnedPreferences.regionalVariations[b] - learnedPreferences.regionalVariations[a]);

    if (regionalVariations.length > 0) {
      updatedPreferences.regionalVariations = regionalVariations;
    }

    // Determine payment methods
    const paymentMethods = Object.keys(learnedPreferences.paymentMethods)
      .filter(method => learnedPreferences.paymentMethods[method] >= this.minInteractions)
      .sort((a, b) => learnedPreferences.paymentMethods[b] - learnedPreferences.paymentMethods[a]);

    if (paymentMethods.length > 0) {
      updatedPreferences.paymentMethods = paymentMethods;
    }

    // Determine group interaction patterns
    const groupPatterns = Object.keys(learnedPreferences.groupPatterns)
      .filter(pattern => learnedPreferences.groupPatterns[pattern] >= this.minInteractions)
      .sort((a, b) => learnedPreferences.groupPatterns[b] - learnedPreferences.groupPatterns[a]);

    if (groupPatterns.length > 0) {
      updatedPreferences.groupInteractionPatterns = groupPatterns;
    }

    // Determine language preference
    const languagePreferences = Object.keys(learnedPreferences.languagePreferences)
      .filter(lang => learnedPreferences.languagePreferences[lang] >= this.minInteractions)
      .sort((a, b) => learnedPreferences.languagePreferences[b] - learnedPreferences.languagePreferences[a]);

    if (languagePreferences.length > 0) {
      updatedPreferences.languagePreference = languagePreferences[0];
    }

    // Update preferences if we have new data
    if (Object.keys(updatedPreferences).length > 0) {
      await this.memorySystem.updateUserPreferences(userId, updatedPreferences);
    }

    // Store learned preferences
    const learnedPreferencesId = `learned_preferences:${userId}`;
    await this.memorySystem['redis'].setex(
      learnedPreferencesId,
      365 * 24 * 60 * 60, // 1 year
      JSON.stringify(learnedPreferences)
    );
  }

  /**
   * Get most frequent value from a frequency map
   */
  private getMostFrequent(frequencyMap: Record<string, number>): string | null {
    const entries = Object.entries(frequencyMap);
    if (entries.length === 0) return null;

    return entries
      .filter(([_, count]) => count >= this.minInteractions)
      .sort(([_, a], [__, b]) => b - a)[0]?.[0] || null;
  }

  /**
   * Generate preference suggestions
   */
  async generateSuggestions(userId: string, context: string): Promise<PreferenceSuggestion[]> {
    const learnedPreferences = await this.getLearnedPreferences(userId);
    const suggestions: PreferenceSuggestion[] = [];

    // Suggest splitting method
    const preferredSplittingMethod = this.getMostFrequent(learnedPreferences.splittingMethods);
    if (preferredSplittingMethod) {
      suggestions.push({
        type: 'splitting_method',
        value: preferredSplittingMethod,
        confidence: this.calculateConfidence(learnedPreferences.splittingMethods[preferredSplittingMethod]),
        reason: `Based on your previous ${learnedPreferences.splittingMethods[preferredSplittingMethod]} interactions`,
        alternatives: this.getAlternatives(learnedPreferences.splittingMethods, preferredSplittingMethod)
      });
    }

    // Suggest payment method
    const preferredPaymentMethod = this.getMostFrequent(learnedPreferences.paymentMethods);
    if (preferredPaymentMethod) {
      suggestions.push({
        type: 'payment_method',
        value: preferredPaymentMethod,
        confidence: this.calculateConfidence(learnedPreferences.paymentMethods[preferredPaymentMethod]),
        reason: `Based on your preferred payment method`,
        alternatives: this.getAlternatives(learnedPreferences.paymentMethods, preferredPaymentMethod)
      });
    }

    // Suggest cultural context
    const preferredCulturalContext = this.getMostFrequent(learnedPreferences.culturalContexts);
    if (preferredCulturalContext) {
      suggestions.push({
        type: 'cultural_context',
        value: preferredCulturalContext,
        confidence: this.calculateConfidence(learnedPreferences.culturalContexts[preferredCulturalContext]),
        reason: `Based on your cultural preferences`,
        alternatives: this.getAlternatives(learnedPreferences.culturalContexts, preferredCulturalContext)
      });
    }

    // Suggest regional variation
    const preferredRegion = this.getMostFrequent(learnedPreferences.regionalVariations);
    if (preferredRegion) {
      suggestions.push({
        type: 'regional_variation',
        value: preferredRegion,
        confidence: this.calculateConfidence(learnedPreferences.regionalVariations[preferredRegion]),
        reason: `Based on your regional preferences`,
        alternatives: this.getAlternatives(learnedPreferences.regionalVariations, preferredRegion)
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate confidence based on frequency
   */
  private calculateConfidence(frequency: number): number {
    if (frequency < this.minInteractions) return 0;
    return Math.min(frequency / 10, 1.0); // Max confidence at 10 interactions
  }

  /**
   * Get alternative suggestions
   */
  private getAlternatives(frequencyMap: Record<string, number>, preferred: string): string[] {
    return Object.entries(frequencyMap)
      .filter(([key, count]) => key !== preferred && count >= this.minInteractions)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([key, _]) => key);
  }

  /**
   * Learn from conversation context
   */
  async learnFromConversation(userId: string, conversationText: string, userResponse: string): Promise<void> {
    // Analyze cultural context from conversation
    const culturalContext = this.culturalAnalyzer.analyzeCulturalContext(conversationText);
    
    // Extract payment method from user response
    const paymentMethod = this.extractPaymentMethod(userResponse);
    
    // Extract splitting method from conversation
    const splittingMethod = this.extractSplittingMethod(conversationText);
    
    // Create learning data
    const learningData: PreferenceLearningData = {
      userId,
      interactionType: 'expense_split',
      data: {
        splittingMethod,
        paymentMethod,
        culturalContext: culturalContext.scenario,
        region: culturalContext.region,
        formalityLevel: culturalContext.formalityLevel
      },
      timestamp: new Date(),
      confidence: culturalContext.confidence
    };

    await this.learnFromInteraction(learningData);
  }

  /**
   * Extract payment method from text
   */
  private extractPaymentMethod(text: string): string | null {
    const paymentPatterns = {
      'pix': /pix|PIX/gi,
      'cartao': /cartao|cartão|credito|crédito/gi,
      'dinheiro': /dinheiro|dinheiro vivo/gi,
      'boleto': /boleto/gi,
      'transferencia': /transferencia|transferência/gi
    };

    for (const [method, pattern] of Object.entries(paymentPatterns)) {
      if (pattern.test(text)) {
        return method;
      }
    }

    return null;
  }

  /**
   * Extract splitting method from text
   */
  private extractSplittingMethod(text: string): string | null {
    const splittingPatterns = {
      'equal': /igual|mesmo|mesma|rodada/gi,
      'by_consumption': /consumo|consumiu|consumido/gi,
      'host_pays': /eu pago|pago agora|anfitriao/gi,
      'vaquinha': /vaquinha|contribuicao|contribuição/gi,
      'by_family': /familia|familiar/gi,
      'complex': /complexo|diferente|especial/gi
    };

    for (const [method, pattern] of Object.entries(splittingPatterns)) {
      if (pattern.test(text)) {
        return method;
      }
    }

    return null;
  }

  /**
   * Get user preference summary
   */
  async getUserPreferenceSummary(userId: string): Promise<any> {
    const learnedPreferences = await this.getLearnedPreferences(userId);
    const userPreferences = await this.memorySystem.getUserPreferences(userId);

    return {
      userId,
      summaryDate: new Date(),
      learnedPreferences,
      currentPreferences: userPreferences,
      totalInteractions: this.calculateTotalInteractions(learnedPreferences),
      mostUsedMethods: this.getMostUsedMethods(learnedPreferences),
      culturalProfile: this.getCulturalProfile(learnedPreferences)
    };
  }

  /**
   * Calculate total interactions
   */
  private calculateTotalInteractions(learnedPreferences: LearnedPreferences): number {
    return Object.values(learnedPreferences.splittingMethods).reduce((sum, count) => sum + count, 0);
  }

  /**
   * Get most used methods
   */
  private getMostUsedMethods(learnedPreferences: LearnedPreferences): Record<string, string> {
    return {
      splittingMethod: this.getMostFrequent(learnedPreferences.splittingMethods) || 'equal',
      paymentMethod: this.getMostFrequent(learnedPreferences.paymentMethods) || 'pix',
      culturalContext: this.getMostFrequent(learnedPreferences.culturalContexts) || 'restaurante',
      region: this.getMostFrequent(learnedPreferences.regionalVariations) || 'sao_paulo'
    };
  }

  /**
   * Get cultural profile
   */
  private getCulturalProfile(learnedPreferences: LearnedPreferences): any {
    return {
      preferredFormalityLevel: this.getMostFrequent(learnedPreferences.formalityLevels) || 'informal',
      regionalPreferences: Object.entries(learnedPreferences.regionalVariations)
        .filter(([_, count]) => count >= this.minInteractions)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 3)
        .map(([region, count]) => ({ region, frequency: count })),
      culturalPatterns: Object.entries(learnedPreferences.culturalContexts)
        .filter(([_, count]) => count >= this.minInteractions)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 3)
        .map(([context, count]) => ({ context, frequency: count }))
    };
  }
} 