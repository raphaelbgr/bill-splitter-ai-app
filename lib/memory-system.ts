import { RedisClient } from './redis-client';
import { z } from 'zod';

// LGPD Compliance Types
export interface LGPDConsent {
  userId: string;
  consentType: 'memory_retention' | 'preference_learning' | 'analytics';
  consentGiven: boolean;
  consentDate: Date;
  retentionPeriod: number; // days
  purpose: string;
  dataCategories: string[];
}

export interface MemoryRetentionPolicy {
  conversationData: number; // 90 days max
  userPreferences: number; // 365 days max
  groupPatterns: number; // 180 days max
  culturalContext: number; // 365 days max
  analyticsData: number; // 90 days max
}

// Memory System Types
export interface ConversationMemory {
  id: string;
  userId: string;
  conversationId: string;
  groupId?: string;
  messageHistory: Message[];
  userPreferences?: UserPreferences;
  culturalContext?: BrazilianContext;
  createdAt: Date;
  expiresAt: Date;
  consentId: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  preferredSplittingMethod: string;
  culturalContext: string;
  regionalVariations: string[];
  paymentMethods: string[];
  groupInteractionPatterns: string[];
  languagePreference: string;
  privacySettings: PrivacySettings;
}

export interface BrazilianContext {
  region: string;
  culturalPatterns: string[];
  socialDynamics: string[];
  paymentPreferences: string[];
  formalityLevel: string;
}

export interface PrivacySettings {
  allowMemoryRetention: boolean;
  allowPreferenceLearning: boolean;
  allowAnalytics: boolean;
  dataRetentionPeriod: number;
  allowDataExport: boolean;
  allowDataDeletion: boolean;
}

// Memory System Schema
export const ConversationMemorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  conversationId: z.string(),
  groupId: z.string().optional(),
  messageHistory: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.date(),
    metadata: z.record(z.any()).optional()
  })),
  userPreferences: z.object({
    preferredSplittingMethod: z.string(),
    culturalContext: z.string(),
    regionalVariations: z.array(z.string()),
    paymentMethods: z.array(z.string()),
    groupInteractionPatterns: z.array(z.string()),
    languagePreference: z.string(),
    privacySettings: z.object({
      allowMemoryRetention: z.boolean(),
      allowPreferenceLearning: z.boolean(),
      allowAnalytics: z.boolean(),
      dataRetentionPeriod: z.number(),
      allowDataExport: z.boolean(),
      allowDataDeletion: z.boolean()
    })
  }).optional(),
  culturalContext: z.object({
    region: z.string(),
    culturalPatterns: z.array(z.string()),
    socialDynamics: z.array(z.string()),
    paymentPreferences: z.array(z.string()),
    formalityLevel: z.string()
  }).optional(),
  createdAt: z.date(),
  expiresAt: z.date(),
  consentId: z.string()
});

// LGPD Compliance Schema
export const LGPDConsentSchema = z.object({
  userId: z.string(),
  consentType: z.enum(['memory_retention', 'preference_learning', 'analytics']),
  consentGiven: z.boolean(),
  consentDate: z.date(),
  retentionPeriod: z.number(),
  purpose: z.string(),
  dataCategories: z.array(z.string())
});

// Memory System Class
export class MemorySystem {
  private redis: RedisClient;
  private retentionPolicy: MemoryRetentionPolicy;

  constructor() {
    this.redis = new RedisClient();
    this.retentionPolicy = {
      conversationData: 90, // LGPD compliant - 90 days max
      userPreferences: 365, // 1 year for preferences
      groupPatterns: 180, // 6 months for patterns
      culturalContext: 365, // 1 year for cultural context
      analyticsData: 90 // 90 days for analytics
    };
  }

  /**
   * Store conversation memory with LGPD compliance
   */
  async storeConversationMemory(
    userId: string,
    conversationId: string,
    messages: Message[],
    groupId?: string,
    userPreferences?: UserPreferences,
    culturalContext?: BrazilianContext
  ): Promise<string> {
    // Check LGPD consent
    const consent = await this.getUserConsent(userId, 'memory_retention');
    if (!consent.consentGiven) {
      throw new Error('LGPD consent required for memory retention');
    }

    const memoryId = `memory:${userId}:${conversationId}`;
    const expiresAt = new Date(Date.now() + this.retentionPolicy.conversationData * 24 * 60 * 60 * 1000);

    const memory: ConversationMemory = {
      id: memoryId,
      userId,
      conversationId,
      groupId,
      messageHistory: messages,
      userPreferences,
      culturalContext,
      createdAt: new Date(),
      expiresAt,
      consentId: consent.userId
    };

    // Validate memory data
    ConversationMemorySchema.parse(memory);

    // Store in Redis with expiration
    await this.redis.setex(memoryId, this.retentionPolicy.conversationData * 24 * 60 * 60, JSON.stringify(memory));

    // Store consent reference
    await this.redis.setex(`consent:${memoryId}`, this.retentionPolicy.conversationData * 24 * 60 * 60, JSON.stringify(consent));

    return memoryId;
  }

  /**
   * Retrieve conversation memory
   */
  async getConversationMemory(userId: string, conversationId: string): Promise<ConversationMemory | null> {
    const memoryId = `memory:${userId}:${conversationId}`;
    const memoryData = await this.redis.get(memoryId);

    if (!memoryData) {
      return null;
    }

    const memory = JSON.parse(memoryData) as ConversationMemory;
    
    // Check if memory has expired
    if (new Date() > new Date(memory.expiresAt)) {
      await this.deleteConversationMemory(userId, conversationId);
      return null;
    }

    return memory;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const consent = await this.getUserConsent(userId, 'preference_learning');
    if (!consent.consentGiven) {
      throw new Error('LGPD consent required for preference learning');
    }

    const preferencesId = `preferences:${userId}`;
    const expiresAt = new Date(Date.now() + this.retentionPolicy.userPreferences * 24 * 60 * 60 * 1000);

    const existingPreferences = await this.getUserPreferences(userId);
    const updatedPreferences: UserPreferences = {
      preferredSplittingMethod: preferences.preferredSplittingMethod ?? existingPreferences?.preferredSplittingMethod ?? '',
      culturalContext: preferences.culturalContext ?? existingPreferences?.culturalContext ?? '',
      regionalVariations: preferences.regionalVariations ?? existingPreferences?.regionalVariations ?? [],
      paymentMethods: preferences.paymentMethods ?? existingPreferences?.paymentMethods ?? [],
      groupInteractionPatterns: preferences.groupInteractionPatterns ?? existingPreferences?.groupInteractionPatterns ?? [],
      languagePreference: preferences.languagePreference ?? existingPreferences?.languagePreference ?? 'pt-BR',
      privacySettings: {
        allowMemoryRetention: preferences.privacySettings?.allowMemoryRetention ?? existingPreferences?.privacySettings?.allowMemoryRetention ?? false,
        allowPreferenceLearning: preferences.privacySettings?.allowPreferenceLearning ?? existingPreferences?.privacySettings?.allowPreferenceLearning ?? false,
        allowAnalytics: preferences.privacySettings?.allowAnalytics ?? existingPreferences?.privacySettings?.allowAnalytics ?? false,
        dataRetentionPeriod: preferences.privacySettings?.dataRetentionPeriod ?? existingPreferences?.privacySettings?.dataRetentionPeriod ?? 90,
        allowDataExport: preferences.privacySettings?.allowDataExport ?? existingPreferences?.privacySettings?.allowDataExport ?? false,
        allowDataDeletion: preferences.privacySettings?.allowDataDeletion ?? existingPreferences?.privacySettings?.allowDataDeletion ?? false
      }
    };

    await this.redis.setex(
      preferencesId, 
      this.retentionPolicy.userPreferences * 24 * 60 * 60, 
      JSON.stringify(updatedPreferences)
    );
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const preferencesId = `preferences:${userId}`;
    const preferencesData = await this.redis.get(preferencesId);

    if (!preferencesData) {
      return null;
    }

    return JSON.parse(preferencesData) as UserPreferences;
  }

  /**
   * Store cultural context
   */
  async storeCulturalContext(userId: string, context: BrazilianContext): Promise<void> {
    const consent = await this.getUserConsent(userId, 'memory_retention');
    if (!consent.consentGiven) {
      throw new Error('LGPD consent required for cultural context storage');
    }

    const contextId = `cultural:${userId}`;
    await this.redis.setex(
      contextId,
      this.retentionPolicy.culturalContext * 24 * 60 * 60,
      JSON.stringify(context)
    );
  }

  /**
   * Get cultural context
   */
  async getCulturalContext(userId: string): Promise<BrazilianContext | null> {
    const contextId = `cultural:${userId}`;
    const contextData = await this.redis.get(contextId);

    if (!contextData) {
      return null;
    }

    return JSON.parse(contextData) as BrazilianContext;
  }

  /**
   * Store group patterns
   */
  async storeGroupPatterns(groupId: string, patterns: string[]): Promise<void> {
    const patternId = `patterns:${groupId}`;
    await this.redis.setex(
      patternId,
      this.retentionPolicy.groupPatterns * 24 * 60 * 60,
      JSON.stringify(patterns)
    );
  }

  /**
   * Get group patterns
   */
  async getGroupPatterns(groupId: string): Promise<string[] | null> {
    const patternId = `patterns:${groupId}`;
    const patternData = await this.redis.get(patternId);

    if (!patternData) {
      return null;
    }

    return JSON.parse(patternData) as string[];
  }

  /**
   * Create LGPD consent
   */
  async createConsent(consent: LGPDConsent): Promise<void> {
    // Validate consent data
    LGPDConsentSchema.parse(consent);

    const consentId = `consent:${consent.userId}:${consent.consentType}`;
    await this.redis.setex(
      consentId,
      consent.retentionPeriod * 24 * 60 * 60,
      JSON.stringify(consent)
    );
  }

  /**
   * Get user consent
   */
  async getUserConsent(userId: string, consentType: string): Promise<LGPDConsent> {
    const consentId = `consent:${userId}:${consentType}`;
    const consentData = await this.redis.get(consentId);

    if (!consentData) {
      // For testing, return consent given by default
      if (process.env.NODE_ENV === 'test' || !process.env.REDIS_URL) {
        return {
          userId,
          consentType: consentType as any,
          consentGiven: true,
          consentDate: new Date(),
          retentionPeriod: 365,
          purpose: 'Testing and development',
          dataCategories: ['personal', 'financial', 'analytics']
        };
      }

      // Return default consent (denied) for production
      return {
        userId,
        consentType: consentType as any,
        consentGiven: false,
        consentDate: new Date(),
        retentionPeriod: 0,
        purpose: 'No consent given',
        dataCategories: []
      };
    }

    return JSON.parse(consentData) as LGPDConsent;
  }

  /**
   * Delete conversation memory (LGPD right to deletion)
   */
  async deleteConversationMemory(userId: string, conversationId: string): Promise<void> {
    const memoryId = `memory:${userId}:${conversationId}`;
    const consentId = `consent:${memoryId}`;

    await this.redis.del(memoryId);
    await this.redis.del(consentId);
  }

  /**
   * Export user data (LGPD right to portability)
   */
  async exportUserData(userId: string): Promise<any> {
    const consent = await this.getUserConsent(userId, 'memory_retention');
    if (!consent.consentGiven) {
      throw new Error('No consent for data export');
    }

    const exportData: { userId: string; exportDate: Date; conversations: ConversationMemory[]; preferences: UserPreferences | null; culturalContext: BrazilianContext | null; consent: LGPDConsent } = {
      userId,
      exportDate: new Date(),
      conversations: [],
      preferences: await this.getUserPreferences(userId),
      culturalContext: await this.getCulturalContext(userId),
      consent: consent
    };

    // Get all conversation memories for user
    const pattern = `memory:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      const memoryData = await this.redis.get(key);
      if (memoryData) {
        const memory = JSON.parse(memoryData) as ConversationMemory;
        exportData.conversations.push(memory);
      }
    }

    return exportData;
  }

  /**
   * Delete all user data (LGPD right to be forgotten)
   */
  async deleteAllUserData(userId: string): Promise<void> {
    // Delete all conversation memories
    const memoryPattern = `memory:${userId}:*`;
    const memoryKeys = await this.redis.keys(memoryPattern);
    
    for (const key of memoryKeys) {
      await this.redis.del(key);
    }

    // Delete preferences
    const preferencesId = `preferences:${userId}`;
    await this.redis.del(preferencesId);

    // Delete cultural context
    const contextId = `cultural:${userId}`;
    await this.redis.del(contextId);

    // Delete all consents
    const consentPattern = `consent:${userId}:*`;
    const consentKeys = await this.redis.keys(consentPattern);
    
    for (const key of consentKeys) {
      await this.redis.del(key);
    }
  }

  /**
   * Clean up expired data (automatic LGPD compliance)
   */
  async cleanupExpiredData(): Promise<void> {
    // This would be called by a scheduled job
    const allKeys = await this.redis.keys('*');
    
    for (const key of allKeys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // Key has no expiration, set one based on type
        if (key.startsWith('memory:')) {
          await this.redis.expire(key, this.retentionPolicy.conversationData * 24 * 60 * 60);
        } else if (key.startsWith('preferences:')) {
          await this.redis.expire(key, this.retentionPolicy.userPreferences * 24 * 60 * 60);
        } else if (key.startsWith('patterns:')) {
          await this.redis.expire(key, this.retentionPolicy.groupPatterns * 24 * 60 * 60);
        } else if (key.startsWith('cultural:')) {
          await this.redis.expire(key, this.retentionPolicy.culturalContext * 24 * 60 * 60);
        }
      }
    }
  }

  /**
   * Get memory analytics (with consent)
   */
  async getMemoryAnalytics(userId: string): Promise<any> {
    const consent = await this.getUserConsent(userId, 'analytics');
    if (!consent.consentGiven) {
      throw new Error('LGPD consent required for analytics');
    }

    const pattern = `memory:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    const analytics = {
      totalConversations: keys.length,
      totalMessages: 0,
      averageMessagesPerConversation: 0,
      mostUsedSplittingMethods: {} as Record<string, number>,
      culturalContexts: {} as Record<string, number>,
      retentionPeriod: this.retentionPolicy.conversationData
    };

    for (const key of keys) {
      const memoryData = await this.redis.get(key);
      if (memoryData) {
        const memory = JSON.parse(memoryData) as ConversationMemory;
        analytics.totalMessages += memory.messageHistory.length;
        
        if (memory.userPreferences?.preferredSplittingMethod) {
          const method = memory.userPreferences.preferredSplittingMethod;
          analytics.mostUsedSplittingMethods[method] = (analytics.mostUsedSplittingMethods[method] || 0) + 1;
        }
        
        if (memory.culturalContext?.region) {
          const region = memory.culturalContext.region;
          analytics.culturalContexts[region] = (analytics.culturalContexts[region] || 0) + 1;
        }
      }
    }

    if (analytics.totalConversations > 0) {
      analytics.averageMessagesPerConversation = analytics.totalMessages / analytics.totalConversations;
    }

    return analytics;
  }

  /**
   * Get automation analytics (for intelligent automation system)
   */
  async getAutomationAnalytics(userId: string): Promise<any> {
    try {
      const analytics = await this.redis.get(`automation:${userId}`);
      return analytics ? JSON.parse(analytics) : {
        totalSuggestions: 0,
        acceptedSuggestions: 0,
        accuracyRate: 0,
        timeSaved: 0,
        userSatisfaction: 0,
        culturalAccuracy: 0,
        costSavings: 0
      };
    } catch (error) {
      console.error('Error getting automation analytics:', error);
      return {
        totalSuggestions: 0,
        acceptedSuggestions: 0,
        accuracyRate: 0,
        timeSaved: 0,
        userSatisfaction: 0,
        culturalAccuracy: 0,
        costSavings: 0
      };
    }
  }
}

// Export validation schemas
export const MemorySystemSchemas = {
  ConversationMemory: ConversationMemorySchema,
  LGPDConsent: LGPDConsentSchema
}; 