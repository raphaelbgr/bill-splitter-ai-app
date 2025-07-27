import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const ConsentSchema = z.object({
  userId: z.string(),
  consentType: z.enum(['data_processing', 'marketing', 'analytics', 'third_party']),
  granted: z.boolean().optional(),
  version: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId required' });
    }

    // Mock consent data
    return res.status(200).json({
      success: true,
      data: {
        userId,
        consents: {
          data_processing: {
            granted: true,
            version: '2024.1',
            timestamp: new Date().toISOString()
          },
          marketing: {
            granted: false,
            version: '2024.1',
            timestamp: new Date().toISOString()
          }
        }
      }
    });
  }

  if (req.method === 'POST') {
    try {
      const validatedData = ConsentSchema.parse(req.body);
      
      const result = {
        success: true,
        data: {
          userId: validatedData.userId,
          consentType: validatedData.consentType,
          granted: validatedData.granted || true,
          version: validatedData.version || '2024.1',
          region: validatedData.region || 'BR',
          language: validatedData.language || 'pt-BR',
          timestamp: new Date().toISOString()
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('Consent POST error:', error);
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error instanceof z.ZodError ? error.errors : 'Unknown error'
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const validatedData = ConsentSchema.parse(req.body);
      
      const result = {
        success: true,
        data: {
          userId: validatedData.userId,
          consentType: validatedData.consentType,
          deleted: true,
          timestamp: new Date().toISOString()
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('Consent DELETE error:', error);
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error instanceof z.ZodError ? error.errors : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 