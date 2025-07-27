import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for usage
const UsageSchema = z.object({
  userId: z.string().uuid(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const validatedData = UsageSchema.parse(req.query);
    
    // Mock usage data with internationalization support
    const result = {
      userId: validatedData.userId,
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      usage: getUsageData(validatedData.region),
      culturalContext: getUsageCulturalContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Usage error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get usage data
function getUsageData(region?: string): Record<string, any> {
  const usage: Record<string, Record<string, any>> = {
    'BR': {
      totalExpenses: 1250,
      totalGroups: 8,
      totalParticipants: 45,
      averageExpense: 156.25,
      currency: 'BRL',
      mostUsedFeature: 'PIX Integration',
      culturalPatterns: {
        preferredPayment: 'PIX',
        groupSize: 'medium',
        splittingStyle: 'equal'
      }
    },
    'ES': {
      totalExpenses: 980,
      totalGroups: 6,
      totalParticipants: 32,
      averageExpense: 163.33,
      currency: 'EUR',
      mostUsedFeature: 'Bizum Integration',
      culturalPatterns: {
        preferredPayment: 'Bizum',
        groupSize: 'medium',
        splittingStyle: 'equal'
      }
    },
    'US': {
      totalExpenses: 2100,
      totalGroups: 12,
      totalParticipants: 78,
      averageExpense: 175.00,
      currency: 'USD',
      mostUsedFeature: 'Venmo Integration',
      culturalPatterns: {
        preferredPayment: 'Venmo',
        groupSize: 'large',
        splittingStyle: 'individual'
      }
    },
    'FR': {
      totalExpenses: 750,
      totalGroups: 5,
      totalParticipants: 28,
      averageExpense: 150.00,
      currency: 'EUR',
      mostUsedFeature: 'Lydia Integration',
      culturalPatterns: {
        preferredPayment: 'Lydia',
        groupSize: 'small',
        splittingStyle: 'precise'
      }
    }
  };
  
  return usage[region || 'BR'] || usage['BR'];
}

// Helper function to get usage cultural context
function getUsageCulturalContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      message: 'Seu uso do RachaAI',
      note: 'Baseado nos seus padrões de uso brasileiros',
      insights: [
        'Você prefere PIX para pagamentos',
        'Grupos médios são mais comuns',
        'Divisão igual é preferida'
      ],
      language: 'pt-BR'
    },
    'ES': {
      message: 'Tu uso de RachaAI',
      note: 'Basado en tus patrones de uso españoles',
      insights: [
        'Prefieres Bizum para pagos',
        'Los grupos medianos son más comunes',
        'La división igual es preferida'
      ],
      language: 'es-ES'
    },
    'US': {
      message: 'Your RachaAI usage',
      note: 'Based on your US usage patterns',
      insights: [
        'You prefer Venmo for payments',
        'Large groups are more common',
        'Individual splitting is preferred'
      ],
      language: 'en-US'
    },
    'FR': {
      message: 'Votre utilisation de RachaAI',
      note: 'Basé sur vos modèles d\'utilisation français',
      insights: [
        'Vous préférez Lydia pour les paiements',
        'Les petits groupes sont plus communs',
        'Le partage précis est préféré'
      ],
      language: 'fr-FR'
    }
  };
  
  return context[region || 'BR'] || context['BR'];
} 