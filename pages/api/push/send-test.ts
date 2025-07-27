import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const SendTestSchema = z.object({
  userId: z.string().uuid().optional(),
  message: z.string().min(1).optional(),
  type: z.enum(['payment_reminder', 'group_update', 'expense_alert', 'system']).optional(),
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
    const validatedData = SendTestSchema.parse(req.body);
    
    const result = {
      userId: validatedData.userId || 'test-user',
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: validatedData.message || 'Test notification message',
      type: validatedData.type || 'system',
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      status: 'sent',
      timestamp: new Date().toISOString(),
      culturalContext: {
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Push send test error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
} 