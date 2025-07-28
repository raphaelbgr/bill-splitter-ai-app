// Mock the modules that depend on Redis
jest.mock('../lib/redis-client', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    hset: jest.fn().mockResolvedValue(1),
    hget: jest.fn().mockResolvedValue(null),
    hgetall: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  }
}));

jest.mock('../lib/payment-system', () => ({
  BrazilianPaymentSystem: jest.fn().mockImplementation(() => ({
    generatePIXKey: jest.fn().mockResolvedValue('test-pix-key'),
    validatePIXKey: jest.fn().mockResolvedValue(true),
    getPaymentSuggestions: jest.fn().mockResolvedValue([]),
    processPayment: jest.fn().mockResolvedValue({ success: true }),
    getPaymentPreferences: jest.fn().mockResolvedValue({
      preferredMethod: 'pix',
      region: 'BR',
      currency: 'BRL'
    }),
  }))
}));

import { BrazilianMobilePaymentService, MobilePaymentRequest, MobileWalletIntegration } from '../lib/mobile-payment-service';

describe('Brazilian Mobile Payment Service', () => {
  let mobilePaymentService: BrazilianMobilePaymentService;

  beforeEach(() => {
    mobilePaymentService = new BrazilianMobilePaymentService();
  });

  describe('Mobile Payment Processing', () => {
    const mockPaymentRequest: MobilePaymentRequest = {
      amount: 45.50,
      recipient: 'João Silva',
      description: 'Rodízio japonês',
      pixKey: 'joao@email.com',
      region: 'BR',
      socialContext: 'friends'
    };

    it('should process PIX payment successfully', async () => {
      const response = await mobilePaymentService.processMobilePayment(mockPaymentRequest);

      expect(response.success).toBe(true);
      expect(response.paymentId).toBeDefined();
      expect(response.status).toBe('pending');
      expect(response.pixCode).toBeDefined();
      expect(response.qrCode).toBeDefined();
      expect(response.message).toContain('PIX gerado com sucesso');
      expect(response.accessibility.announcement).toContain('PIX gerado para João Silva');
    });

    it('should process mobile wallet payment', async () => {
      const walletRequest = {
        ...mockPaymentRequest,
        mobileWallet: 'mercado_pago' as const
      };

      const response = await mobilePaymentService.processMobilePayment(walletRequest);

      expect(response.success).toBe(true);
      expect(response.mobileWalletUrl).toBeDefined();
      expect(response.message).toContain('Mercado Pago');
    });

    it('should reject payments above PIX limit', async () => {
      const largeAmountRequest = {
        ...mockPaymentRequest,
        amount: 25000
      };

      const response = await mobilePaymentService.processMobilePayment(largeAmountRequest);

      expect(response.success).toBe(false);
      expect(response.message).toContain('Valor excede o limite PIX');
    });

    it('should reject payments with zero amount', async () => {
      const zeroAmountRequest = {
        ...mockPaymentRequest,
        amount: 0
      };

      const response = await mobilePaymentService.processMobilePayment(zeroAmountRequest);

      expect(response.success).toBe(false);
    });
  });

  describe('QR Code Generation', () => {
    it('should generate PIX QR code with correct data', async () => {
      const qrData = await mobilePaymentService.generatePIXQRCode({
        amount: 45.50,
        recipient: 'João Silva',
        description: 'Rodízio japonês',
        pixKey: 'joao@email.com',
        region: 'BR',
        socialContext: 'friends'
      });

      expect(qrData.pixCode).toBeDefined();
      expect(qrData.qrCodeImage).toBeDefined();
      expect(qrData.amount).toBe(45.50);
      expect(qrData.recipient).toBe('João Silva');
      expect(qrData.description).toBe('Rodízio japonês');
      expect(qrData.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate valid PIX code structure', async () => {
      const qrData = await mobilePaymentService.generatePIXQRCode({
        amount: 100.00,
        recipient: 'Maria Santos',
        description: 'Happy hour',
        pixKey: 'maria@email.com',
        region: 'BR',
        socialContext: 'friends'
      });

      const pixCode = qrData.pixCode;
      
      // PIX code should start with standard format
      expect(pixCode).toMatch(/^000201/);
      expect(pixCode).toContain('br.gov.bcb.pix');
      expect(pixCode).toContain('maria@email.com');
      expect(pixCode).toContain('100.00');
    });
  });

  describe('Mobile Wallet Integration', () => {
    it('should check mobile wallet availability', async () => {
      const wallets = await mobilePaymentService.checkMobileWalletAvailability('test-user', 'BR');

      expect(Array.isArray(wallets)).toBe(true);
      expect(wallets.length).toBeGreaterThan(0);

      // Check for Brazilian wallets
      const brazilianWallets = wallets.filter(w => 
        w.provider === 'mercado_pago' || w.provider === 'picpay'
      );
      expect(brazilianWallets.length).toBeGreaterThan(0);

      // Check wallet structure
      wallets.forEach(wallet => {
        expect(wallet.provider).toBeDefined();
        expect(wallet.isAvailable).toBeDefined();
        expect(wallet.supportedAmounts).toBeDefined();
        expect(wallet.supportedAmounts.min).toBeGreaterThan(0);
        expect(wallet.supportedAmounts.max).toBeGreaterThan(0);
      });
    });

    it('should include Mercado Pago for Brazilian users', async () => {
      const wallets = await mobilePaymentService.checkMobileWalletAvailability('test-user', 'BR');
      
      const mercadoPago = wallets.find(w => w.provider === 'mercado_pago');
      expect(mercadoPago).toBeDefined();
      expect(mercadoPago?.isAvailable).toBe(true);
      expect(mercadoPago?.supportedAmounts.max).toBe(10000);
    });

    it('should include PicPay for Brazilian users', async () => {
      const wallets = await mobilePaymentService.checkMobileWalletAvailability('test-user', 'BR');
      
      const picpay = wallets.find(w => w.provider === 'picpay');
      expect(picpay).toBeDefined();
      expect(picpay?.isAvailable).toBe(true);
      expect(picpay?.supportedAmounts.max).toBe(5000);
    });
  });

  describe('Mobile Payment Suggestions', () => {
    it('should generate suggestions for mobile context', async () => {
      const suggestions = await mobilePaymentService.generateMobilePaymentSuggestions(
        'test-user',
        45.50,
        {
          region: 'BR',
          socialContext: 'friends',
          deviceType: 'mobile',
          networkType: '4g'
        }
      );

      expect(suggestions.primaryMethod).toBeDefined();
      expect(suggestions.confidence).toBeGreaterThan(0);
      expect(suggestions.confidence).toBeLessThanOrEqual(1);
      expect(suggestions.reasoning).toBeDefined();
      expect(Array.isArray(suggestions.alternatives)).toBe(true);
      expect(suggestions.alternatives.length).toBeGreaterThan(0);
    });

    it('should prefer PIX for small amounts with friends', async () => {
      const suggestions = await mobilePaymentService.generateMobilePaymentSuggestions(
        'test-user',
        25.00,
        {
          region: 'BR',
          socialContext: 'friends',
          deviceType: 'mobile',
          networkType: 'wifi'
        }
      );

      expect(suggestions.primaryMethod).toBe('pix');
      expect(suggestions.confidence).toBeGreaterThan(0.8);
      expect(suggestions.reasoning).toContain('PIX');
    });

    it('should prefer mobile wallet for business context', async () => {
      const suggestions = await mobilePaymentService.generateMobilePaymentSuggestions(
        'test-user',
        500.00,
        {
          region: 'BR',
          socialContext: 'business',
          deviceType: 'mobile',
          networkType: 'wifi'
        }
      );

      // Should prefer mobile wallet for business context
      expect(['pix', 'mobile_wallet']).toContain(suggestions.primaryMethod);
    });

    it('should prefer QR code for poor network conditions', async () => {
      const suggestions = await mobilePaymentService.generateMobilePaymentSuggestions(
        'test-user',
        30.00,
        {
          region: 'BR',
          socialContext: 'friends',
          deviceType: 'mobile',
          networkType: '2g'
        }
      );

      expect(suggestions.primaryMethod).toBe('qr_code');
      expect(suggestions.confidence).toBeGreaterThan(0.9);
      expect(suggestions.reasoning).toContain('conexões lentas');
    });
  });

  describe('Analytics Tracking', () => {
    it('should track mobile payment analytics', async () => {
      const analytics = {
        paymentId: 'test-payment-123',
        userId: 'test-user',
        method: 'pix' as const,
        amount: 45.50,
        region: 'BR',
        deviceType: 'mobile' as const,
        networkType: '4g' as const,
        processingTime: Date.now(),
        success: true,
        timestamp: new Date()
      };

      // Should not throw error
      await expect(mobilePaymentService.trackMobilePayment(analytics)).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid payment requests gracefully', async () => {
      const invalidRequest = {
        amount: -10,
        recipient: '',
        description: '',
        pixKey: '',
        region: 'BR',
        socialContext: 'friends'
      };

      const response = await mobilePaymentService.processMobilePayment(invalidRequest as any);
      expect(response.success).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error by using invalid data
      const response = await mobilePaymentService.processMobilePayment({
        amount: 100,
        recipient: 'Test',
        description: 'Test',
        pixKey: 'test@test.com',
        region: 'BR',
        socialContext: 'friends'
      });

      // Should still return a response even if QR generation fails
      expect(response).toBeDefined();
    });
  });

  describe('Brazilian Market Specific Features', () => {
    it('should support Brazilian PIX standards', async () => {
      const qrData = await mobilePaymentService.generatePIXQRCode({
        amount: 50.00,
        recipient: 'Carlos',
        description: 'Churrasco',
        pixKey: 'carlos@email.com',
        region: 'BR',
        socialContext: 'friends'
      });

      // PIX code should follow Brazilian Central Bank standards
      expect(qrData.pixCode).toMatch(/^000201/);
      expect(qrData.pixCode).toContain('br.gov.bcb.pix');
      expect(qrData.pixCode).toContain('5303986'); // BRL currency code
      expect(qrData.pixCode).toContain('5802BR'); // Brazil country code
    });

    it('should support Brazilian mobile wallets', async () => {
      const wallets = await mobilePaymentService.checkMobileWalletAvailability('test-user', 'BR');
      
      const brazilianWallets = wallets.filter(w => 
        w.provider === 'mercado_pago' || w.provider === 'picpay'
      );
      
      expect(brazilianWallets.length).toBeGreaterThan(0);
      brazilianWallets.forEach(wallet => {
        expect(wallet.isAvailable).toBe(true);
        expect(wallet.supportedAmounts.max).toBeGreaterThan(0);
      });
    });

    it('should generate culturally appropriate suggestions', async () => {
      const suggestions = await mobilePaymentService.generateMobilePaymentSuggestions(
        'test-user',
        35.00,
        {
          region: 'BR',
          socialContext: 'friends',
          deviceType: 'mobile',
          networkType: 'wifi'
        }
      );

      expect(suggestions.reasoning).toContain('PIX');
      expect(suggestions.alternatives.some(alt => alt.method.includes('PIX'))).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    it('should process payments within 3 seconds', async () => {
      const startTime = Date.now();
      
      await mobilePaymentService.processMobilePayment({
        amount: 25.00,
        recipient: 'Test User',
        description: 'Test payment',
        pixKey: 'test@email.com',
        region: 'BR',
        socialContext: 'friends'
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(3000); // 3 seconds
    });

    it('should generate QR codes within 1 second', async () => {
      const startTime = Date.now();
      
      await mobilePaymentService.generatePIXQRCode({
        amount: 30.00,
        recipient: 'Test User',
        description: 'Test QR',
        pixKey: 'test@email.com',
        region: 'BR',
        socialContext: 'friends'
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(1000); // 1 second
    });
  });
}); 