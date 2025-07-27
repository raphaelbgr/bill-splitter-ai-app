import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(1).optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  marketingConsent: z.boolean().optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // For test/dev: return a mock response
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        },
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_at: Date.now() + 3600000
        }
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = SignupSchema.parse(req.body);
    
    const result = {
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: validatedData.email || 'test@example.com',
      name: validatedData.name || 'Test User',
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      marketingConsent: validatedData.marketingConsent || false,
      status: 'active',
      createdAt: new Date().toISOString(),
      culturalContext: {
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    };

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
} 