import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianMobilePaymentService, MobilePaymentRequest } from '../../../lib/mobile-payment-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const mobilePaymentService = new BrazilianMobilePaymentService();

  try {
    const {
      amount,
      recipient,
      description,
      pixKey,
      mobileWallet,
      installments,
      region = 'BR',
      socialContext,
      userId,
      deviceType = 'mobile',
      networkType = 'wifi'
    } = req.body;

    // Validate required fields
    if (!amount || !recipient || !description || !pixKey || !socialContext || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: amount, recipient, description, pixKey, socialContext, userId'
      });
    }

    // Validate amount for Brazilian limits
    if (amount <= 0 || amount > 20000) {
      return res.status(400).json({
        error: 'Amount must be between R$ 0.01 and R$ 20.000'
      });
    }

    const paymentRequest: MobilePaymentRequest = {
      amount,
      recipient,
      description,
      pixKey,
      mobileWallet,
      installments,
      region,
      socialContext
    };

    // Process mobile payment
    const paymentResponse = await mobilePaymentService.processMobilePayment(paymentRequest);

    // Track analytics
    await mobilePaymentService.trackMobilePayment({
      paymentId: paymentResponse.paymentId,
      userId,
      method: mobileWallet ? 'mobile_wallet' : 'pix',
      amount,
      region,
      deviceType,
      networkType,
      processingTime: Date.now(),
      success: paymentResponse.success,
      timestamp: new Date()
    });

    return res.status(200).json(paymentResponse);
  } catch (error) {
    console.error('Mobile payment error:', error);
    return res.status(500).json({
      error: 'Erro no processamento do pagamento móvel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 