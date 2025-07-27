import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const mobilePaymentSchema = z.object({
  userId: z.string().optional(),
  amount: z.number().optional(),
  recipient: z.string().optional(),
  description: z.string().optional(),
  pixKey: z.string().optional(),
  mobileWallet: z.string().optional(),
  installments: z.number().optional(),
  region: z.string().optional(),
  socialContext: z.string().optional(),
  deviceType: z.string().optional(),
  networkType: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const validatedData = mobilePaymentSchema.parse(req.body);
      
      // Mock mobile payment response
      const payment = {
        userId: validatedData.userId || 'test-user',
        paymentId: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: validatedData.amount || 50.00,
        recipient: validatedData.recipient || 'João Silva',
        description: validatedData.description || 'Pagamento de almoço',
        method: validatedData.mobileWallet || 'pix',
        status: 'completed',
        timestamp: new Date().toISOString(),
        region: validatedData.region || 'BR',
        socialContext: validatedData.socialContext || 'casual',
        deviceType: validatedData.deviceType || 'mobile',
        networkType: validatedData.networkType || 'wifi',
        culturalContext: {
          region: validatedData.region || 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        confirmation: {
          transactionId: `txn_${Date.now()}`,
          confirmationCode: `conf_${Math.random().toString(36).substr(2, 9)}`,
          receiptUrl: `https://api.rachaai.com/receipts/${Date.now()}`,
        },
      };

      return res.status(200).json(payment);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}