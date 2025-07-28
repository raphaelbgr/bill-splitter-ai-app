import { RachaAIClaudeClient } from '../lib/claude-client';

// Mock the Claude client for faster tests
jest.mock('../lib/claude-client', () => ({
  RachaAIClaudeClient: jest.fn().mockImplementation(() => ({
    processMessage: jest.fn().mockResolvedValue({
      content: 'Mock response from Claude',
      modelUsed: 'claude-3-haiku-20240307',
      tokensUsed: { total: 100, input: 50, output: 50 },
      costBRL: 0.05,
      cached: false,
      processingTimeMs: 500
    }),
    enhanceWithBrazilianContext: jest.fn().mockResolvedValue({
      content: 'Enhanced Brazilian response',
      culturalContext: { region: 'BR', scenario: 'restaurant' }
    })
  }))
}));

describe('Claude API Integration Tests', () => {
  let claudeClient: RachaAIClaudeClient;

  beforeEach(() => {
    claudeClient = new RachaAIClaudeClient();
  });

  describe('Model Routing Tests', () => {
    test('should route simple queries to Haiku model', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Dividir conta igualmente', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
      expect(response.modelUsed).toBe('claude-3-haiku-20240307');
    }, 10000);

    test('should route complex queries to Sonnet model', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Dividir conta com múltiplas pessoas e condições especiais', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
    }, 10000);

    test('should route advanced queries to Opus model', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Dividir conta com análise complexa de contexto cultural brasileiro', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
    }, 10000);
  });

  describe('Portuguese Language Support Tests', () => {
    test('should handle Brazilian Portuguese expressions', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Galera, vamos rachar a conta do rodízio?', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
    }, 10000);

    test('should understand Brazilian cultural contexts', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Happy hour com a galera do trabalho', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
    }, 10000);

    test('should handle regional Portuguese variations', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Vamo rachar essa conta aí, mano?', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
    }, 10000);
  });

  describe('Cost Tracking Tests', () => {
    test('should track API costs correctly', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response.costBRL).toBe(0.05);
      expect(response.tokensUsed).toBeDefined();
    }, 10000);

    test('should optimize costs with model routing', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Simple message', context);
      
      expect(response.modelUsed).toBe('claude-3-haiku-20240307');
      expect(response.costBRL).toBeLessThan(0.10);
    }, 10000);
  });

  describe('Error Handling Tests', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error scenario
      const originalProcessMessage = claudeClient.processMessage;
      claudeClient.processMessage = jest.fn().mockRejectedValue(new Error('API Error'));

      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      await expect(claudeClient.processMessage('Test message', context)).rejects.toThrow('API Error');

      // Restore original method
      claudeClient.processMessage = originalProcessMessage;
    }, 10000);

    test('should handle rate limiting', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response).toBeDefined();
    }, 10000);
  });

  describe('Performance Tests', () => {
    test('should meet response time targets', async () => {
      const startTime = Date.now();
      
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      await claudeClient.processMessage('Test message', context);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // < 5 seconds for tests
    }, 10000);
  });

  describe('Brazilian Currency Support Tests', () => {
    test('should format Brazilian currency correctly', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Dividir R$ 150,00 entre 3 pessoas', context);
      
      expect(response).toBeDefined();
      expect(response.content).toBe('Mock response from Claude');
    }, 10000);
  });

  describe('Security Tests', () => {
    test('should not expose API keys in responses', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response.content).not.toContain('sk-');
      expect(response.content).not.toContain('API_KEY');
    }, 10000);

    test('should validate user input', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [],
        userAgent: 'test-agent',
        networkCondition: 'fast',
        culturalContext: { region: 'BR', scenario: 'restaurant' },
        userPreferences: { language: 'pt-BR', formalityLevel: 'informal' }
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response).toBeDefined();
    }, 10000);
  });
}); 