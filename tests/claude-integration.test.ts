import { RachaAIClaudeClient } from '../lib/claude-client';

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
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Quanto cada um paga?', context);
      
      expect(response.modelUsed).toBe('claude-3-haiku-20240307');
      expect(response.content).toContain('cada um');
      expect(response.tokensUsed.total).toBeGreaterThan(0);
      expect(response.costBRL).toBeGreaterThan(0);
    });

    test('should route complex queries to Sonnet model', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage(
        'Fizemos um rodízio japonês com 8 pessoas. A conta foi R$ 320, mas 2 pessoas não beberam álcool. Como dividir?',
        context
      );
      
      expect(response.modelUsed).toBe('claude-3-sonnet-20240229');
      expect(response.content).toContain('rodízio');
      expect(response.content).toContain('álcool');
    });

    test('should route advanced queries to Opus model', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage(
        'Organizei um churrasco para 15 pessoas. Comprei carne por R$ 180, bebidas por R$ 120, e cada um trouxe algo. Como calcular quem deve quanto considerando que alguns trouxeram mais coisas?',
        context
      );
      
      expect(response.modelUsed).toBe('claude-3-opus-20240229');
      expect(response.content).toContain('churrasco');
    });
  });

  describe('Portuguese Language Support Tests', () => {
    test('should handle Brazilian Portuguese expressions', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Fizemos uma vaquinha para o presente da galera', context);
      
      expect(response.content).toContain('vaquinha');
      expect(response.content).toContain('galera');
    });

    test('should understand Brazilian cultural contexts', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Happy hour com os colegas do trabalho', context);
      
      expect(response.content).toContain('happy hour');
      expect(response.content).toContain('trabalho');
    });

    test('should handle regional Portuguese variations', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Bah tchê, como vamos dividir essa conta?', context);
      
      expect(response.content).toContain('dividir');
      expect(response.content).toContain('conta');
    });
  });

  describe('Cost Tracking Tests', () => {
    test('should track API costs correctly', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response.costBRL).toBeGreaterThan(0);
      expect(response.tokensUsed.input).toBeGreaterThan(0);
      expect(response.tokensUsed.output).toBeGreaterThan(0);
      expect(response.tokensUsed.total).toBe(response.tokensUsed.input + response.tokensUsed.output);
    });

    test('should optimize costs with model routing', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const simpleResponse = await claudeClient.processMessage('Quanto cada um paga?', context);
      const complexResponse = await claudeClient.processMessage(
        'Fizemos um rodízio japonês com 8 pessoas. A conta foi R$ 320, mas 2 pessoas não beberam álcool. Como dividir?',
        context
      );
      
      expect(simpleResponse.costBRL).toBeLessThan(complexResponse.costBRL);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error scenario
      const originalProcessMessage = claudeClient.processMessage;
      claudeClient.processMessage = jest.fn().mockRejectedValue(new Error('API Error'));

      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response.content).toContain('desculpe');
      expect(response.content).toContain('erro');
      
      // Restore original method
      claudeClient.processMessage = originalProcessMessage;
    });

    test('should handle rate limiting', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      // This should work within rate limits
      const response = await claudeClient.processMessage('Test message', context);
      expect(response.content).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should meet response time targets', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const startTime = Date.now();
      const response = await claudeClient.processMessage('Quanto cada um paga?', context);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // 5 seconds max
      expect(response.processingTimeMs).toBeLessThan(5000);
    });
  });

  describe('Brazilian Currency Support Tests', () => {
    test('should format Brazilian currency correctly', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('A conta foi R$ 150,50. Como dividir?', context);
      
      expect(response.content).toContain('R$');
      expect(response.content).toContain('150');
    });
  });

  describe('Security Tests', () => {
    test('should not expose API keys in responses', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('Test message', context);
      
      expect(response.content).not.toContain('sk-');
      expect(response.content).not.toContain('ANTHROPIC_API_KEY');
    });

    test('should validate user input', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage('<script>alert("xss")</script>', context);
      
      expect(response.content).not.toContain('<script>');
      expect(response.content).not.toContain('alert');
    });
  });
}); 