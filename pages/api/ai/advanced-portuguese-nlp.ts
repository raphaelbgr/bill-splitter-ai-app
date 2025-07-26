import { NextApiRequest, NextApiResponse } from 'next';
import { AdvancedPortugueseNLPProcessor } from '../../../lib/advanced-portuguese-nlp';
import { z } from 'zod';

// Request validation schema
const AdvancedPortugueseNLPRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  userRegion: z.enum(['sao_paulo', 'rio_de_janeiro', 'minas_gerais', 'bahia', 'pernambuco', 'parana', 'rio_grande_sul', 'outros']).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request
    const validatedRequest = AdvancedPortugueseNLPRequestSchema.parse(req.body);
    
    // Initialize processor
    const processor = new AdvancedPortugueseNLPProcessor();
    
    // Process text with advanced Portuguese NLP
    const result = await processor.processAdvancedPortuguese(
      validatedRequest.text,
      validatedRequest.userRegion
    );

    // Return success response
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Advanced Portuguese NLP processing completed successfully'
    });

  } catch (error) {
    console.error('Advanced Portuguese NLP API Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 