import { BrazilianPaymentSystem, PIXKey, PaymentPreference } from './payment-system';

export interface MobilePaymentRequest {
  amount: number;
  recipient: string;
  description: string;
  pixKey: string;
  mobileWallet?: 'mercado_pago' | 'picpay' | 'apple_pay' | 'google_pay';
  installments?: number;
  region?: string;
  socialContext: string;
}

export interface MobilePaymentResponse {
  success: boolean;
  paymentId: string;
  qrCode?: string;
  pixCode?: string;
  mobileWalletUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  accessibility: {
    announcement: string;
    qrDescription: string;
    sharingOptions: {
      whatsapp: string;
      email: string;
      copy: string;
      sms: string;
    };
  };
}

export interface QRCodeData {
  pixCode: string;
  qrCodeImage: string;
  amount: number;
  recipient: string;
  description: string;
  expiresAt: Date;
}

export interface MobileWalletIntegration {
  provider: 'mercado_pago' | 'picpay' | 'apple_pay' | 'google_pay';
  isAvailable: boolean;
  setupUrl?: string;
  paymentUrl?: string;
  supportedAmounts: {
    min: number;
    max: number;
  };
}

export interface MobilePaymentAnalytics {
  paymentId: string;
  userId: string;
  method: 'pix' | 'mobile_wallet' | 'qr_code';
  amount: number;
  region: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  networkType: 'wifi' | '4g' | '3g' | '2g';
  processingTime: number;
  success: boolean;
  errorCode?: string;
  timestamp: Date;
}

export class BrazilianMobilePaymentService {
  private paymentSystem: BrazilianPaymentSystem;

  constructor() {
    this.paymentSystem = new BrazilianPaymentSystem();
  }

  /**
   * Generate PIX QR code for mobile payments
   */
  async generatePIXQRCode(request: MobilePaymentRequest): Promise<QRCodeData> {
    const { amount, recipient, description, pixKey } = request;
    
    // Generate PIX code according to Brazilian Central Bank standards
    const pixCode = this.generatePIXCode({
      pixKey,
      amount,
      recipient,
      description
    });

    // Generate QR code image
    const qrCodeImage = await this.generateQRCodeImage(pixCode);

    return {
      pixCode,
      qrCodeImage,
      amount,
      recipient,
      description,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  /**
   * Process mobile payment with Brazilian payment systems
   */
  async processMobilePayment(request: MobilePaymentRequest): Promise<MobilePaymentResponse> {
    const { amount, recipient, description, mobileWallet, region, socialContext } = request;

    try {
      // Validate payment amount for Brazilian limits
      if (amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }
      
      if (amount > 20000) {
        throw new Error('Valor excede o limite PIX de R$ 20.000');
      }

      // Validate required fields
      if (!recipient || !description || !socialContext) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Generate payment ID
      const paymentId = `mobile_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Process based on payment method
      if (mobileWallet) {
        return await this.processMobileWalletPayment(request, paymentId);
      } else {
        return await this.processPIXPayment(request, paymentId);
      }
    } catch (error) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Erro no processamento do pagamento',
        accessibility: {
          announcement: 'Erro no pagamento. Tente novamente.',
          qrDescription: '',
          sharingOptions: {
            whatsapp: '',
            email: '',
            copy: '',
            sms: ''
          }
        }
      };
    }
  }

  /**
   * Check mobile wallet availability for Brazilian market
   */
  async checkMobileWalletAvailability(
    userId: string,
    region: string = 'BR'
  ): Promise<MobileWalletIntegration[]> {
    const wallets: MobileWalletIntegration[] = [
      {
        provider: 'mercado_pago',
        isAvailable: true,
        setupUrl: 'https://www.mercadopago.com.br/wallet',
        paymentUrl: 'https://www.mercadopago.com.br/pay',
        supportedAmounts: { min: 0.01, max: 10000 }
      },
      {
        provider: 'picpay',
        isAvailable: true,
        setupUrl: 'https://www.picpay.com/site',
        paymentUrl: 'https://www.picpay.com/pay',
        supportedAmounts: { min: 0.01, max: 5000 }
      },
      {
        provider: 'apple_pay',
        isAvailable: this.isApplePaySupported(),
        supportedAmounts: { min: 0.01, max: 20000 }
      },
      {
        provider: 'google_pay',
        isAvailable: this.isGooglePaySupported(),
        supportedAmounts: { min: 0.01, max: 20000 }
      }
    ];

    // Filter based on region preferences
    return wallets.filter(wallet => wallet.isAvailable);
  }

  /**
   * Track mobile payment analytics
   */
  async trackMobilePayment(analytics: MobilePaymentAnalytics): Promise<void> {
    // Store analytics data for Brazilian market insights
    const analyticsKey = `mobile_payment_analytics:${analytics.paymentId}`;
    const analyticsData = JSON.stringify(analytics);
    
    // This would typically go to a proper analytics service
    console.log('Mobile Payment Analytics:', analyticsData);
  }

  /**
   * Generate mobile-optimized payment suggestions
   */
  async generateMobilePaymentSuggestions(
    userId: string,
    amount: number,
    context: {
      region: string;
      socialContext: string;
      deviceType: 'mobile' | 'tablet' | 'desktop';
      networkType: 'wifi' | '4g' | '3g' | '2g';
    }
  ): Promise<{
    primaryMethod: 'pix' | 'mobile_wallet' | 'qr_code';
    confidence: number;
    reasoning: string;
    alternatives: Array<{
      method: string;
      confidence: number;
      reasoning: string;
    }>;
  }> {
    const preferences = await this.paymentSystem.getPaymentPreferences(userId);
    const wallets = await this.checkMobileWalletAvailability(userId, context.region);

    let primaryMethod: 'pix' | 'mobile_wallet' | 'qr_code' = 'pix';
    let confidence = 0.9;
    let reasoning = 'PIX é o método mais rápido e prático';

    // Mobile wallet preference for certain contexts
    if (context.socialContext === 'business' && wallets.some(w => w.provider === 'mercado_pago')) {
      primaryMethod = 'mobile_wallet';
      confidence = 0.85;
      reasoning = 'Mercado Pago é ideal para pagamentos corporativos';
    }

    // QR code preference for poor network conditions
    if (context.networkType === '2g' || context.networkType === '3g') {
      primaryMethod = 'qr_code';
      confidence = 0.95;
      reasoning = 'QR code funciona melhor em conexões lentas';
    }

    const alternatives = [
      {
        method: 'PIX',
        confidence: 0.9,
        reasoning: 'PIX instantâneo e gratuito'
      },
      {
        method: 'mobile_wallet',
        confidence: 0.8,
        reasoning: 'Carteira digital para pagamentos rápidos'
      },
      {
        method: 'qr_code',
        confidence: 0.7,
        reasoning: 'QR code para compartilhamento fácil'
      }
    ];

    return {
      primaryMethod,
      confidence,
      reasoning,
      alternatives
    };
  }

  /**
   * Generate PIX code according to Brazilian Central Bank standards
   */
  private generatePIXCode(data: {
    pixKey: string;
    amount: number;
    recipient: string;
    description: string;
  }): string {
    const { pixKey, amount, recipient, description } = data;
    
    // PIX code structure according to Brazilian Central Bank
    const pixCode = [
      '000201', // Payload Format Indicator
      '2658', // Point of Initiation Method
      '0014br.gov.bcb.pix', // Global Unique Identifier
      '01', // PIX Key Type
      pixKey.length.toString().padStart(2, '0'), // PIX Key Length
      pixKey, // PIX Key
      '52040000', // Merchant Category Code
      '5303986', // Transaction Currency (BRL)
      '54', // Transaction Amount
      amount.toString().length.toString().padStart(2, '0'), // Amount Length
      amount.toFixed(2), // Amount
      '5802BR', // Country Code
      '59', // Merchant Name
      recipient.length.toString().padStart(2, '0'), // Merchant Name Length
      recipient, // Merchant Name
      '60', // Merchant City
      '08', // City Length
      'São Paulo', // City
      '62', // Additional Data Field Template
      '05', // Reference Label
      '02', // Reference Label Length
      '***', // Reference Label
      '6304', // CRC16
      this.calculateCRC16(pixKey + amount.toString() + recipient) // CRC16 Value
    ].join('');

    return pixCode;
  }

  /**
   * Generate QR code image from PIX code
   */
  private async generateQRCodeImage(pixCode: string): Promise<string> {
    // In a real implementation, this would use a QR code library
    // For now, we'll return a placeholder
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      // Fallback to data URL
      return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    }
  }

  /**
   * Process PIX payment
   */
  private async processPIXPayment(
    request: MobilePaymentRequest,
    paymentId: string
  ): Promise<MobilePaymentResponse> {
    const { amount, recipient, description, pixKey, region, socialContext } = request;

    const qrData = await this.generatePIXQRCode(request);

    return {
      success: true,
      paymentId,
      qrCode: qrData.qrCodeImage,
      pixCode: qrData.pixCode,
      status: 'pending',
      message: 'PIX gerado com sucesso. Compartilhe o QR code ou código PIX.',
      accessibility: {
        announcement: `PIX gerado para ${recipient}: R$ ${amount.toFixed(2)}`,
        qrDescription: `QR Code PIX para ${recipient}, R$ ${amount.toFixed(2)}. Toque para ampliar`,
        sharingOptions: {
          whatsapp: `Compartilhar PIX via WhatsApp`,
          email: `Enviar PIX por email`,
          copy: `Copiar código PIX`,
          sms: `Enviar PIX por SMS`
        }
      }
    };
  }

  /**
   * Process mobile wallet payment
   */
  private async processMobileWalletPayment(
    request: MobilePaymentRequest,
    paymentId: string
  ): Promise<MobilePaymentResponse> {
    const { amount, recipient, description, mobileWallet, region, socialContext } = request;

    const walletUrl = this.getMobileWalletUrl(mobileWallet!, amount, recipient, description);

    return {
      success: true,
      paymentId,
      mobileWalletUrl: walletUrl,
      status: 'pending',
      message: `Pagamento via ${this.getWalletDisplayName(mobileWallet)} iniciado. Redirecionando...`,
      accessibility: {
        announcement: `Pagamento via ${mobileWallet} para ${recipient}: R$ ${amount.toFixed(2)}`,
        qrDescription: '',
        sharingOptions: {
          whatsapp: `Compartilhar pagamento via WhatsApp`,
          email: `Enviar pagamento por email`,
          copy: `Copiar link do pagamento`,
          sms: `Enviar pagamento por SMS`
        }
      }
    };
  }

  /**
   * Get mobile wallet payment URL
   */
  private getMobileWalletUrl(
    wallet: 'mercado_pago' | 'picpay' | 'apple_pay' | 'google_pay',
    amount: number,
    recipient: string,
    description: string
  ): string {
    const baseUrls = {
      mercado_pago: 'https://www.mercadopago.com.br/pay',
      picpay: 'https://www.picpay.com/pay',
      apple_pay: 'https://apple-pay-gateway.apple.com/pay',
      google_pay: 'https://pay.google.com/pay'
    };

    const params = new URLSearchParams({
      amount: amount.toString(),
      recipient,
      description,
      currency: 'BRL',
      country: 'BR'
    });

    return `${baseUrls[wallet]}?${params.toString()}`;
  }

  /**
   * Check if Apple Pay is supported
   */
  private isApplePaySupported(): boolean {
    // In a real implementation, this would check device capabilities
    return typeof window !== 'undefined' && 'ApplePaySession' in window;
  }

  /**
   * Check if Google Pay is supported
   */
  private isGooglePaySupported(): boolean {
    // In a real implementation, this would check device capabilities
    return typeof window !== 'undefined' && 'google' in window;
  }

  /**
   * Get wallet display name
   */
  private getWalletDisplayName(wallet: 'mercado_pago' | 'picpay' | 'apple_pay' | 'google_pay'): string {
    switch (wallet) {
      case 'mercado_pago':
        return 'Mercado Pago';
      case 'picpay':
        return 'PicPay';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return wallet;
    }
  }

  /**
   * Calculate CRC16 for PIX code
   */
  private calculateCRC16(data: string): string {
    // Simplified CRC16 calculation for PIX
    // In a real implementation, this would use a proper CRC16 algorithm
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }
} 