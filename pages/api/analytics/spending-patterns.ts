import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const spendingPatternsSchema = z.object({
  userId: z.string().optional(),
  period: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = spendingPatternsSchema.parse(req.query);
      
      // Mock spending patterns data
      const spendingPatterns = {
        userId: validatedData.userId || 'test-user',
        period: validatedData.period || 'month',
        patterns: [
          {
            category: 'restaurante',
            totalSpent: 450.00,
            percentage: 35,
            averagePerTransaction: 75.00,
            frequency: 'weekly',
            topExpenses: [
              { description: 'Rodízio Japonês', amount: 120.00 },
              { description: 'Churrascaria', amount: 85.00 },
              { description: 'Pizza', amount: 65.00 },
            ],
            culturalContext: 'brazilian_dining',
          },
          {
            category: 'transporte',
            totalSpent: 280.00,
            percentage: 22,
            averagePerTransaction: 35.00,
            frequency: 'daily',
            topExpenses: [
              { description: 'Uber', amount: 180.00 },
              { description: '99', amount: 100.00 },
            ],
            culturalContext: 'urban_transport',
          },
          {
            category: 'entretenimento',
            totalSpent: 200.00,
            percentage: 15,
            averagePerTransaction: 50.00,
            frequency: 'weekly',
            topExpenses: [
              { description: 'Cinema', amount: 80.00 },
              { description: 'Show', amount: 120.00 },
            ],
            culturalContext: 'leisure_activity',
          },
        ],
        insights: [
          {
            type: 'spending_trend',
            title: 'Gastos com restaurantes aumentaram 15%',
            description: 'Maior frequência de jantares em grupo',
            confidence: 0.85,
            period: 'month_over_month',
          },
          {
            type: 'optimization_opportunity',
            title: 'Oportunidade de economizar em transporte',
            description: 'Considerar transporte público para trajetos curtos',
            confidence: 0.78,
            potentialSavings: 80.00,
          },
        ],
        summary: {
          totalSpent: 1280.00,
          averagePerDay: 42.67,
          mostExpensiveCategory: 'restaurante',
          leastExpensiveCategory: 'entretenimento',
          spendingEfficiency: 0.72,
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

      return res.status(200).json(spendingPatterns);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}