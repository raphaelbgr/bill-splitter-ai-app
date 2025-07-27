import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const mobileSuggestionsSchema = z.object({
  userId: z.string().optional(),
  amount: z.string().optional(),
  socialContext: z.string().optional(),
  region: z.string().optional(),
  deviceType: z.string().optional(),
  networkType: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = mobileSuggestionsSchema.parse(req.query);
      
      // Mock mobile suggestions data
      const suggestions = {
        userId: validatedData.userId || 'test-user',
        suggestions: [
          {
            id: 'pix-1',
            type: 'pix',
            name: 'PIX Instantâneo',
            description: 'Transferência instantânea via PIX',
            icon: 'pix-icon',
            priority: 1,
            region: validatedData.region || 'BR',
            socialContext: validatedData.socialContext || 'casual',
            deviceType: validatedData.deviceType || 'mobile',
            networkType: validatedData.networkType || 'wifi',
          },
          {
            id: 'mobile-wallet-1',
            type: 'mobile_wallet',
            name: 'Carteira Digital',
            description: 'Pagamento via carteira digital',
            icon: 'wallet-icon',
            priority: 2,
            region: validatedData.region || 'BR',
            socialContext: validatedData.socialContext || 'casual',
            deviceType: validatedData.deviceType || 'mobile',
            networkType: validatedData.networkType || 'wifi',
          },
          {
            id: 'card-1',
            type: 'credit_card',
            name: 'Cartão de Crédito',
            description: 'Pagamento via cartão de crédito',
            icon: 'card-icon',
            priority: 3,
            region: validatedData.region || 'BR',
            socialContext: validatedData.socialContext || 'casual',
            deviceType: validatedData.deviceType || 'mobile',
            networkType: validatedData.networkType || 'wifi',
          },
        ],
        culturalContext: {
          region: validatedData.region || 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(suggestions);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}