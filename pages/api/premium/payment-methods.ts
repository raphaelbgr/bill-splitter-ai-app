import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schema for payment methods
const PaymentMethodsSchema = z.object({
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
    const validatedData = PaymentMethodsSchema.parse(req.query);
    
    // Mock payment methods with internationalization support
    const result = {
      userId: validatedData.userId,
      region: validatedData.region || 'BR',
      language: validatedData.language || 'pt-BR',
      paymentMethods: getRegionalPaymentMethods(validatedData.region),
      culturalContext: getPaymentCulturalContext(validatedData.region, validatedData.language),
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Payment methods error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}

// Helper function to get regional payment methods
function getRegionalPaymentMethods(region?: string): Record<string, any>[] {
  const methods: Record<string, Record<string, any>[]> = {
    'BR': [
      { id: 'pix_1', type: 'pix', name: 'PIX', isDefault: true, supported: true },
      { id: 'credit_1', type: 'credit_card', name: 'Cartão de Crédito', isDefault: false, supported: true },
      { id: 'debit_1', type: 'debit_card', name: 'Cartão de Débito', isDefault: false, supported: true },
      { id: 'transfer_1', type: 'bank_transfer', name: 'Transferência Bancária', isDefault: false, supported: true }
    ],
    'ES': [
      { id: 'bizum_1', type: 'digital_wallet', name: 'Bizum', isDefault: true, supported: true },
      { id: 'credit_1', type: 'credit_card', name: 'Tarjeta de Crédito', isDefault: false, supported: true },
      { id: 'debit_1', type: 'debit_card', name: 'Tarjeta de Débito', isDefault: false, supported: true },
      { id: 'transfer_1', type: 'bank_transfer', name: 'Transferencia Bancaria', isDefault: false, supported: true }
    ],
    'US': [
      { id: 'venmo_1', type: 'digital_wallet', name: 'Venmo', isDefault: true, supported: true },
      { id: 'credit_1', type: 'credit_card', name: 'Credit Card', isDefault: false, supported: true },
      { id: 'debit_1', type: 'debit_card', name: 'Debit Card', isDefault: false, supported: true },
      { id: 'transfer_1', type: 'bank_transfer', name: 'Bank Transfer', isDefault: false, supported: true }
    ],
    'FR': [
      { id: 'lydia_1', type: 'digital_wallet', name: 'Lydia', isDefault: true, supported: true },
      { id: 'credit_1', type: 'credit_card', name: 'Carte Bancaire', isDefault: false, supported: true },
      { id: 'debit_1', type: 'debit_card', name: 'Carte de Débit', isDefault: false, supported: true },
      { id: 'transfer_1', type: 'bank_transfer', name: 'Virement Bancaire', isDefault: false, supported: true }
    ]
  };
  
  return methods[region || 'BR'] || methods['BR'];
}

// Helper function to get payment cultural context
function getPaymentCulturalContext(region?: string, language?: string): Record<string, any> {
  const context: Record<string, Record<string, any>> = {
    'BR': {
      preferredMethod: 'PIX',
      culturalNotes: [
        'PIX é o método preferido para transferências rápidas',
        'Cartões são aceitos em todos os estabelecimentos',
        'Transferências bancárias são gratuitas'
      ],
      language: 'pt-BR'
    },
    'ES': {
      preferredMethod: 'Bizum',
      culturalNotes: [
        'Bizum es el método preferido para pagos móviles',
        'Las tarjetas son aceptadas en todos los establecimientos',
        'Las transferencias bancarias son gratuitas'
      ],
      language: 'es-ES'
    },
    'US': {
      preferredMethod: 'Venmo',
      culturalNotes: [
        'Venmo is preferred for social payments',
        'Credit cards are accepted everywhere',
        'Bank transfers are free but slower'
      ],
      language: 'en-US'
    },
    'FR': {
      preferredMethod: 'Lydia',
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