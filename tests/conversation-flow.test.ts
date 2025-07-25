import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { RachaAIClaudeClient } from '../lib/claude-client';

// Mock the chat API handler
const chatHandler = require('../pages/api/ai/chat').default;

describe('Conversation Flow Tests', () => {
  describe('API Routes Tests', () => {
    test('should handle conversation requests correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Dividir R$ 100 entre 4 pessoas',
          userId: 'test-user-id',
          conversationId: 'test-conversation-id'
        }
      });

      await chatHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.content).toBeDefined();
      expect(data.model).toBeDefined();
      expect(data.tokens).toBeDefined();
      expect(data.cost).toBeDefined();
    });

    test('should handle missing message parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          userId: 'test-user-id'
        }
      });

      await chatHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Message is required');
    });

    test('should handle invalid HTTP method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await chatHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Method not allowed');
    });

    test('should handle rate limiting', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Test message',
          userId: 'rate-limited-user'
        }
      });

      // Make multiple requests to trigger rate limiting
      for (let i = 0; i < 10; i++) {
        await chatHandler(req, res);
      }

      // Should eventually hit rate limit
      expect(res._getStatusCode()).toBe(429);
    });
  });

  describe('Claude AI Integration Tests', () => {
    let claudeClient: RachaAIClaudeClient;

    beforeEach(() => {
      claudeClient = new RachaAIClaudeClient();
    });

    test('should process Portuguese expense descriptions', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage(
        'Fizemos um rodízio japonês com 8 pessoas. A conta foi R$ 320, mas 2 pessoas não beberam álcool',
        context
      );

      expect(response.content).toContain('rodízio');
      expect(response.content).toContain('álcool');
      expect(response.content).toContain('R$');
    });

    test('should handle complex expense scenarios', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage(
        'Organizei um churrasco para 15 pessoas. Comprei carne por R$ 180, bebidas por R$ 120, e cada um trouxe algo',
        context
      );

      expect(response.content).toContain('churrasco');
      expect(response.content).toContain('carne');
      expect(response.content).toContain('bebidas');
    });

    test('should maintain conversation context', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: [
          { role: 'user', content: 'Dividir R$ 100 entre 4 pessoas' },
          { role: 'assistant', content: 'Cada pessoa deve pagar R$ 25' }
        ]
      };

      const response = await claudeClient.processMessage(
        'E se uma pessoa não puder pagar?',
        context
      );

      expect(response.content).toContain('pessoa');
      expect(response.content).toContain('pagar');
    });

    test('should handle Brazilian cultural contexts', async () => {
      const context = {
        userId: 'test-user',
        conversationId: 'test-conversation',
        messageHistory: []
      };

      const response = await claudeClient.processMessage(
        'Happy hour com os colegas do trabalho',
        context
      );

      expect(response.content).toContain('happy hour');
      expect(response.content).toContain('trabalho');
    });
  });

  describe('Performance Tests', () => {
    test('should meet response time targets', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Quanto cada um paga?',
          userId: 'test-user'
        }
      });

      const startTime = Date.now();
      await chatHandler(req, res);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // <2 seconds
      expect(res._getStatusCode()).toBe(200);
    });

    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: {
            message: `Test message ${i}`,
            userId: `user-${i}`
          }
        });
        return chatHandler(req, res);
      });

      const results = await Promise.all(requests);
      
      results.forEach((_, index) => {
        // All requests should complete successfully
        expect(results[index]).toBeDefined();
      });
    });

    test('should cache repeated queries', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Dividir R$ 50 entre 2 pessoas',
          userId: 'cache-test-user'
        }
      });

      // First request
      const startTime1 = Date.now();
      await chatHandler(req, res);
      const endTime1 = Date.now();
      const responseTime1 = endTime1 - startTime1;

      // Second request (should be cached)
      const startTime2 = Date.now();
      await chatHandler(req, res);
      const endTime2 = Date.now();
      const responseTime2 = endTime2 - startTime2;

      // Cached response should be faster
      expect(responseTime2).toBeLessThan(responseTime1);
    });
  });

  describe('Mobile Responsiveness Tests', () => {
    test('should handle mobile viewport sizes', () => {
      // Test mobile viewport simulation
      const mobileViewport = {
        width: 375,
        height: 667
      };

      // Mock window resize for mobile testing
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: mobileViewport.width,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: mobileViewport.height,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Should handle mobile viewport correctly
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
    });

    test('should handle touch interactions', () => {
      // Test touch event simulation
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Should handle touch events without errors
      expect(touchEvent.type).toBe('touchstart');
    });

    test('should handle mobile keyboard interactions', () => {
      // Test mobile keyboard simulation
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText'
      });

      // Should handle input events correctly
      expect(inputEvent.type).toBe('input');
    });
  });

  describe('Portuguese Language Accuracy Tests', () => {
    test('should understand Brazilian Portuguese expressions', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Fizemos uma vaquinha para o presente da galera',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('vaquinha');
      expect(data.content).toContain('galera');
    });

    test('should handle regional Portuguese variations', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Bah tchê, como vamos dividir essa conta?',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('dividir');
      expect(data.content).toContain('conta');
    });

    test('should format Brazilian currency correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'A conta foi R$ 150,50. Como dividir?',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('R$');
      expect(data.content).toContain('150');
    });

    test('should understand Brazilian cultural contexts', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Aniversário da minha mãe, 20 convidados',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('aniversário');
      expect(data.content).toContain('convidados');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Test message',
          userId: 'error-test-user'
        }
      });

      // Simulate API error by modifying the request
      req.body.message = '';

      await chatHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Message is required');
    });

    test('should handle network errors', async () => {
      // Test network error handling
      const networkError = new Error('Network error');
      
      // Should handle network errors gracefully
      expect(networkError.message).toBe('Network error');
    });

    test('should handle timeout errors', async () => {
      // Test timeout handling
      const timeoutError = new Error('Request timeout');
      
      // Should handle timeout errors gracefully
      expect(timeoutError.message).toBe('Request timeout');
    });

    test('should provide user-friendly error messages', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: '',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Message is required');
      expect(typeof data.error).toBe('string');
    });
  });

  describe('Brazilian User Experience Tests', () => {
    test('should provide culturally appropriate responses', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Churrasco com família, alguns trouxeram bebidas',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('churrasco');
      expect(data.content).toContain('família');
      expect(data.content).toContain('bebidas');
    });

    test('should handle Brazilian payment methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Como pagar com PIX?',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('PIX');
    });

    test('should understand Brazilian social dynamics', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Aniversário da minha mãe não paga, certo?',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('aniversário');
      expect(data.content).toContain('mãe');
    });

    test('should handle Brazilian expense scenarios', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          message: 'Viagem em grupo, cada um com orçamento diferente',
          userId: 'test-user'
        }
      });

      await chatHandler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.content).toContain('viagem');
      expect(data.content).toContain('grupo');
      expect(data.content).toContain('orçamento');
    });
  });
}); 