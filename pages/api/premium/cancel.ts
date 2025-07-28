import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for canceling subscription
const CancelSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
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
    const validatedData = CancelSubscriptionSchema.parse(req.body);
    
    // Mock subscription cancellation with internationalization support
    const result = {
      userId: validatedData.userId,
      subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'cancelled',
      reason: validatedData.reason || 'user_request',
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      cancellationDate: new Date().toISOString(),
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      refund: {
        eligible: true,
        amount: 29.90,
        currency: validatedData.region === 'BR' ? 'BRL' : 
                 validatedData.region === 'ES' ? 'EUR' :
                 validatedData.region === 'US' ? 'USD' :
                 validatedData.region === 'FR' ? 'EUR' : 'BRL',
        processed: false
      },
      culturalContext: getCancellationContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get cancellation context
function getCancellationContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      message: 'Assinatura cancelada com sucesso',
      note: 'Você ainda tem acesso aos recursos premium até o final do período atual',
      support: 'Entre em contato conosco se precisar de ajuda',
      language: 'pt-BR'
    },
    'ES': {
      message: 'Suscripción cancelada con éxito',
      note: 'Todavía tienes acceso a las funciones premium hasta el final del período actual',
      support: 'Contáctanos si necesitas ayuda',
      language: 'es-ES'
    },
    'US': {
      message: 'Subscription cancelled successfully',
      note: 'You still have access to premium features until the end of the current period',
      support: 'Contact us if you need help',
      language: 'en-US'
    },
    'FR': {
      message: 'Abonnement annulé avec succès',
      note: 'Vous avez encore accès aux fonctionnalités premium jusqu\'à la fin de la période actuelle',
      support: 'Contactez-nous si vous avez besoin d\'aide',
      language: 'fr-FR'
    }
  };
  
  return context[region || 'BR'] || context['BR'];
} 