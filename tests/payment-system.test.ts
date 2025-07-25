jest.mock('../lib/redis-client', () => ({
  redisClient: {
    hset: jest.fn(),
    hgetall: jest.fn(),
    hget: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn()
  }
}));

import { BrazilianPaymentSystem } from '../lib/payment-system';
import { redisClient } from '../lib/redis-client';

describe('BrazilianPaymentSystem', () => {
  let paymentSystem: BrazilianPaymentSystem;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    paymentSystem = new BrazilianPaymentSystem();
    jest.clearAllMocks();
  });

  describe('PIX Key Management', () => {
    test('should generate a new PIX key', async () => {
      const mockPixKey = {
        id: 'pix_123',
        userId: testUserId,
        keyType: 'email' as const,
        keyValue: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (redisClient.hset as jest.Mock).mockResolvedValue(1);

      const result = await paymentSystem.generatePIXKey(testUserId, 'email', 'test@example.com');

      expect(result).toMatchObject({
        userId: testUserId,
        keyType: 'email',
        keyValue: 'test@example.com',
        isActive: true
      });
      expect(result.id).toMatch(/^pix_\d+_[a-z0-9]+$/);
      expect(redisClient.hset).toHaveBeenCalledWith(
        `user:${testUserId}:pix_keys`,
        expect.any(String),
        expect.any(String)
      );
    });

    test('should get all PIX keys for a user', async () => {
      const mockKeys = {
        'pix_1': JSON.stringify({
          id: 'pix_1',
          userId: testUserId,
          keyType: 'email',
          keyValue: 'test@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        'pix_2': JSON.stringify({
          id: 'pix_2',
          userId: testUserId,
          keyType: 'phone',
          keyValue: '+5511999999999',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      (redisClient.hgetall as jest.Mock).mockResolvedValue(mockKeys);

      const result = await paymentSystem.getPIXKeys(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'pix_1',
        keyType: 'email',
        keyValue: 'test@example.com'
      });
      expect(result[1]).toMatchObject({
        id: 'pix_2',
        keyType: 'phone',
        keyValue: '+5511999999999'
      });
    });

    test('should update PIX key status', async () => {
      const mockKey = {
        id: 'pix_1',
        userId: testUserId,
        keyType: 'email',
        keyValue: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (redisClient.hget as jest.Mock).mockResolvedValue(JSON.stringify(mockKey));
      (redisClient.hset as jest.Mock).mockResolvedValue(1);

      const result = await paymentSystem.updatePIXKey(testUserId, 'pix_1', { isActive: false });

      expect(result.isActive).toBe(false);
      expect(redisClient.hset).toHaveBeenCalledWith(
        `user:${testUserId}:pix_keys`,
        'pix_1',
        expect.any(String)
      );
    });

    test('should throw error when PIX key not found', async () => {
      (redisClient.hget as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentSystem.updatePIXKey(testUserId, 'nonexistent', { isActive: false })
      ).rejects.toThrow('PIX key not found');
    });
  });

  describe('Payment Preferences', () => {
    test('should get default payment preferences when none exist', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (redisClient.set as jest.Mock).mockResolvedValue('OK');

      const result = await paymentSystem.getPaymentPreferences(testUserId);

      expect(result).toMatchObject({
        userId: testUserId,
        preferredMethod: 'pix',
        comfortableDebtLimit: 50.0,
        autoReminderEnabled: true,
        reminderFrequency: 'weekly',
        socialPaymentEnabled: true,
        pixKeys: []
      });
      expect(redisClient.set).toHaveBeenCalledWith(
        `user:${testUserId}:payment_preferences`,
        expect.any(String)
      );
    });

    test('should get existing payment preferences', async () => {
      const mockPreferences = {
        userId: testUserId,
        preferredMethod: 'transfer',
        comfortableDebtLimit: 100.0,
        autoReminderEnabled: false,
        reminderFrequency: 'monthly',
        socialPaymentEnabled: true,
        pixKeys: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await paymentSystem.getPaymentPreferences(testUserId);

      // Convert Date objects to strings for comparison
      const expectedPreferences = {
        ...mockPreferences,
        createdAt: mockPreferences.createdAt.toISOString(),
        updatedAt: mockPreferences.updatedAt.toISOString()
      };
      expect(result).toMatchObject(expectedPreferences);
    });

    test('should update payment preferences', async () => {
      const existingPreferences = {
        userId: testUserId,
        preferredMethod: 'pix',
        comfortableDebtLimit: 50.0,
        autoReminderEnabled: true,
        reminderFrequency: 'weekly',
        socialPaymentEnabled: true,
        pixKeys: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(existingPreferences));
      (redisClient.set as jest.Mock).mockResolvedValue('OK');

      const updates = {
        preferredMethod: 'transfer' as const,
        comfortableDebtLimit: 150.0
      };

      const result = await paymentSystem.updatePaymentPreferences(testUserId, updates);

      expect(result.preferredMethod).toBe('transfer');
      expect(result.comfortableDebtLimit).toBe(150.0);
      expect(result.autoReminderEnabled).toBe(true); // unchanged
    });
  });

  describe('Payment Suggestions', () => {
    beforeEach(() => {
      // Mock preferences and PIX keys
      const mockPreferences = {
        userId: testUserId,
        preferredMethod: 'pix',
        comfortableDebtLimit: 50.0,
        autoReminderEnabled: true,
        reminderFrequency: 'weekly',
        socialPaymentEnabled: true,
        pixKeys: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockPixKeys = [
        {
          id: 'pix_1',
          userId: testUserId,
          keyType: 'email' as const,
          keyValue: 'test@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPreferences));
      (redisClient.hgetall as jest.Mock).mockResolvedValue({
        'pix_1': JSON.stringify(mockPixKeys[0])
      });
    });

    test('should generate PIX suggestion for small amount', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        50.0,
        {
          participants: 4,
          occasion: 'rodizio',
          socialContext: 'friends',
          recipient: 'João'
        }
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].method).toBe('pix');
      expect(suggestions[0].amount).toBe(50.0);
      expect(suggestions[0].recipient).toBe('João');
      expect(suggestions[0].confidence).toBeGreaterThan(0.8);
      expect(suggestions[0].reasoning).toContain('PIX');
    });

    test('should generate transfer suggestion for large amount', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        2000.0,
        {
          participants: 2,
          occasion: 'business',
          socialContext: 'business',
          recipient: 'Empresa'
        }
      );

      expect(suggestions).toHaveLength(2); // PIX and transfer
      const transferSuggestion = suggestions.find(s => s.method === 'transfer');
      expect(transferSuggestion).toBeDefined();
      expect(transferSuggestion?.amount).toBe(2000.0);
      expect(transferSuggestion?.reasoning).toContain('transferência');
    });

    test('should generate cash suggestion for small informal amount', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        30.0,
        {
          participants: 3,
          occasion: 'cafe',
          socialContext: 'informal',
          recipient: 'Maria'
        }
      );

      expect(suggestions).toHaveLength(2); // PIX and cash
      const cashSuggestion = suggestions.find(s => s.method === 'cash');
      expect(cashSuggestion).toBeDefined();
      expect(cashSuggestion?.reasoning).toContain('dinheiro');
    });

    test('should generate "depois acerto" for very small amount', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        15.0,
        {
          participants: 2,
          occasion: 'cafe',
          socialContext: 'friends',
          recipient: 'Pedro'
        }
      );

      expect(suggestions).toHaveLength(2); // PIX and cash (depois acerto)
      const cashSuggestion = suggestions.find(s => s.method === 'cash');
      expect(cashSuggestion?.reasoning).toContain('acertar depois');
    });
  });

  describe('Debt Tracking', () => {
    test('should create debt tracking entry', async () => {
      (redisClient.hset as jest.Mock).mockResolvedValue(1);

      const debtData = {
        amount: 100.0,
        description: 'Rodízio com amigos',
        method: 'pix' as const,
        socialContext: 'friends',
        groupId: 'group-123'
      };

      const result = await paymentSystem.createDebtTracking(
        testUserId,
        debtData.amount,
        debtData.description,
        debtData.method,
        debtData.socialContext,
        debtData.groupId
      );

      expect(result).toMatchObject({
        userId: testUserId,
        amount: 100.0,
        description: 'Rodízio com amigos',
        method: 'pix',
        status: 'pending',
        socialContext: 'friends',
        groupId: 'group-123'
      });
      expect(result.id).toMatch(/^debt_\d+_[a-z0-9]+$/);
    });

    test('should get all debts for a user', async () => {
      const mockDebts = {
        'debt_1': JSON.stringify({
          id: 'debt_1',
          userId: testUserId,
          amount: 100.0,
          description: 'Rodízio',
          method: 'pix',
          status: 'pending',
          socialContext: 'friends',
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        'debt_2': JSON.stringify({
          id: 'debt_2',
          userId: testUserId,
          amount: 50.0,
          description: 'Café',
          method: 'cash',
          status: 'paid',
          socialContext: 'friends',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      (redisClient.hgetall as jest.Mock).mockResolvedValue(mockDebts);

      const result = await paymentSystem.getDebts(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'debt_1',
        amount: 100.0,
        description: 'Rodízio',
        status: 'pending'
      });
      expect(result[1]).toMatchObject({
        id: 'debt_2',
        amount: 50.0,
        description: 'Café',
        status: 'paid'
      });
    });

    test('should update debt status', async () => {
      const mockDebt = {
        id: 'debt_1',
        userId: testUserId,
        amount: 100.0,
        description: 'Rodízio',
        method: 'pix',
        status: 'pending',
        socialContext: 'friends',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (redisClient.hget as jest.Mock).mockResolvedValue(JSON.stringify(mockDebt));
      (redisClient.hset as jest.Mock).mockResolvedValue(1);

      const result = await paymentSystem.updateDebtStatus(testUserId, 'debt_1', 'paid');

      expect(result.status).toBe('paid');
      expect(redisClient.hset).toHaveBeenCalledWith(
        `user:${testUserId}:debts`,
        'debt_1',
        expect.any(String)
      );
    });

    test('should throw error when debt not found', async () => {
      (redisClient.hget as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentSystem.updateDebtStatus(testUserId, 'nonexistent', 'paid')
      ).rejects.toThrow('Debt not found');
    });
  });

  describe('Payment Reminders', () => {
    test('should create payment reminder', async () => {
      (redisClient.hset as jest.Mock).mockResolvedValue(1);

      const reminderData = {
        debtId: 'debt_1',
        type: 'reminder' as const,
        message: 'Lembrete de pagamento',
        method: 'whatsapp' as const,
        scheduledFor: new Date('2024-01-15T10:00:00Z')
      };

      const result = await paymentSystem.createPaymentReminder(
        testUserId,
        reminderData.debtId,
        reminderData.type,
        reminderData.message,
        reminderData.method,
        reminderData.scheduledFor
      );

      expect(result).toMatchObject({
        userId: testUserId,
        debtId: 'debt_1',
        type: 'reminder',
        message: 'Lembrete de pagamento',
        method: 'whatsapp',
        status: 'pending',
        scheduledFor: new Date('2024-01-15T10:00:00Z')
      });
      expect(result.id).toMatch(/^reminder_\d+_[a-z0-9]+$/);
    });

    test('should get pending reminders', async () => {
      const mockReminders = {
        'reminder_1': JSON.stringify({
          id: 'reminder_1',
          userId: testUserId,
          debtId: 'debt_1',
          type: 'reminder',
          message: 'Lembrete',
          method: 'whatsapp',
          status: 'pending',
          scheduledFor: new Date('2024-01-01T10:00:00Z') // Past date
        }),
        'reminder_2': JSON.stringify({
          id: 'reminder_2',
          userId: testUserId,
          debtId: 'debt_2',
          type: 'reminder',
          message: 'Lembrete',
          method: 'email',
          status: 'pending',
          scheduledFor: new Date('2024-12-31T10:00:00Z') // Future date
        })
      };

      (redisClient.keys as jest.Mock).mockResolvedValue(['user:test-user-123:reminders']);
      (redisClient.hgetall as jest.Mock).mockResolvedValue(mockReminders);

      const result = await paymentSystem.getPendingReminders();

      expect(result).toHaveLength(2); // Both reminders are pending and scheduled
      expect(result.map(r => r.id)).toContain('reminder_1');
      expect(result.map(r => r.id)).toContain('reminder_2');
    });

    test('should mark reminder as sent', async () => {
      const mockReminder = {
        id: 'reminder_1',
        userId: testUserId,
        debtId: 'debt_1',
        type: 'reminder',
        message: 'Lembrete',
        method: 'whatsapp',
        status: 'pending',
        scheduledFor: new Date(),
        sentAt: undefined
      };

      (redisClient.hget as jest.Mock).mockResolvedValue(JSON.stringify(mockReminder));
      (redisClient.hset as jest.Mock).mockResolvedValue(1);

      await paymentSystem.markReminderSent(testUserId, 'reminder_1');

      expect(redisClient.hset).toHaveBeenCalledWith(
        `user:${testUserId}:reminders`,
        'reminder_1',
        expect.stringContaining('"status":"sent"')
      );
    });

    test('should throw error when reminder not found', async () => {
      (redisClient.hget as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentSystem.markReminderSent(testUserId, 'nonexistent')
      ).rejects.toThrow('Reminder not found');
    });
  });

  describe('LGPD Compliance', () => {
    test('should export user payment data', async () => {
      const mockPreferences = {
        userId: testUserId,
        preferredMethod: 'pix',
        comfortableDebtLimit: 50.0,
        autoReminderEnabled: true,
        reminderFrequency: 'weekly',
        socialPaymentEnabled: true,
        pixKeys: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockPixKeys = [
        {
          id: 'pix_1',
          userId: testUserId,
          keyType: 'email' as const,
          keyValue: 'test@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockDebts = [
        {
          id: 'debt_1',
          userId: testUserId,
          amount: 100.0,
          description: 'Rodízio',
          method: 'pix',
          status: 'pending',
          socialContext: 'friends',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPreferences));
      (redisClient.hgetall as jest.Mock)
        .mockResolvedValueOnce({ 'pix_1': JSON.stringify(mockPixKeys[0]) })
        .mockResolvedValueOnce({ 'debt_1': JSON.stringify(mockDebts[0]) });

      const result = await paymentSystem.exportUserPaymentData(testUserId);

      // Convert Date objects to strings for comparison
      const expectedPreferences = {
        ...mockPreferences,
        createdAt: mockPreferences.createdAt.toISOString(),
        updatedAt: mockPreferences.updatedAt.toISOString()
      };
      const expectedPixKeys = mockPixKeys.map(key => ({
        ...key,
        createdAt: key.createdAt.toISOString(),
        updatedAt: key.updatedAt.toISOString()
      }));
      const expectedDebts = mockDebts.map(debt => ({
        ...debt,
        createdAt: debt.createdAt.toISOString(),
        updatedAt: debt.updatedAt.toISOString()
      }));

      expect(result).toMatchObject({
        preferences: expectedPreferences,
        pixKeys: expectedPixKeys,
        debts: expectedDebts
      });
      expect(result.exportedAt).toBeDefined();
    });

    test('should delete all user payment data', async () => {
      (redisClient.del as jest.Mock).mockResolvedValue(1);

      await paymentSystem.deleteUserPaymentData(testUserId);

      expect(redisClient.del).toHaveBeenCalledWith(`user:${testUserId}:payment_preferences`);
      expect(redisClient.del).toHaveBeenCalledWith(`user:${testUserId}:pix_keys`);
      expect(redisClient.del).toHaveBeenCalledWith(`user:${testUserId}:debts`);
      expect(redisClient.del).toHaveBeenCalledWith(`user:${testUserId}:reminders`);
    });
  });

  describe('Confidence Calculations', () => {
    test('should calculate PIX confidence correctly', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        50.0,
        {
          participants: 4,
          occasion: 'rodizio',
          socialContext: 'friends',
          recipient: 'João'
        }
      );

      const pixSuggestion = suggestions.find(s => s.method === 'pix');
      expect(pixSuggestion?.confidence).toBeGreaterThan(0.8);
      expect(pixSuggestion?.confidence).toBeLessThanOrEqual(0.95);
    });

    test('should calculate transfer confidence for business context', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        2000.0,
        {
          participants: 2,
          occasion: 'business',
          socialContext: 'business',
          recipient: 'Empresa'
        }
      );

      const transferSuggestion = suggestions.find(s => s.method === 'transfer');
      expect(transferSuggestion?.confidence).toBeGreaterThan(0.7);
      expect(transferSuggestion?.confidence).toBeLessThanOrEqual(0.9);
    });

    test('should calculate cash confidence for small informal amounts', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        30.0,
        {
          participants: 3,
          occasion: 'cafe',
          socialContext: 'informal',
          recipient: 'Maria'
        }
      );

      const cashSuggestion = suggestions.find(s => s.method === 'cash');
      expect(cashSuggestion?.confidence).toBeGreaterThan(0.6);
      expect(cashSuggestion?.confidence).toBeLessThanOrEqual(0.8);
    });
  });

  describe('Regional Factors', () => {
    test('should include regional factors in suggestions', async () => {
      const suggestions = await paymentSystem.generatePaymentSuggestions(
        testUserId,
        100.0,
        {
          participants: 4,
          occasion: 'rodizio',
          socialContext: 'friends',
          region: 'SP',
          recipient: 'João'
        }
      );

      const pixSuggestion = suggestions.find(s => s.method === 'pix');
      expect(pixSuggestion?.regionalFactors).toContain('São Paulo: PIX muito popular');
    });

    test('should handle different regions', async () => {
      const regions = ['SP', 'RJ', 'NE', 'RS'];
      
      for (const region of regions) {
        const suggestions = await paymentSystem.generatePaymentSuggestions(
          testUserId,
          100.0,
          {
            participants: 4,
            occasion: 'rodizio',
            socialContext: 'friends',
            region,
            recipient: 'João'
          }
        );

        const pixSuggestion = suggestions.find(s => s.method === 'pix');
        expect(pixSuggestion?.regionalFactors).toHaveLength(1);
        expect(pixSuggestion?.regionalFactors[0]).toContain('PIX');
      }
    });
  });
}); 