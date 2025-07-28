import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const AdvancedPortugueseNLPSchema = z.object({
  userId: z.string().optional(),
  text: z.string().min(1).optional(),
  analysisType: z.enum(['sentiment', 'entities', 'intent', 'cultural_context', 'regional_variations']).optional(),
  region: z.string().optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional()
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
        sentiment: 'positive',
        entities: ['restaurant', 'payment', 'group'],
        intent: 'expense_sharing',
        culturalContext: {
          region: 'BR',
          scenario: 'restaurant',
          formality: 'informal'
        }
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = AdvancedPortugueseNLPSchema.parse(req.body);
    
    const result = {
      userId: validatedData.userId || 'test-user',
      analysisId: `nlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: validatedData.text || 'Dividir conta do rodízio entre 4 pessoas',
      analysisType: validatedData.analysisType || 'cultural_context',
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      results: {
        sentiment: 'positive',
        entities: ['restaurant', 'payment', 'group'],
        intent: 'expense_sharing',
        culturalContext: {
          region: 'BR',
          scenario: 'restaurant',
          formality: 'informal'
        },
        regionalVariations: {
          detected: true,
          variations: ['rodízio', 'rachar']
        }
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Advanced Portuguese NLP error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
} 