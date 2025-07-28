import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const UnsubscribeSchema = z.object({
  userId: z.string().optional(),
  subscriptionId: z.string().optional(),
  endpoint: z.string().url().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = UnsubscribeSchema.parse(req.body);
    
    const result = {
      userId: validatedData.userId || 'test-user',
      subscriptionId: validatedData.subscriptionId || 'unknown',
      endpoint: validatedData.endpoint || 'unknown',
      unsubscribed: true,
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      status: 'unsubscribed',
      timestamp: new Date().toISOString(),
      culturalContext: {
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
} 