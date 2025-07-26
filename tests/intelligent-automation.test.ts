import { IntelligentAutomationSystem } from '../lib/intelligent-automation';

describe('IntelligentAutomationSystem', () => {
  let automationSystem: IntelligentAutomationSystem;

  beforeEach(() => {
    automationSystem = new IntelligentAutomationSystem();
  });

  describe('Smart Expense Categorization', () => {
    it('should categorize restaurant expenses correctly', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Jantar no restaurante japonês com amigos',
        150.00,
        ['João', 'Maria', 'Ana']
      );

      expect(result.category).toBe('restaurante');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasoning).toContain('Restaurante');
      expect(result.alternatives).toHaveLength(3);
    });

    it('should categorize bar/happy hour expenses correctly', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Happy hour no bar com a galera do trabalho',
        80.00,
        ['Pedro', 'Carlos', 'Fernanda']
      );

      expect(result.category).toBe('bar_happy_hour');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasoning).toContain('Bar/Happy Hour');
    });

    it('should categorize churrasco expenses correctly', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Churrasco no domingo com a família',
        200.00,
        ['Pai', 'Mãe', 'Irmão', 'Irmã']
      );

      expect(result.category).toBe('churrasco');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.culturalContext).toContain('churrasco');
    });

    it('should categorize travel expenses correctly', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Viagem para a praia com amigos',
        500.00,
        ['Amigo1', 'Amigo2', 'Amigo3']
      );

      expect(result.category).toBe('viagem');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle unknown categories gracefully', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Despesa aleatória sem contexto claro',
        50.00,
        ['Pessoa1']
      );

      expect(result.category).toBe('outros');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Predictive Expense Splitting', () => {
    it('should suggest equal splitting for churrasco', async () => {
      const suggestions = await automationSystem.generatePredictiveSplitting(
        'test-user',
        'Churrasco no domingo com a galera',
        150.00,
        ['João', 'Maria', 'Ana']
      );

      expect(suggestions).toHaveLength(3);
      
      const equalSuggestion = suggestions.find(s => s.method === 'equal');
      expect(equalSuggestion).toBeDefined();
      expect(equalSuggestion?.confidence).toBeGreaterThan(0.8);
      expect(equalSuggestion?.reasoning).toContain('churrasco brasileiro');
    });

    it('should suggest consumption-based splitting for happy hour', async () => {
      const suggestions = await automationSystem.generatePredictiveSplitting(
        'test-user',
        'Happy hour do trabalho',
        80.00,
        ['Pedro', 'Carlos', 'Fernanda']
      );

      const consumptionSuggestion = suggestions.find(s => s.method === 'by_consumption');
      expect(consumptionSuggestion).toBeDefined();
      expect(consumptionSuggestion?.reasoning).toContain('happy hour');
    });

    it('should suggest host pays for small amounts', async () => {
      const suggestions = await automationSystem.generatePredictiveSplitting(
        'test-user',
        'Café pequeno',
        15.00,
        ['João', 'Maria']
      );

      const hostPaysSuggestion = suggestions.find(s => s.method === 'host_pays');
      expect(hostPaysSuggestion).toBeDefined();
      expect(hostPaysSuggestion?.reasoning).toContain('Valor pequeno');
    });

    it('should calculate amounts correctly for equal splitting', async () => {
      const suggestions = await automationSystem.generatePredictiveSplitting(
        'test-user',
        'Jantar igual',
        90.00,
        ['João', 'Maria', 'Ana']
      );

      const equalSuggestion = suggestions.find(s => s.method === 'equal');
      expect(equalSuggestion).toBeDefined();
      
      const amounts = equalSuggestion?.amounts;
      expect(amounts).toBeDefined();
      expect(amounts?.['João']).toBe(30.00);
      expect(amounts?.['Maria']).toBe(30.00);
      expect(amounts?.['Ana']).toBe(30.00);
    });
  });

  describe('Group Recommendations', () => {
    it('should recommend churrasco group for churrasco context', async () => {
      const recommendations = await automationSystem.generateGroupRecommendations(
        'test-user',
        'Churrasco no domingo com a galera',
        ['João', 'Maria', 'Ana']
      );

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].groupName).toBe('Churrasco da Galera');
      expect(recommendations[0].confidence).toBeGreaterThan(0.8);
      expect(recommendations[0].culturalContext).toBe('churrasco');
      expect(recommendations[0].splitMethod).toBe('equal');
    });

    it('should recommend happy hour group for work context', async () => {
      const recommendations = await automationSystem.generateGroupRecommendations(
        'test-user',
        'Happy hour do trabalho',
        ['Pedro', 'Carlos', 'Fernanda']
      );

      expect(recommendations[0].groupName).toBe('Happy Hour do Trabalho');
      expect(recommendations[0].culturalContext).toBe('happy_hour');
    });

    it('should recommend birthday group for birthday context', async () => {
      const recommendations = await automationSystem.generateGroupRecommendations(
        'test-user',
        'Festa de aniversário da Maria',
        ['Amigo1', 'Amigo2', 'Amigo3']
      );

      expect(recommendations[0].groupName).toBe('Festa de Aniversário');
      expect(recommendations[0].culturalContext).toBe('aniversario');
      expect(recommendations[0].splitMethod).toBe('host_pays');
    });

    it('should recommend travel group for travel context', async () => {
      const recommendations = await automationSystem.generateGroupRecommendations(
        'test-user',
        'Viagem para a praia',
        ['Amigo1', 'Amigo2', 'Amigo3']
      );

      expect(recommendations[0].groupName).toBe('Viagem dos Amigos');
      expect(recommendations[0].culturalContext).toBe('viagem');
    });

    it('should include suggested members in recommendations', async () => {
      const recommendations = await automationSystem.generateGroupRecommendations(
        'test-user',
        'Churrasco com amigos',
        ['João', 'Maria', 'Ana']
      );

      expect(recommendations[0].suggestedMembers).toEqual(['João', 'Maria', 'Ana']);
    });
  });

  describe('Payment Reminders', () => {
    it('should create culturally appropriate reminders', async () => {
      const culturalContext = { scenario: 'churrasco' };
      const reminders = await automationSystem.createPaymentReminders(
        'test-user',
        'debt-123',
        50.00,
        'João',
        culturalContext
      );

      expect(reminders).toHaveLength(3);
      
      // Check gentle reminder
      expect(reminders[0].type).toBe('gentle');
      expect(reminders[0].message).toContain('churrasco');
      expect(reminders[0].message).toContain('R$ 50,00');
      expect(reminders[0].culturalContext).toBe('churrasco');
      
      // Check friendly reminder
      expect(reminders[1].type).toBe('friendly');
      expect(reminders[1].message).toContain('churrasco');
      
      // Check urgent reminder
      expect(reminders[2].type).toBe('urgent');
      expect(reminders[2].message).toContain('churrasco');
    });

    it('should schedule reminders with appropriate delays', async () => {
      const culturalContext = { scenario: 'happy_hour' };
      const reminders = await automationSystem.createPaymentReminders(
        'test-user',
        'debt-123',
        30.00,
        'Maria',
        culturalContext
      );

      const now = new Date();
      
      // Gentle reminder should be 3 days from now
      const gentleDate = new Date(reminders[0].scheduledFor);
      const gentleDiff = gentleDate.getTime() - now.getTime();
      expect(gentleDiff).toBeGreaterThan(2.5 * 24 * 60 * 60 * 1000); // 2.5 days
      expect(gentleDiff).toBeLessThan(3.5 * 24 * 60 * 60 * 1000); // 3.5 days
      
      // Friendly reminder should be 5 days from now
      const friendlyDate = new Date(reminders[1].scheduledFor);
      const friendlyDiff = friendlyDate.getTime() - now.getTime();
      expect(friendlyDiff).toBeGreaterThan(4.5 * 24 * 60 * 60 * 1000); // 4.5 days
      expect(friendlyDiff).toBeLessThan(5.5 * 24 * 60 * 60 * 1000); // 5.5 days
      
      // Urgent reminder should be 10 days from now
      const urgentDate = new Date(reminders[2].scheduledFor);
      const urgentDiff = urgentDate.getTime() - now.getTime();
      expect(urgentDiff).toBeGreaterThan(9.5 * 24 * 60 * 60 * 1000); // 9.5 days
      expect(urgentDiff).toBeLessThan(10.5 * 24 * 60 * 60 * 1000); // 10.5 days
    });

    it('should generate appropriate messages for different scenarios', async () => {
      const scenarios = [
        { scenario: 'churrasco', expectedKeyword: 'churrasco' },
        { scenario: 'happy_hour', expectedKeyword: 'happy hour' },
        { scenario: 'aniversario', expectedKeyword: 'aniversário' },
        { scenario: 'viagem', expectedKeyword: 'viagem' }
      ];

      for (const { scenario, expectedKeyword } of scenarios) {
        const reminders = await automationSystem.createPaymentReminders(
          'test-user',
          'debt-123',
          25.00,
          'Amigo',
          { scenario }
        );

        expect(reminders[0].message).toContain(expectedKeyword);
        expect(reminders[0].message).toContain('R$ 25,00');
      }
    });
  });

  describe('Automation Analytics', () => {
    it('should return analytics structure', async () => {
      const analytics = await automationSystem.getAutomationAnalytics('test-user');

      expect(analytics).toHaveProperty('totalSuggestions');
      expect(analytics).toHaveProperty('acceptedSuggestions');
      expect(analytics).toHaveProperty('accuracyRate');
      expect(analytics).toHaveProperty('timeSaved');
      expect(analytics).toHaveProperty('userSatisfaction');
      expect(analytics).toHaveProperty('culturalAccuracy');
      expect(analytics).toHaveProperty('costSavings');

      expect(typeof analytics.totalSuggestions).toBe('number');
      expect(typeof analytics.acceptedSuggestions).toBe('number');
      expect(typeof analytics.accuracyRate).toBe('number');
      expect(typeof analytics.timeSaved).toBe('number');
      expect(typeof analytics.userSatisfaction).toBe('number');
      expect(typeof analytics.culturalAccuracy).toBe('number');
      expect(typeof analytics.costSavings).toBe('number');
    });

    it('should return default values when no analytics exist', async () => {
      const analytics = await automationSystem.getAutomationAnalytics('new-user');

      expect(analytics.totalSuggestions).toBe(0);
      expect(analytics.acceptedSuggestions).toBe(0);
      expect(analytics.accuracyRate).toBe(0);
      expect(analytics.timeSaved).toBe(0);
      expect(analytics.userSatisfaction).toBe(0);
      expect(analytics.culturalAccuracy).toBe(0);
      expect(analytics.costSavings).toBe(0);
    });
  });

  describe('Brazilian Cultural Context', () => {
    it('should consider Brazilian expense patterns', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Rodízio de pizza com a galera',
        120.00,
        ['João', 'Maria', 'Ana', 'Pedro']
      );

      expect(result.category).toBe('restaurante');
      expect(result.culturalContext).toContain('rodízio');
    });

    it('should handle Brazilian regional expressions', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Balada com os amigos',
        100.00,
        ['Amigo1', 'Amigo2']
      );

      expect(result.category).toBe('bar_happy_hour');
      expect(result.culturalContext).toContain('balada');
    });

    it('should recognize Brazilian social dynamics', async () => {
      const suggestions = await automationSystem.generatePredictiveSplitting(
        'test-user',
        'Vaquinha para o presente da professora',
        50.00,
        ['Aluno1', 'Aluno2', 'Aluno3', 'Aluno4']
      );

      const vaquinhaSuggestion = suggestions.find(s => s.method === 'vaquinha');
      expect(vaquinhaSuggestion).toBeDefined();
      expect(vaquinhaSuggestion?.reasoning).toContain('vaquinha');
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle empty participants gracefully', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Teste sem participantes',
        50.00,
        []
      );

      expect(result.category).toBe('outros');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should handle invalid amounts gracefully', async () => {
      const result = await automationSystem.categorizeExpense(
        'test-user',
        'Teste com valor zero',
        0,
        ['João']
      );

      expect(result.category).toBe('outros');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should process requests within reasonable time', async () => {
      const startTime = Date.now();
      
      await automationSystem.categorizeExpense(
        'test-user',
        'Jantar no restaurante',
        100.00,
        ['João', 'Maria']
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 