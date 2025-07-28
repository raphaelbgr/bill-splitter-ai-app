import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const PredictiveSplittingSchema = z.object({
  userId: z.string(),
  expenseText: z.string().min(1),
  amount: z.number().positive(),
  participants: z.array(z.string())
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // For dev/test: return a mock suggestion
    return res.status(200).json({
      suggestions: [
        {
          method: 'equal',
          confidence: 0.9,
          reasoning: 'Divisão igual sugerida para grupos pequenos',
          participants: ['Alice', 'Bob'],
          amounts: { Alice: 50, Bob: 50 },
          culturalContext: 'brazilian',
          alternatives: []
        }
      ]
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId, expenseText, amount, participants } = req.body;
    PredictiveSplittingSchema.parse({ userId, expenseText, amount, participants });
    // Mock logic
    return res.status(200).json({
      suggestions: [
        {
          method: 'equal',
          confidence: 0.9,
          reasoning: `Divisão igual sugerida para: ${expenseText}`,
          participants,
          amounts: Object.fromEntries(participants.map(p => [p, amount / participants.length])),
          culturalContext: 'brazilian',
          alternatives: []
        }
      ]
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request data', details: error });
  }
} 