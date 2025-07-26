import { i18n, SupportedLanguage, SupportedRegion } from '../lib/internationalization';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Internationalization System', () => {
  beforeEach(() => {
    // Reset to default state before each test
    i18n.setLanguage('pt-BR');
    i18n.setRegion('BR');
    jest.clearAllMocks();
  });

  describe('Language Management', () => {
    test('should set and get current language correctly', () => {
      i18n.setLanguage('es-ES');
      expect(i18n.getCurrentLanguage()).toBe('es-ES');
    });

    test('should get supported languages', () => {
      const supportedLanguages = i18n.getSupportedLanguages();
      expect(supportedLanguages).toContain('pt-BR');
      expect(supportedLanguages).toContain('es-ES');
      expect(supportedLanguages).toContain('en-US');
      expect(supportedLanguages).toContain('fr-FR');
    });

    test('should translate text correctly', () => {
      i18n.setLanguage('pt-BR');
      const translation = i18n.t('message.welcome');
      expect(translation).toBe('Olá! Como posso ajudar com suas despesas hoje?');

      i18n.setLanguage('es-ES');
      const spanishTranslation = i18n.t('message.welcome');
      expect(spanishTranslation).toBe('¡Hola! ¿Cómo puedo ayudarte con tus gastos hoy?');
    });

    test('should fallback to default language when translation not found', () => {
      const translation = i18n.t('nonexistent.key');
      expect(translation).toBe('nonexistent.key');
    });

    test('should interpolate parameters in translations', () => {
      i18n.setLanguage('pt-BR');
      const translation = i18n.t('message.language_changed', { language: 'Português' });
      expect(translation).toBe('Idioma alterado para Português');
    });
  });

  describe('Region Management', () => {
    test('should set and get current region correctly', () => {
      i18n.setRegion('US');
      expect(i18n.getCurrentRegion()).toBe('US');
    });

    test('should get supported regions', () => {
      const supportedRegions = i18n.getSupportedRegions();
      expect(supportedRegions).toContain('BR');
      expect(supportedRegions).toContain('ES');
      expect(supportedRegions).toContain('US');
      expect(supportedRegions).toContain('FR');
      expect(supportedRegions).toContain('MX');
    });

    test('should get cultural context for current region', () => {
      i18n.setRegion('BR');
      const context = i18n.getCulturalContext();
      expect(context.region).toBe('BR');
      expect(context.currency).toBe('BRL');
      expect(context.timezone).toBe('America/Sao_Paulo');

      i18n.setRegion('US');
      const usContext = i18n.getCulturalContext();
      expect(usContext.region).toBe('US');
      expect(usContext.currency).toBe('USD');
      expect(usContext.timezone).toBe('America/New_York');
    });

    test('should get regional payment methods', () => {
      i18n.setRegion('BR');
      const brPayments = i18n.getRegionalPaymentMethods();
      expect(brPayments.primary).toContain('PIX');
      expect(brPayments.primary).toContain('Cartão de Crédito');

      i18n.setRegion('US');
      const usPayments = i18n.getRegionalPaymentMethods();
      expect(usPayments.primary).toContain('Credit Card');
      expect(usPayments.primary).toContain('Cash');
    });
  });

  describe('Formatting Functions', () => {
    test('should format currency correctly for different regions', () => {
      i18n.setRegion('BR');
      const brCurrency = i18n.formatCurrency(1234.56);
      expect(brCurrency).toContain('R$');

      i18n.setRegion('US');
      const usCurrency = i18n.formatCurrency(1234.56);
      expect(usCurrency).toContain('$');

      i18n.setRegion('ES');
      const esCurrency = i18n.formatCurrency(1234.56);
      expect(esCurrency).toContain('€');
    });

    test('should format dates correctly for different regions', () => {
      const testDate = new Date('2024-12-25');
      
      i18n.setRegion('BR');
      const brDate = i18n.formatDate(testDate);
      expect(brDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);

      i18n.setRegion('US');
      const usDate = i18n.formatDate(testDate);
      expect(usDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('Cultural Context', () => {
    test('should get cultural expressions', () => {
      i18n.setRegion('BR');
      const expression = i18n.getCulturalExpression('expense_sharing');
      expect(expression).toBe('rachar a conta');

      i18n.setRegion('US');
      const usExpression = i18n.getCulturalExpression('expense_sharing');
      expect(usExpression).toBe('split the bill');
    });

    test('should get social dynamics', () => {
      i18n.setRegion('BR');
      const dynamic = i18n.getSocialDynamic('who_invites_pays');
      expect(dynamic).toBe('quem convida paga');

      i18n.setRegion('US');
      const usDynamic = i18n.getSocialDynamic('who_invites_pays');
      expect(usDynamic).toBe('whoever invites pays');
    });

    test('should get business practices', () => {
      i18n.setRegion('BR');
      const practice = i18n.getBusinessPractice('tipping');
      expect(practice).toBe('10% gorjeta');

      i18n.setRegion('US');
      const usPractice = i18n.getBusinessPractice('tipping');
      expect(usPractice).toBe('15-20% tip');
    });
  });

  describe('Validation', () => {
    test('should validate cultural context', () => {
      const validContext = {
        region: 'BR' as SupportedRegion,
        language: 'pt-BR' as SupportedLanguage,
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'dd/MM/yyyy',
        numberFormat: 'pt-BR',
        paymentMethods: ['PIX', 'Cartão de Crédito'],
        culturalExpressions: { 'test': 'value' },
        socialDynamics: { 'test': 'value' },
        businessPractices: { 'test': 'value' }
      };

      expect(i18n.validateCulturalContext(validContext)).toBe(true);
    });

    test('should validate regional payment methods', () => {
      const validMethods = {
        primary: ['PIX', 'Cartão de Crédito'],
        secondary: ['Transferência', 'Boleto'],
        cultural: ['Vaquinha', 'Racha'],
        digital: ['PIX', 'PicPay']
      };

      expect(i18n.validateRegionalPaymentMethods(validMethods)).toBe(true);
    });
  });

  describe('API Integration', () => {
    test('should handle language switching via API', async () => {
      const mockResponse = {
        success: true,
        currentLanguage: 'es-ES',
        currentRegion: 'ES',
        supportedLanguages: ['pt-BR', 'es-ES', 'en-US', 'fr-FR'],
        supportedRegions: ['BR', 'ES', 'US', 'FR'],
        culturalContext: {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          dateFormat: 'dd/MM/yyyy',
          numberFormat: 'es-ES',
          paymentMethods: ['Tarjeta', 'Efectivo', 'Bizum']
        },
        message: 'Idioma cambiado a Español'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const response = await fetch('/api/internationalization/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'es-ES', region: 'ES' })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.currentLanguage).toBe('es-ES');
      expect(data.currentRegion).toBe('ES');
    });

    test('should handle cultural context loading via API', async () => {
      const mockResponse = {
        success: true,
        region: 'BR',
        culturalContext: {
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'dd/MM/yyyy',
          numberFormat: 'pt-BR',
          paymentMethods: ['PIX', 'Cartão de Crédito'],
          culturalExpressions: { 'expense_sharing': 'rachar a conta' },
          socialDynamics: { 'who_invites_pays': 'quem convida paga' },
          businessPractices: { 'tipping': '10% gorjeta' }
        },
        regionalPaymentMethods: {
          primary: ['PIX', 'Cartão de Crédito'],
          secondary: ['Transferência', 'Boleto'],
          cultural: ['Vaquinha', 'Racha'],
          digital: ['PIX', 'PicPay']
        },
        scenarioSuggestions: {
          expressions: ['rachar a conta', 'dividir igualzinho'],
          paymentMethods: ['PIX', 'Cartão de Crédito'],
          socialDynamics: ['vaquinha', 'galera']
        },
        message: 'Contexto cultural carregado para BR'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const response = await fetch('/api/internationalization/cultural-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'BR', scenario: 'restaurant' })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.region).toBe('BR');
      expect(data.culturalContext).toBeDefined();
    });

    test('should handle regional payments loading via API', async () => {
      const mockResponse = {
        success: true,
        region: 'US',
        recommendedPaymentMethods: {
          primary: ['Credit Card', 'Cash', 'Venmo'],
          secondary: ['PayPal', 'Apple Pay'],
          cultural: ['Pool money', 'Pay later'],
          digital: ['Venmo', 'PayPal', 'Apple Pay']
        },
        paymentSuggestions: [
          {
            method: 'Venmo',
            description: 'Popular peer-to-peer payment app',
            advantages: ['Instant transfer', 'No fees', 'Mobile app'],
            culturalContext: 'Most popular for personal payments'
          }
        ],
        regionalFeatures: {
          instantTransfer: true,
          qrCodeSupport: true,
          digitalWallet: true,
          cashPreference: false
        },
        complianceInfo: {
          localRegulations: ['State-specific regulations'],
          dataProtection: ['State privacy laws'],
          currencyRestrictions: ['USD only']
        },
        message: 'Payment methods loaded for US'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const response = await fetch('/api/internationalization/regional-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'US', scenario: 'restaurant' })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.region).toBe('US');
      expect(data.recommendedPaymentMethods).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid language gracefully', () => {
      // @ts-ignore - Testing invalid input
      i18n.setLanguage('invalid-language');
      expect(i18n.getCurrentLanguage()).toBe('pt-BR'); // Should remain default
    });

    test('should handle invalid region gracefully', () => {
      // @ts-ignore - Testing invalid input
      i18n.setRegion('invalid-region');
      const context = i18n.getCulturalContext();
      expect(context.region).toBe('BR'); // Should fallback to default
    });

    test('should handle missing translations gracefully', () => {
      const translation = i18n.t('completely.missing.translation');
      expect(translation).toBe('completely.missing.translation');
    });
  });

  describe('Performance', () => {
    test('should handle rapid language switches efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        i18n.setLanguage('pt-BR');
        i18n.setLanguage('es-ES');
        i18n.setLanguage('en-US');
        i18n.setLanguage('fr-FR');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should handle rapid region switches efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        i18n.setRegion('BR');
        i18n.setRegion('ES');
        i18n.setRegion('US');
        i18n.setRegion('FR');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Brazilian Market Focus', () => {
    test('should maintain Brazilian market leadership', () => {
      // Brazilian should be the default
      expect(i18n.getCurrentLanguage()).toBe('pt-BR');
      expect(i18n.getCurrentRegion()).toBe('BR');
    });

    test('should have comprehensive Brazilian cultural context', () => {
      i18n.setRegion('BR');
      const context = i18n.getCulturalContext();
      
      expect(context.culturalExpressions).toHaveProperty('expense_sharing');
      expect(context.culturalExpressions).toHaveProperty('group_gathering');
      expect(context.culturalExpressions).toHaveProperty('celebration');
      
      expect(context.socialDynamics).toHaveProperty('who_invites_pays');
      expect(context.socialDynamics).toHaveProperty('equal_split');
      expect(context.socialDynamics).toHaveProperty('forgets_wallet');
    });

    test('should have Brazilian payment methods prioritized', () => {
      i18n.setRegion('BR');
      const payments = i18n.getRegionalPaymentMethods();
      
      expect(payments.primary).toContain('PIX');
      expect(payments.primary).toContain('Cartão de Crédito');
      expect(payments.digital).toContain('PIX');
      expect(payments.cultural).toContain('Vaquinha');
    });
  });
}); 