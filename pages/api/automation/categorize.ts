import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const CategorizeSchema = z.object({
  userId: z.string(),
  expenseText: z.string().min(1),
  amount: z.number().positive(),
  participants: z.array(z.string())
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // For dev/test: return a mock categorization
    return res.status(200).json({
      categorization: {
        category: 'restaurant',
        confidence: 0.92,
        reasoning: 'Despesa típica de restaurante',
        alternatives: ['entertainment', 'shopping'],
        culturalContext: 'brazilian'
      }
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId, expenseText, amount, participants } = req.body;
    CategorizeSchema.parse({ userId, expenseText, amount, participants });
    // Mock logic
    return res.status(200).json({
      categorization: {
        category: 'restaurant',
        confidence: 0.92,
        reasoning: `Categorizado com base em: ${expenseText}`,
        alternatives: ['entertainment', 'shopping'],
        culturalContext: 'brazilian'
      }
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request data', details: error });
  }
} 