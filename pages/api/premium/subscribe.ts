import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for subscription
const SubscribeSchema = z.object({
  userId: z.string().uuid(),
  planId: z.enum(['basic', 'premium', 'team']),
  paymentMethodId: z.string().optional(),
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
    // Validate request body
    const validatedData = SubscribeSchema.parse(req.body);
    
    // Mock subscription with internationalization support
    const result = {
      userId: validatedData.userId,
      subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      planId: validatedData.planId,
      status: 'active',
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      autoRenew: true,
      paymentMethodId: validatedData.paymentMethodId,
      planDetails: getPlanDetails(validatedData.planId, validatedData.region),
      culturalContext: getSubscriptionContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get plan details
function getPlanDetails(planId: string, region?: string): Record<string, any> {
  const plans: Record<string, Record<string, any>> = {
    'basic': {
      'BR': { name: 'Básico', price: 9.90, currency: 'BRL', features: ['Divisão básica', 'Grupos limitados', 'Suporte por email'] },
      'ES': { name: 'Básico', price: 9.90, currency: 'EUR', features: ['División básica', 'Grupos limitados', 'Soporte por email'] },
      'US': { name: 'Basic', price: 9.90, currency: 'USD', features: ['Basic splitting', 'Limited groups', 'Email support'] },
      'FR': { name: 'Basique', price: 9.90, currency: 'EUR', features: ['Partage basique', 'Groupes limités', 'Support par email'] }
    },
    'premium': {
      'BR': { name: 'Premium', price: 29.90, currency: 'BRL', features: ['Divisão avançada', 'Grupos ilimitados', 'Suporte prioritário', 'Analytics'] },
      'ES': { name: 'Premium', price: 29.90, currency: 'EUR', features: ['División avanzada', 'Grupos ilimitados', 'Soporte prioritario', 'Analytics'] },
      'US': { name: 'Premium', price: 29.90, currency: 'USD', features: ['Advanced splitting', 'Unlimited groups', 'Priority support', 'Analytics'] },
      'FR': { name: 'Premium', price: 29.90, currency: 'EUR', features: ['Partage avancé', 'Groupes illimités', 'Support prioritaire', 'Analytics'] }
    },
    'team': {
      'BR': { name: 'Equipe', price: 99.90, currency: 'BRL', features: ['Tudo do Premium', 'Gestão de equipe', 'API access', 'Suporte dedicado'] },
      'ES': { name: 'Equipo', price: 99.90, currency: 'EUR', features: ['Todo de Premium', 'Gestión de equipo', 'API access', 'Soporte dedicado'] },
      'US': { name: 'Team', price: 99.90, currency: 'USD', features: ['Everything in Premium', 'Team management', 'API access', 'Dedicated support'] },
      'FR': { name: 'Équipe', price: 99.90, currency: 'EUR', features: ['Tout de Premium', 'Gestion d\'équipe', 'API access', 'Support dédié'] }
    }
  };
  
  return plans[planId][region || 'BR'] || plans[planId]['BR'];
}

// Helper function to get subscription context
function getSubscriptionContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      message: 'Assinatura ativada com sucesso',
      note: 'Você agora tem acesso a todos os recursos premium',
      support: 'Entre em contato conosco se precisar de ajuda',
      language: 'pt-BR'
    },
    'ES': {
      message: 'Suscripción activada con éxito',
      note: 'Ahora tienes acceso a todas las funciones premium',
      support: 'Contáctanos si necesitas ayuda',
      language: 'es-ES'
    },
    'US': {
      message: 'Subscription activated successfully',
      note: 'You now have access to all premium features',
      support: 'Contact us if you need help',
      language: 'en-US'
    },
    'FR': {
      message: 'Abonnement activé avec succès',
      note: 'Vous avez maintenant accès à toutes les fonctionnalités premium',
      support: 'Contactez-nous si vous avez besoin d\'aide',
      language: 'fr-FR'
    }
  };
  
  return context[region || 'BR'] || context['BR'];
} 