import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase';

const regionalPaymentsSchema = z.object({
  userId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  paymentType: z.enum(['instant', 'card', 'bank', 'crypto', 'all']).optional()
}).passthrough();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestData = req.method === 'POST' ? req.body : req.query;
    const validatedData = regionalPaymentsSchema.parse(requestData);
    
    // Regional payments data by region
    const regionalPaymentsData = {
      'BR': {
        instant: {
          pix: {
            name: 'PIX',
            description: 'Instant Brazilian payment system',
            processingTime: 'Instant',
            fees: 'Free',
            limits: 'No limits',
            popularity: 95
          },
          ted: {
            name: 'TED',
            description: 'Electronic transfer',
            processingTime: 'Same day',
            fees: 'Low',
            limits: 'High limits',
            popularity: 85
          }
        },
        card: {
          creditCard: {
            name: 'Cartão de Crédito',
            description: 'Credit card payments',
            processingTime: '2-3 days',
            fees: '2-3%',
            limits: 'Card limit',
            popularity: 90
          },
          debitCard: {
            name: 'Cartão de Débito',
            description: 'Debit card payments',
            processingTime: 'Instant',
            fees: 'Low',
            limits: 'Account balance',
            popularity: 80
          }
        },
        bank: {
          bankTransfer: {
            name: 'Transferência Bancária',
            description: 'Traditional bank transfer',
            processingTime: '1-2 days',
            fees: 'Low',
            limits: 'High limits',
            popularity: 75
          },
          boleto: {
            name: 'Boleto',
            description: 'Bank slip payment',
            processingTime: '1-3 days',
            fees: 'Low',
            limits: 'No limits',
            popularity: 70
          }
        },
        crypto: {
          bitcoin: {
            name: 'Bitcoin',
            description: 'Cryptocurrency payment',
            processingTime: '10-30 minutes',
            fees: 'Variable',
            limits: 'No limits',
            popularity: 15
          }
        }
      },
      'ES': {
        instant: {
          bizum: {
            name: 'Bizum',
            description: 'Instant Spanish payment system',
            processingTime: 'Instant',
            fees: 'Free',
            limits: '€500/day',
            popularity: 90
          },
          transfer: {
            name: 'Transferencia',
            description: 'Bank transfer',
            processingTime: 'Same day',
            fees: 'Low',
            limits: 'High limits',
            popularity: 80
          }
        },
        card: {
          creditCard: {
            name: 'Tarjeta de Crédito',
            description: 'Credit card payments',
            processingTime: '2-3 days',
            fees: '2-3%',
            limits: 'Card limit',
            popularity: 85
          },
          debitCard: {
            name: 'Tarjeta de Débito',
            description: 'Debit card payments',
            processingTime: 'Instant',
            fees: 'Low',
            limits: 'Account balance',
            popularity: 75
          }
        },
        bank: {
          bankTransfer: {
            name: 'Transferencia Bancaria',
            description: 'Traditional bank transfer',
            processingTime: '1-2 days',
            fees: 'Low',
            limits: 'High limits',
            popularity: 70
          }
        },
        crypto: {
          bitcoin: {
            name: 'Bitcoin',
            description: 'Cryptocurrency payment',
            processingTime: '10-30 minutes',
            fees: 'Variable',
            limits: 'No limits',
            popularity: 10
          }
        }
      },
      'US': {
        instant: {
          venmo: {
            name: 'Venmo',
            description: 'Popular US payment app',
            processingTime: 'Instant',
            fees: 'Free (personal)',
            limits: '$3,000/week',
            popularity: 95
          },
          zelle: {
            name: 'Zelle',
            description: 'Bank-to-bank transfer',
            processingTime: 'Instant',
            fees: 'Free',
            limits: 'Bank limits',
            popularity: 85
          }
        },
        card: {
          creditCard: {
            name: 'Credit Card',
            description: 'Credit card payments',
            processingTime: '2-3 days',
            fees: '2-3%',
            limits: 'Card limit',
            popularity: 90
          },
          debitCard: {
            name: 'Debit Card',
            description: 'Debit card payments',
            processingTime: 'Instant',
            fees: 'Low',
            limits: 'Account balance',
            popularity: 80
          }
        },
        bank: {
          ach: {
            name: 'ACH Transfer',
            description: 'Automated clearing house',
            processingTime: '1-3 days',
            fees: 'Low',
            limits: 'High limits',
            popularity: 75
          }
        },
        crypto: {
          bitcoin: {
            name: 'Bitcoin',
            description: 'Cryptocurrency payment',
            processingTime: '10-30 minutes',
            fees: 'Variable',
            limits: 'No limits',
            popularity: 20
          }
        }
      },
      'FR': {
        instant: {
          lydia: {
            name: 'Lydia',
            description: 'French payment app',
            processingTime: 'Instant',
            fees: 'Free',
            limits: '€1,000/day',
            popularity: 85
          },
          transfer: {
            name: 'Virement',
            description: 'Bank transfer',
            processingTime: 'Same day',
            fees: 'Low',
            limits: 'High limits',
            popularity: 80
          }
        },
        card: {
          creditCard: {
            name: 'Carte de Crédit',
            description: 'Credit card payments',
            processingTime: '2-3 days',
            fees: '2-3%',
            limits: 'Card limit',
            popularity: 85
          },
          debitCard: {
            name: 'Carte de Débit',
            description: 'Debit card payments',
            processingTime: 'Instant',
            fees: 'Low',
            limits: 'Account balance',
            popularity: 75
          }
        },
        bank: {
          bankTransfer: {
            name: 'Virement Bancaire',
            description: 'Traditional bank transfer',
            processingTime: '1-2 days',
            fees: 'Low',
            limits: 'High limits',
            popularity: 70
          }
        },
        crypto: {
          bitcoin: {
            name: 'Bitcoin',
            description: 'Cryptocurrency payment',
            processingTime: '10-30 minutes',
            fees: 'Variable',
            limits: 'No limits',
            popularity: 12
          }
        }
      }
    };

    const region = validatedData.region || 'BR';
    const payments = regionalPaymentsData[region as keyof typeof regionalPaymentsData] || regionalPaymentsData['BR'];
    const paymentType = validatedData.paymentType || 'all';
    
    // Get specific payment data based on type
    let result;
    if (paymentType === 'instant') {
      result = { instant: payments.instant };
    } else if (paymentType === 'card') {
      result = { card: payments.card };
    } else if (paymentType === 'bank') {
      result = { bank: payments.bank };
    } else if (paymentType === 'crypto') {
      result = { crypto: payments.crypto };
    } else {
      result = payments;
    }

    // Log regional payments request
    const supabase = createServerSupabaseClient();
    await supabase
      .from('internationalization_logs')
      .insert({
        user_id: validatedData.userId || 'test-user',
        i18n_type: 'regional_payments',
        region,
        language: validatedData.language || 'pt-BR',
        payment_type: paymentType,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      paymentType,
      regionalPayments: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('regional-payments error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}