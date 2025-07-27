import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const FeedbackSchema = z.object({
  userId: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  rating: z.number().min(1).max(5).optional(),
  priority: z.string().optional(),
  contactEmail: z.string().email().optional(),
  allowFollowUp: z.boolean().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  userAgent: z.string().optional(),
  deviceInfo: z.object({
    platform: z.string().optional(),
    browser: z.string().optional(),
    version: z.string().optional()
  }).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = FeedbackSchema.parse(req.body);
    
    const result = {
      feedbackId: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: validatedData.userId || 'test-user',
      type: validatedData.type || 'feature',
      category: validatedData.category || 'functionality',
      title: validatedData.title || 'Test feedback',
      description: validatedData.description || 'Test feedback description',
      rating: validatedData.rating || 5,
      priority: validatedData.priority || 'medium',
      contactEmail: validatedData.contactEmail,
      allowFollowUp: validatedData.allowFollowUp || false,
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      status: 'submitted',
      timestamp: new Date().toISOString(),
      culturalContext: {
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR',
        timezone: 'America/Sao_Paulo'
      },
      deviceInfo: validatedData.deviceInfo || {},
      userAgent: validatedData.userAgent
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Feedback submit error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
} 