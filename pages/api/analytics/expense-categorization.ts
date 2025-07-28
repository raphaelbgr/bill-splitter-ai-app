import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const expenseCategorizationSchema = z.object({
  userId: z.string().optional(),
  expenses: z.array(z.object({
    description: z.string(),
    amount: z.number(),
  })).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const validatedData = expenseCategorizationSchema.parse(req.body);
      
      // Mock expense categorization data
      const categorization = {
        userId: validatedData.userId || 'test-user',
        expenses: validatedData.expenses || [
          { description: 'Rodízio', amount: 50.00 }
        ],
        categorizations: [
          {
            description: 'Rodízio',
            amount: 50.00,
            category: 'restaurante',
            confidence: 0.95,
            subcategory: 'rodízio',
            culturalContext: 'brazilian_restaurant',
            suggestions: ['japonês', 'brasileiro', 'churrascaria'],
          },
          {
            description: 'Uber',
            amount: 25.00,
            category: 'transporte',
            confidence: 0.88,
            subcategory: 'ride_sharing',
            culturalContext: 'urban_transport',
            suggestions: ['99', 'cabify', 'taxi'],
          },
          {
            description: 'Cinema',
            amount: 30.00,
            category: 'entretenimento',
            confidence: 0.92,
            subcategory: 'cinema',
            culturalContext: 'leisure_activity',
            suggestions: ['teatro', 'show', 'museu'],
          },
        ],
        summary: {
          totalExpenses: 3,
          totalAmount: 105.00,
          categories: {
            restaurante: 1,
            transporte: 1,
            entretenimento: 1,
          },
          averageConfidence: 0.92,
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

      return res.status(200).json(categorization);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}