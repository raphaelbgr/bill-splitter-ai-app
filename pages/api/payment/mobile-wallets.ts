import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const mobileWalletsSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = mobileWalletsSchema.parse(req.query);
      
      // Mock mobile wallets data
      const wallets = {
        userId: validatedData.userId || 'test-user',
        mobileWallets: [
          {
            id: 'pix-wallet',
            name: 'PIX',
            type: 'instant_transfer',
            description: 'Transferência instantânea',
            icon: 'pix-icon',
            isAvailable: true,
            region: 'BR',
            features: ['instant', 'free', 'qr_code'],
          },
          {
            id: 'mercado-pago',
            name: 'Mercado Pago',
            type: 'digital_wallet',
            description: 'Carteira digital Mercado Livre',
            icon: 'mercado-pago-icon',
            isAvailable: true,
            region: 'BR',
            features: ['cashback', 'installments', 'qr_code'],
          },
          {
            id: 'picpay',
            name: 'PicPay',
            type: 'digital_wallet',
            description: 'Carteira digital PicPay',
            icon: 'picpay-icon',
            isAvailable: true,
            region: 'BR',
            features: ['cashback', 'social_payments', 'qr_code'],
          },
          {
            id: 'paypal',
            name: 'PayPal',
            type: 'digital_wallet',
            description: 'Carteira digital internacional',
            icon: 'paypal-icon',
            isAvailable: true,
            region: 'BR',
            features: ['international', 'buyer_protection', 'installments'],
          },
        ],
        culturalContext: {
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(wallets);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}