import '@anthropic-ai/sdk/shims/node';
import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/ai/chat';

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('API Endpoints Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ai/chat', () => {
    test('should return 405 for non-POST requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        body: {}
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Método não permitido. Use POST.'
      });
    });

    test('should return 400 for invalid request body', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: '', // Invalid: empty message
          conversationId: 'invalid-uuid' // Invalid UUID
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.error).toContain('Dados inválidos');
    });

    test('should return 200 for valid request', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: 'Test message',
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          culturalContext: {
            region: 'São Paulo',
            scenario: 'restaurante',
            groupType: 'amigos',
            timeOfDay: 'jantar'
          },
          userPreferences: {
            language: 'pt-BR',
            formalityLevel: 'informal',
            region: 'São Paulo',
            paymentPreference: 'pix'
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.content).toBeDefined();
    });

    test('should handle missing optional fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: 'Simple test message',
          conversationId: '123e4567-e89b-12d3-a456-426614174000'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
    });

    test('should validate cultural context enum values', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: 'Test message',
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          culturalContext: {
            region: 'São Paulo',
            scenario: 'invalid_scenario', // Invalid enum value
            groupType: 'amigos',
            timeOfDay: 'jantar'
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.error).toContain('Dados inválidos');
    });

    test('should validate user preferences enum values', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: 'Test message',
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          userPreferences: {
            language: 'pt-BR',
            formalityLevel: 'invalid_level', // Invalid enum value
            region: 'São Paulo',
            paymentPreference: 'pix'
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.error).toContain('Dados inválidos');
    });

    test('should handle message length limits', async () => {
      const longMessage = 'a'.repeat(10001); // Exceeds 10000 character limit
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: longMessage,
          conversationId: '123e4567-e89b-12d3-a456-426614174000'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.error).toContain('Dados inválidos');
    });
  });

  describe('Supabase Integration Tests', () => {
    test('should handle Supabase authentication gracefully', async () => {
      // This test verifies that the API works without Supabase authentication
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: 'Test without auth',
          conversationId: '123e4567-e89b-12d3-a456-426614174000'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should handle rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const requests = Array(5).fill(null).map(() => 
        createMocks({
          method: 'POST',
          body: {
            message: 'Rate limit test',
            conversationId: '123e4567-e89b-12d3-a456-426614174000'
          }
        })
      );

      // Process all requests
      for (const { req, res } of requests) {
        await handler(req, res);
      }

      // All should succeed (rate limiting is disabled for testing)
      for (const { res } of requests) {
        expect(res._getStatusCode()).toBe(200);
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle malformed JSON', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      });
      
      // Simulate malformed JSON
      req.body = undefined;

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    test('should handle missing required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing message and conversationId
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.error).toContain('Dados inválidos');
    });
  });

  describe('Brazilian Market Specific Tests', () => {
    test('should handle Brazilian cultural context', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          message: 'Dividir R$ 120 entre 4 pessoas no rodízio',
          conversationId: '123e4567-e89b-12d3-a456-426614174000',
          culturalContext: {
            region: 'São Paulo',
            scenario: 'restaurante',
            groupType: 'amigos',
            timeOfDay: 'jantar'
          },
          userPreferences: {
            language: 'pt-BR',
            formalityLevel: 'informal',
            region: 'São Paulo',
            paymentPreference: 'pix'
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data.content).toBeDefined();
    });

    test('should handle different Brazilian scenarios', async () => {
      const scenarios = ['restaurante', 'uber', 'churrasco', 'happy_hour', 'viagem', 'vaquinha'];
      
      for (const scenario of scenarios) {
        const { req, res } = createMocks({
          method: 'POST',
          body: {
            message: `Test ${scenario} scenario`,
            conversationId: '123e4567-e89b-12d3-a456-426614174000',
            culturalContext: {
              region: 'São Paulo',
              scenario: scenario as any,
              groupType: 'amigos',
              timeOfDay: 'jantar'
            }
          }
        });

        await handler(req, res);
        expect(res._getStatusCode()).toBe(200);
      }
    });
  });
}); 