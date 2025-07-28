import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for plans
const PlansSchema = z.object({
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
    const validatedData = PlansSchema.parse(req.query);
    
    // Mock plans data with internationalization support
    const result = {
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      plans: getRegionalPlans(validatedData.region),
      culturalContext: getPlansCulturalContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Plans error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get regional plans
function getRegionalPlans(region?: string): Record<string, any>[] {
  const plans: Record<string, Record<string, any>[]> = {
    'BR': [
      {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        currency: 'BRL',
        billingCycle: 'monthly',
        features: ['Divisão básica', '3 grupos', 'Suporte por email'],
        limitations: ['Máximo 3 grupos', 'Sem analytics', 'Suporte básico']
      },
      {
        id: 'basic',
        name: 'Básico',
        price: 9.90,
        currency: 'BRL',
        billingCycle: 'monthly',
        features: ['Divisão avançada', '10 grupos', 'Suporte por email', 'Analytics básico'],
        limitations: ['Máximo 10 grupos', 'Analytics limitado']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29.90,
        currency: 'BRL',
        billingCycle: 'monthly',
        features: ['Divisão avançada', 'Grupos ilimitados', 'Suporte prioritário', 'Analytics completo'],
        limitations: []
      },
      {
        id: 'team',
        name: 'Equipe',
        price: 99.90,
        currency: 'BRL',
        billingCycle: 'monthly',
        features: ['Tudo do Premium', 'Gestão de equipe', 'API access', 'Suporte dedicado'],
        limitations: []
      }
    ],
    'ES': [
      {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['División básica', '3 grupos', 'Soporte por email'],
        limitations: ['Máximo 3 grupos', 'Sin analytics', 'Soporte básico']
      },
      {
        id: 'basic',
        name: 'Básico',
        price: 9.90,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['División avanzada', '10 grupos', 'Soporte por email', 'Analytics básico'],
        limitations: ['Máximo 10 grupos', 'Analytics limitado']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29.90,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['División avanzada', 'Grupos ilimitados', 'Soporte prioritario', 'Analytics completo'],
        limitations: []
      },
      {
        id: 'team',
        name: 'Equipo',
        price: 99.90,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['Todo de Premium', 'Gestión de equipo', 'API access', 'Soporte dedicado'],
        limitations: []
      }
    ],
    'US': [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Basic splitting', '3 groups', 'Email support'],
        limitations: ['Maximum 3 groups', 'No analytics', 'Basic support']
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 9.90,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Advanced splitting', '10 groups', 'Email support', 'Basic analytics'],
        limitations: ['Maximum 10 groups', 'Limited analytics']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29.90,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Advanced splitting', 'Unlimited groups', 'Priority support', 'Full analytics'],
        limitations: []
      },
      {
        id: 'team',
        name: 'Team',
        price: 99.90,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Everything in Premium', 'Team management', 'API access', 'Dedicated support'],
        limitations: []
      }
    ],
    'FR': [
      {
        id: 'free',
        name: 'Gratuit',
        price: 0,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['Partage basique', '3 groupes', 'Support par email'],
        limitations: ['Maximum 3 groupes', 'Sans analytics', 'Support basique']
      },
      {
        id: 'basic',
        name: 'Basique',
        price: 9.90,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['Partage avancé', '10 groupes', 'Support par email', 'Analytics basique'],
        limitations: ['Maximum 10 groupes', 'Analytics limité']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29.90,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['Partage avancé', 'Groupes illimités', 'Support prioritaire', 'Analytics complet'],
        limitations: []
      },
      {
        id: 'team',
        name: 'Équipe',
        price: 99.90,
        currency: 'EUR',
        billingCycle: 'monthly',
        features: ['Tout de Premium', 'Gestion d\'équipe', 'API access', 'Support dédié'],
        limitations: []
      }
    ]
  };
  
  return plans[region || 'BR'] || plans['BR'];
}

// Helper function to get plans cultural context
function getPlansCulturalContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      message: 'Escolha seu plano',
      note: 'Todos os planos incluem recursos básicos de divisão de despesas',
      popularPlan: 'Premium',
      language: 'pt-BR'
    },
    'ES': {
      message: 'Elige tu plan',
      note: 'Todos los planes incluyen funciones básicas de división de gastos',
      popularPlan: 'Premium',
      language: 'es-ES'
    },
    'US': {
      message: 'Choose your plan',
      note: 'All plans include basic expense splitting features',
      popularPlan: 'Premium',
      language: 'en-US'
    },
    'FR': {
      message: 'Choisissez votre plan',
      note: 'Tous les plans incluent des fonctionnalités de base de partage des dépenses',
      popularPlan: 'Premium',
      language: 'fr-FR'
    }
  };
  
  return context[region || 'BR'] || context['BR'];
} 