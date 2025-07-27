import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const SubscribeSchema = z.object({
  userId: z.string().optional(),
  subscription: z.object({
    endpoint: z.string().url().optional(),
    keys: z.object({
      p256dh: z.string().optional(),
      auth: z.string().optional()
    }).optional()
  }).optional(),
  preferences: z.object({
    paymentReminders: z.boolean().optional(),
    groupUpdates: z.boolean().optional(),
    expenseAlerts: z.boolean().optional(),
    systemNotifications: z.boolean().optional()
  }).optional(),
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
    const validatedData = SubscribeSchema.parse(req.body);
    
    const result = {
      userId: validatedData.userId || 'test-user',
      subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint: validatedData.subscription?.endpoint || 'https://test.endpoint.com',
      keys: validatedData.subscription?.keys || { p256dh: 'test-p256dh', auth: 'test-auth' },
      preferences: validatedData.preferences || {
        paymentReminders: true,
        groupUpdates: true,
        expenseAlerts: true,
        systemNotifications: false
      },
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      status: 'subscribed',
      timestamp: new Date().toISOString(),
      culturalContext: {
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Push subscribe error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
} 