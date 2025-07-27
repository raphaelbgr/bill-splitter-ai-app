import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const preferencesSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = preferencesSchema.parse(req.query);
      
      // Mock payment preferences data
      const preferences = {
        userId: validatedData.userId || 'test-user',
        paymentPreferences: {
          defaultMethod: 'pix',
          preferredMethods: ['pix', 'mobile_wallet', 'credit_card'],
          autoConfirm: true,
          notifications: {
            paymentReminders: true,
            paymentConfirmations: true,
            paymentFailures: true,
          },
          security: {
            requireConfirmation: false,
            biometricAuth: true,
            twoFactorAuth: false,
          },
          regional: {
            currency: 'BRL',
            timezone: 'America/Sao_Paulo',
            language: 'pt-BR',
            region: 'BR',
          },
        },
        savedMethods: [
          {
            id: 'pix-1',
            type: 'pix',
            name: 'PIX Principal',
            key: 'joao@email.com',
            isDefault: true,
            lastUsed: new Date().toISOString(),
          },
          {
            id: 'card-1',
            type: 'credit_card',
            name: 'Cartão Principal',
            last4: '1234',
            brand: 'Visa',
            isDefault: false,
            lastUsed: new Date().toISOString(),
          },
          {
            id: 'wallet-1',
            type: 'mobile_wallet',
            name: 'Mercado Pago',
            isDefault: false,
            lastUsed: new Date().toISOString(),
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

      return res.status(200).json(preferences);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}