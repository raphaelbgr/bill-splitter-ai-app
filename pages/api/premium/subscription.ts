import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for subscription
const SubscriptionSchema = z.object({
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
    const validatedData = SubscriptionSchema.parse(req.query);
    
    // Mock subscription data with internationalization support
    const result = {
      userId: validatedData.userId,
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      subscription: getSubscriptionData(validatedData.region),
      culturalContext: getSubscriptionCulturalContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get subscription data
function getSubscriptionData(region?: string): Record<string, any> {
  const subscriptions: Record<string, Record<string, any>> = {
    'BR': {
      planId: 'premium',
      planName: 'Premium',
      status: 'active',
      price: 29.90,
      currency: 'BRL',
      billingCycle: 'monthly',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      autoRenew: true,
      features: ['Divisão avançada', 'Grupos ilimitados', 'Suporte prioritário', 'Analytics']
    },
    'ES': {
      planId: 'premium',
      planName: 'Premium',
      status: 'active',
      price: 29.90,
      currency: 'EUR',
      billingCycle: 'monthly',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      autoRenew: true,
      features: ['División avanzada', 'Grupos ilimitados', 'Soporte prioritario', 'Analytics']
    },
    'US': {
      planId: 'premium',
      planName: 'Premium',
      status: 'active',
      price: 29.90,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      autoRenew: true,
      features: ['Advanced splitting', 'Unlimited groups', 'Priority support', 'Analytics']
    },
    'FR': {
      planId: 'premium',
      planName: 'Premium',
      status: 'active',
      price: 29.90,
      currency: 'EUR',
      billingCycle: 'monthly',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      autoRenew: true,
      features: ['Partage avancé', 'Groupes illimités', 'Support prioritaire', 'Analytics']
    }
  };
  
  return subscriptions[region || 'BR'] || subscriptions['BR'];
}

// Helper function to get subscription cultural context
function getSubscriptionCulturalContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      message: 'Sua assinatura Premium',
      note: 'Você tem acesso a todos os recursos premium',
      benefits: [
        'Divisão avançada de despesas',
        'Grupos ilimitados',
        'Suporte prioritário',
        'Analytics detalhados'
      ],
      language: 'pt-BR'
    },
    'ES': {
      message: 'Tu suscripción Premium',
      note: 'Tienes acceso a todas las funciones premium',
      benefits: [
        'División avanzada de gastos',
        'Grupos ilimitados',
        'Soporte prioritario',
        'Analytics detallados'
      ],
      language: 'es-ES'
    },
    'US': {
      message: 'Your Premium subscription',
      note: 'You have access to all premium features',
      benefits: [
        'Advanced expense splitting',
        'Unlimited groups',
        'Priority support',
        'Detailed analytics'
      ],
      language: 'en-US'
    },
    'FR': {
      message: 'Votre abonnement Premium',
      note: 'Vous avez accès à toutes les fonctionnalités premium',
      benefits: [
        'Partage avancé des dépenses',
        'Groupes illimités',
        'Support prioritaire',
        'Analytics détaillés'
      ],
      language: 'fr-FR'
    }
  };
  
  return context[region || 'BR'] || context['BR'];
} 