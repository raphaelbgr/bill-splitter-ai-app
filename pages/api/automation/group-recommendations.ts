import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const GroupRecommendationsSchema = z.object({
  userId: z.string(),
  context: z.string().min(1),
  participants: z.array(z.string())
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // For dev/test: return a mock recommendation
    return res.status(200).json({
      recommendations: [
        {
          groupName: 'Amigos do Rodízio',
          confidence: 0.95,
          reasoning: 'Grupo sugerido com base no contexto de rodízio',
          suggestedMembers: ['Alice', 'Bob'],
          culturalContext: 'brazilian',
          splitMethod: 'equal',
          paymentPreference: 'PIX'
        }
      ]
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId, context, participants } = req.body;
    GroupRecommendationsSchema.parse({ userId, context, participants });
    // Mock logic
    return res.status(200).json({
      recommendations: [
        {
          groupName: 'Amigos do Rodízio',
          confidence: 0.95,
          reasoning: `Grupo sugerido para: ${context}`,
          suggestedMembers: participants,
          culturalContext: 'brazilian',
          splitMethod: 'equal',
          paymentPreference: 'PIX'
        }
      ]
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request data', details: error });
  }
} 