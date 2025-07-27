import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const personalizedRecommendationsSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = personalizedRecommendationsSchema.parse(req.query);
      
      // Mock personalized recommendations data
      const recommendations = {
        userId: validatedData.userId || 'test-user',
        recommendations: [
          {
            id: 'rec-1',
            type: 'expense_optimization',
            title: 'Otimizar gastos com restaurantes',
            description: 'Considere dividir refeições ou escolher opções mais econômicas',
            confidence: 0.85,
            priority: 'high',
            category: 'restaurante',
            estimatedSavings: 150.00,
            culturalContext: 'brazilian_dining',
          },
          {
            id: 'rec-2',
            type: 'payment_method',
            title: 'Usar PIX para pagamentos',
            description: 'PIX é mais rápido e gratuito para transferências',
            confidence: 0.92,
            priority: 'medium',
            category: 'payment',
            estimatedSavings: 0,
            culturalContext: 'brazilian_payments',
          },
          {
            id: 'rec-3',
            type: 'group_activity',
            title: 'Organizar mais eventos em grupo',
            description: 'Você economiza mais quando divide despesas',
            confidence: 0.78,
            priority: 'medium',
            category: 'social',
            estimatedSavings: 200.00,
            culturalContext: 'brazilian_social',
          },
        ],
        summary: {
          totalRecommendations: 3,
          highPriority: 1,
          mediumPriority: 2,
          estimatedTotalSavings: 350.00,
          categories: ['restaurante', 'payment', 'social'],
        },
        culturalContext: {
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(recommendations);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}