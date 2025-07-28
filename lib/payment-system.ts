import { Redis } from 'ioredis';
import { RedisCache } from './redis-client';

export interface PIXKey {
  id: string;
  userId: string;
  keyType: 'email' | 'phone' | 'cpf' | 'random' | 'cnpj';
  keyValue: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentPreference {
  userId: string;
  preferredMethod: 'pix' | 'transfer' | 'cash' | 'credit' | 'boleto';
  comfortableDebtLimit: number;
  autoReminderEnabled: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  socialPaymentEnabled: boolean;
  pixKeys: PIXKey[];
  bankInfo?: {
    bankName: string;
    accountType: 'checking' | 'savings' | 'digital';
    accountNumber: string;
    branchCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSuggestion {
  method: 'pix' | 'transfer' | 'cash' | 'credit' | 'boleto';
  confidence: number;
  reasoning: string;
  amount: number;
  recipient: string;
  pixKey?: PIXKey;
  socialContext: string;
  regionalFactors: string[];
}

export interface DebtTracking {
  id: string;
  userId: string;
  groupId?: string;
  amount: number;
  description: string;
  method: 'pix' | 'transfer' | 'cash' | 'credit' | 'boleto' | 'depois_acerto';
  status: 'pending' | 'paid' | 'reminded' | 'overdue';
  dueDate?: Date;
  reminderSent: boolean;
  socialContext: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentReminder {
  id: string;
  userId: string;
  debtId: string;
  type: 'payment' | 'reminder' | 'overdue';
  message: string;
  method: 'push' | 'email' | 'whatsapp' | 'sms';
  sentAt?: Date;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
}

export class BrazilianPaymentSystem {
  private redis: Redis;
  private redisCache: RedisCache;

  constructor() {
    this.redis = new Redis({
      host: '192.168.7.101',
      port: 6379,
      password: 'tjq5uxt3',
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.redisCache = new RedisCache();
  }

  /**
   * Generate a new PIX key for a user
   */
  async generatePIXKey(userId: string, keyType: PIXKey['keyType'], keyValue: string): Promise<PIXKey> {
    const pixKey: PIXKey = {
      id: `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      keyType,
      keyValue,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.redis.hset(`user:${userId}:pix_keys`, pixKey.id, JSON.stringify(pixKey));
    return pixKey;
  }

  /**
   * Get all PIX keys for a user
   */
  async getPIXKeys(userId: string): Promise<PIXKey[]> {
    const keys = await this.redis.hgetall(`user:${userId}:pix_keys`);
    if (!keys || Object.keys(keys).length === 0) {
      return [];
    }
    return Object.values(keys).map(key => JSON.parse(key));
  }

  /**
   * Update PIX key status
   */
  async updatePIXKey(userId: string, keyId: string, updates: Partial<PIXKey>): Promise<PIXKey> {
    const key = await this.redis.hget(`user:${userId}:pix_keys`, keyId);
    if (!key) {
      throw new Error('PIX key not found');
    }

    const pixKey: PIXKey = { ...JSON.parse(key), ...updates, updatedAt: new Date() };
    await this.redis.hset(`user:${userId}:pix_keys`, keyId, JSON.stringify(pixKey));
    return pixKey;
  }

  /**
   * Get or create payment preferences for a user
   */
  async getPaymentPreferences(userId: string): Promise<PaymentPreference> {
    const preferences = await this.redis.get(`user:${userId}:payment_preferences`);
    
    if (preferences) {
      return JSON.parse(preferences);
    }

    // Create default preferences
    const defaultPreferences: PaymentPreference = {
      userId,
      preferredMethod: 'pix',
      comfortableDebtLimit: 50.0,
      autoReminderEnabled: true,
      reminderFrequency: 'weekly',
      socialPaymentEnabled: true,
      pixKeys: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.redis.set(`user:${userId}:payment_preferences`, JSON.stringify(defaultPreferences));
    return defaultPreferences;
  }

  /**
   * Update payment preferences
   */
  async updatePaymentPreferences(userId: string, updates: Partial<PaymentPreference>): Promise<PaymentPreference> {
    const preferences = await this.getPaymentPreferences(userId);
    const updatedPreferences: PaymentPreference = {
      ...preferences,
      ...updates,
      updatedAt: new Date()
    };

    await this.redis.set(`user:${userId}:payment_preferences`, JSON.stringify(updatedPreferences));
    return updatedPreferences;
  }

  /**
   * Generate smart payment suggestions based on context
   */
  async generatePaymentSuggestions(
    userId: string,
    amount: number,
    context: {
      participants: number;
      occasion: string;
      region?: string;
      socialContext: string;
      recipient?: string;
    }
  ): Promise<PaymentSuggestion[]> {
    const preferences = await this.getPaymentPreferences(userId);
    const pixKeys = await this.getPIXKeys(userId);
    const suggestions: PaymentSuggestion[] = [];

    // PIX suggestion (primary for most cases)
    if (pixKeys.length > 0 && amount <= 20000) { // PIX limit
      suggestions.push({
        method: 'pix',
        confidence: this.calculatePIXConfidence(amount, context),
        reasoning: this.generatePIXReasoning(amount, context),
        amount,
        recipient: context.recipient || 'Destinatário',
        pixKey: pixKeys.find(key => key.isActive),
        socialContext: context.socialContext,
        regionalFactors: this.getRegionalFactors(context.region)
      });
    }

    // Transfer suggestion for larger amounts
    if (amount > 1000 || context.occasion === 'business') {
      suggestions.push({
        method: 'transfer',
        confidence: this.calculateTransferConfidence(amount, context),
        reasoning: this.generateTransferReasoning(amount, context),
        amount,
        recipient: context.recipient || 'Destinatário',
        socialContext: context.socialContext,
        regionalFactors: this.getRegionalFactors(context.region)
      });
    }

    // Cash suggestion for small amounts or informal contexts
    if (amount <= preferences.comfortableDebtLimit && context.socialContext === 'informal') {
      suggestions.push({
        method: 'cash',
        confidence: this.calculateCashConfidence(amount, context),
        reasoning: this.generateCashReasoning(amount, context),
        amount,
        recipient: context.recipient || 'Destinatário',
        socialContext: context.socialContext,
        regionalFactors: this.getRegionalFactors(context.region)
      });
    }

    // "Depois acerto" for very small amounts
    if (amount <= 20 && context.socialContext === 'friends') {
      suggestions.push({
        method: 'cash',
        confidence: 0.85,
        reasoning: 'Valor pequeno, pode acertar depois',
        amount,
        recipient: context.recipient || 'Destinatário',
        socialContext: context.socialContext,
        regionalFactors: this.getRegionalFactors(context.region)
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Create debt tracking entry
   */
  async createDebtTracking(
    userId: string,
    amount: number,
    description: string,
    method: DebtTracking['method'],
    socialContext: string,
    groupId?: string,
    dueDate?: Date
  ): Promise<DebtTracking> {
    const debt: DebtTracking = {
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      groupId,
      amount,
      description,
      method,
      status: 'pending',
      dueDate,
      reminderSent: false,
      socialContext,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.redis.hset(`user:${userId}:debts`, debt.id, JSON.stringify(debt));
    return debt;
  }

  /**
   * Get all debts for a user
   */
  async getDebts(userId: string): Promise<DebtTracking[]> {
    const debts = await this.redis.hgetall(`user:${userId}:debts`);
    return Object.values(debts).map(debt => JSON.parse(debt));
  }

  /**
   * Update debt status
   */
  async updateDebtStatus(userId: string, debtId: string, status: DebtTracking['status']): Promise<DebtTracking> {
    const debt = await this.redis.hget(`user:${userId}:debts`, debtId);
    if (!debt) {
      throw new Error('Debt not found');
    }

    const updatedDebt: DebtTracking = { 
      ...JSON.parse(debt), 
      status, 
      updatedAt: new Date() 
    };
    
    await this.redis.hset(`user:${userId}:debts`, debtId, JSON.stringify(updatedDebt));
    return updatedDebt;
  }

  /**
   * Create payment reminder
   */
  async createPaymentReminder(
    userId: string,
    debtId: string,
    type: PaymentReminder['type'],
    message: string,
    method: PaymentReminder['method'],
    scheduledFor: Date
  ): Promise<PaymentReminder> {
    const reminder: PaymentReminder = {
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      debtId,
      type,
      message,
      method,
      scheduledFor,
      status: 'pending'
    };

    await this.redis.hset(`user:${userId}:reminders`, reminder.id, JSON.stringify(reminder));
    return reminder;
  }

  /**
   * Get pending reminders
   */
  async getPendingReminders(): Promise<PaymentReminder[]> {
    const allUsers = await this.redis.keys('user:*:reminders');
    const reminders: PaymentReminder[] = [];

    for (const userKey of allUsers) {
      const userReminders = await this.redis.hgetall(userKey);
      for (const reminder of Object.values(userReminders)) {
        const parsedReminder = JSON.parse(reminder);
        if (parsedReminder.status === 'pending' && new Date(parsedReminder.scheduledFor) <= new Date()) {
          reminders.push(parsedReminder);
        }
      }
    }

    return reminders;
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(userId: string, reminderId: string): Promise<void> {
    const reminder = await this.redis.hget(`user:${userId}:reminders`, reminderId);
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    const updatedReminder: PaymentReminder = {
      ...JSON.parse(reminder),
      status: 'sent',
      sentAt: new Date()
    };

    await this.redis.hset(`user:${userId}:reminders`, reminderId, JSON.stringify(updatedReminder));
  }

  /**
   * Calculate PIX confidence based on amount and context
   */
  private calculatePIXConfidence(amount: number, context: any): number {
    let confidence = 0.9; // Base confidence for PIX

    // Amount factors
    if (amount <= 100) confidence += 0.05;
    if (amount > 1000) confidence -= 0.1;
    if (amount > 10000) confidence -= 0.2;

    // Context factors
    if (context.socialContext === 'friends') confidence += 0.05;
    if (context.socialContext === 'business') confidence -= 0.1;
    if (context.occasion === 'rodizio') confidence += 0.05;
    if (context.occasion === 'happy_hour') confidence += 0.05;

    return Math.max(0.5, Math.min(0.95, confidence));
  }

  /**
   * Calculate transfer confidence
   */
  private calculateTransferConfidence(amount: number, context: any): number {
    let confidence = 0.7; // Base confidence for transfer

    if (amount > 1000) confidence += 0.1;
    if (context.socialContext === 'business') confidence += 0.1;
    if (context.occasion === 'formal') confidence += 0.1;

    return Math.max(0.5, Math.min(0.9, confidence));
  }

  /**
   * Calculate cash confidence
   */
  private calculateCashConfidence(amount: number, context: any): number {
    let confidence = 0.6; // Base confidence for cash

    if (amount <= 50) confidence += 0.2;
    if (context.socialContext === 'informal') confidence += 0.1;
    if (context.socialContext === 'friends') confidence += 0.1;

    return Math.max(0.4, Math.min(0.8, confidence));
  }

  /**
   * Generate PIX reasoning
   */
  private generatePIXReasoning(amount: number, context: any): string {
    const reasons = [];
    
    if (amount <= 100) reasons.push('Valor pequeno, PIX é ideal');
    if (context.socialContext === 'friends') reasons.push('Entre amigos, PIX é prático');
    if (context.occasion === 'rodizio') reasons.push('Rodízio sempre PIX');
    if (context.occasion === 'happy_hour') reasons.push('Happy hour, PIX rápido');

    return reasons.join('. ') || 'PIX é o método mais prático';
  }

  /**
   * Generate transfer reasoning
   */
  private generateTransferReasoning(amount: number, context: any): string {
    const reasons = [];
    
    if (amount > 1000) reasons.push('Valor alto, transferência é mais seguro');
    if (context.socialContext === 'business') reasons.push('Contexto profissional, transferência é apropriado');

    return reasons.join('. ') || 'Transferência bancária é mais adequada';
  }

  /**
   * Generate cash reasoning
   */
  private generateCashReasoning(amount: number, context: any): string {
    const reasons = [];
    
    if (amount <= 50) reasons.push('Valor pequeno, dinheiro é prático');
    if (context.socialContext === 'informal') reasons.push('Situação informal, dinheiro é aceito');

    return reasons.join('. ') || 'Dinheiro é uma opção válida';
  }

  /**
   * Get regional factors for payment suggestions
   */
  private getRegionalFactors(region?: string): string[] {
    const factors: string[] = [];
    
    switch (region) {
      case 'SP':
        factors.push('São Paulo: PIX muito popular');
        break;
      case 'RJ':
        factors.push('Rio de Janeiro: PIX preferido');
        break;
      case 'NE':
        factors.push('Nordeste: PIX crescente');
        break;
      case 'RS':
        factors.push('Rio Grande do Sul: PIX bem aceito');
        break;
      default:
        factors.push('PIX é o método preferido no Brasil');
    }

    return factors;
  }

  /**
   * Export user payment data (LGPD compliance)
   */
  async exportUserPaymentData(userId: string): Promise<any> {
    const preferences = await this.getPaymentPreferences(userId);
    const pixKeys = await this.getPIXKeys(userId);
    const debts = await this.getDebts(userId);

    return {
      preferences,
      pixKeys,
      debts,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Delete all user payment data (LGPD compliance)
   */
  async deleteUserPaymentData(userId: string): Promise<void> {
    await this.redis.del(`user:${userId}:payment_preferences`);
    await this.redis.del(`user:${userId}:pix_keys`);
    await this.redis.del(`user:${userId}:debts`);
    await this.redis.del(`user:${userId}:reminders`);
  }
} 