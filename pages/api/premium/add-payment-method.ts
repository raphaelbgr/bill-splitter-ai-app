import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for adding payment method
const AddPaymentMethodSchema = z.object({
  userId: z.string().uuid(),
  paymentMethod: z.object({
    type: z.enum(['credit_card', 'debit_card', 'pix', 'bank_transfer', 'digital_wallet']),
    name: z.string().min(1),
    details: z.record(z.any()),
    isDefault: z.boolean().optional()
  }),
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
    const validatedData = AddPaymentMethodSchema.parse(req.body);
    
    // Mock payment method addition with internationalization support
    const result = {
      userId: validatedData.userId,
      paymentMethod: {
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: validatedData.paymentMethod.type,
        name: validatedData.paymentMethod.name,
        details: validatedData.paymentMethod.details,
        isDefault: validatedData.paymentMethod.isDefault || false,
        region: validatedData.region || 'BR',
        language: validatedData.language || 'pt-BR'
      },
      regionalSupport: getRegionalPaymentSupport(validatedData.region, validatedData.paymentMethod.type),
      culturalContext: getCulturalPaymentContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Add payment method error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get regional payment support
function getRegionalPaymentSupport(region?: string, paymentType?: string): Record<string, any> {
  const support: Record<string, Record<string, any>> = {
    'BR': {
      credit_card: { supported: true, preferred: false, fees: '2.5%' },
      debit_card: { supported: true, preferred: false, fees: '1.5%' },
      pix: { supported: true, preferred: true, fees: '0%' },
      bank_transfer: { supported: true, preferred: false, fees: '0%' },
      digital_wallet: { supported: true, preferred: false, fees: '1.0%' }
    },
    'ES': {
      credit_card: { supported: true, preferred: true, fees: '2.0%' },
      debit_card: { supported: true, preferred: false, fees: '1.0%' },
      pix: { supported: false, preferred: false, fees: 'N/A' },
      bank_transfer: { supported: true, preferred: false, fees: '0%' },
      digital_wallet: { supported: true, preferred: false, fees: '1.5%' }
    },
    'US': {
      credit_card: { supported: true, preferred: true, fees: '2.9%' },
      debit_card: { supported: true, preferred: false, fees: '1.5%' },
      pix: { supported: false, preferred: false, fees: 'N/A' },
      bank_transfer: { supported: true, preferred: false, fees: '0%' },
      digital_wallet: { supported: true, preferred: false, fees: '2.0%' }
    },
    'FR': {
      credit_card: { supported: true, preferred: true, fees: '2.0%' },
      debit_card: { supported: true, preferred: false, fees: '1.0%' },
      pix: { supported: false, preferred: false, fees: 'N/A' },
      bank_transfer: { supported: true, preferred: false, fees: '0%' },
      digital_wallet: { supported: true, preferred: false, fees: '1.5%' }
    }
  };
  
  return support[region || 'BR'] || support['BR'];
}

// Helper function to get cultural payment context
function getCulturalPaymentContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      preferredMethods: ['PIX', 'Cartão de Crédito'],
      culturalNotes: [
        'PIX é o método preferido para transferências rápidas',
        'Cartões são aceitos em todos os estabelecimentos',
        'Transferências bancárias são gratuitas'
      ],
      language: 'pt-BR'
    },
    'ES': {
      preferredMethods: ['Tarjeta', 'Bizum'],
      culturalNotes: [
        'Bizum es el método preferido para pagos móviles',
        'Las tarjetas son aceptadas en todos los establecimientos',
        'Las transferencias bancarias son gratuitas'
      ],
      language: 'es-ES'
    },
    'US': {
      preferredMethods: ['Credit Card', 'Venmo'],
      culturalNotes: [
        'Venmo is preferred for social payments',
        'Credit cards are accepted everywhere',
        'Bank transfers are free but slower'
      ],
      language: 'en-US'
    },
    'FR': {
      preferredMethods: ['Carte Bancaire', 'Lydia'],
      culturalNotes: [
        'Lydia est préféré pour les paiements mobiles',
        'Les cartes sont acceptées partout',
        'Les virements bancaires sont gratuits'
      ],
      language: 'fr-FR'
    }
  };
  
  return context[region || 'BR'] || context['BR'];
} 