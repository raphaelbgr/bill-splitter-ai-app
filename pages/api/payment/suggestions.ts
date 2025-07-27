import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const suggestionsSchema = z.object({
  userId: z.string().optional(),
  amount: z.number().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = suggestionsSchema.parse(req.query);
      
      // Mock payment suggestions data
      const suggestions = {
        userId: validatedData.userId || 'test-user',
        amount: validatedData.amount || 50.00,
        suggestions: [
          {
            id: 'suggestion-1',
            type: 'pix',
            title: 'PIX Instantâneo',
            description: 'Transferência instantânea e gratuita',
            icon: 'pix-icon',
            priority: 1,
            estimatedTime: 'instant',
            fee: 0,
            region: 'BR',
          },
          {
            id: 'suggestion-2',
            type: 'mobile_wallet',
            title: 'Carteira Digital',
            description: 'Pagamento via carteira digital',
            icon: 'wallet-icon',
            priority: 2,
            estimatedTime: '5_minutes',
            fee: 0,
            region: 'BR',
          },
          {
            id: 'suggestion-3',
            type: 'credit_card',
            title: 'Cartão de Crédito',
            description: 'Pagamento via cartão de crédito',
            icon: 'card-icon',
            priority: 3,
            estimatedTime: 'instant',
            fee: 0,
            region: 'BR',
          },
          {
            id: 'suggestion-4',
            type: 'bank_transfer',
            title: 'Transferência Bancária',
            description: 'Transferência entre contas',
            icon: 'bank-icon',
            priority: 4,
            estimatedTime: '1_business_day',
            fee: 0,
            region: 'BR',
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

      return res.status(200).json(suggestions);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}