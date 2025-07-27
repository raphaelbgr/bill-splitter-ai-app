import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase';

const culturalContextSchema = z.object({
  userId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  contextType: z.enum(['expressions', 'customs', 'payment', 'social', 'all']).optional()
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
    const validatedData = culturalContextSchema.parse(requestData);
    
    // Cultural context data by region
    const culturalContextData = {
      'BR': {
        expressions: {
          splitting: ['rachar a conta', 'dividir igualzinho', 'cada um paga o seu'],
          groups: ['galera', 'turma', 'pessoal'],
          payments: ['vaquinha', 'rateio', 'divisão'],
          social: ['quem convida paga', 'cada um na sua', 'sem frescura']
        },
        customs: {
          tipping: '10% is standard',
          splitting: 'Equal splitting is common',
          groups: 'Large groups are normal',
          celebrations: 'Birthdays and celebrations are important'
        },
        payment: {
          methods: ['PIX', 'Cartão de Crédito', 'Dinheiro', 'Transferência'],
          preferences: 'PIX is preferred for instant transfers',
          splitting: 'Equal splitting is most common',
          currency: 'BRL (R$)'
        },
        social: {
          dynamics: 'Very social, group-oriented',
          communication: 'Direct and friendly',
          relationships: 'Strong emphasis on relationships',
          hospitality: 'Generous hosting culture'
        }
      },
      'ES': {
        expressions: {
          splitting: ['dividir la cuenta', 'pagar a medias', 'cada uno paga lo suyo'],
          groups: ['grupo', 'gente', 'compañeros'],
          payments: ['bote', 'repartir', 'división'],
          social: ['quien invita paga', 'cada uno en lo suyo', 'sin complicaciones']
        },
        customs: {
          tipping: '5-10% is appreciated',
          splitting: 'Equal splitting is common',
          groups: 'Medium groups are typical',
          celebrations: 'Family and friends are important'
        },
        payment: {
          methods: ['Bizum', 'Tarjeta', 'Efectivo', 'Transferencia'],
          preferences: 'Bizum is popular for small amounts',
          splitting: 'Equal splitting is common',
          currency: 'EUR (€)'
        },
        social: {
          dynamics: 'Social but more formal',
          communication: 'Polite and respectful',
          relationships: 'Family and close friends',
          hospitality: 'Warm but formal hosting'
        }
      },
      'US': {
        expressions: {
          splitting: ['split the bill', 'go Dutch', 'pay separately'],
          groups: ['crew', 'team', 'folks'],
          payments: ['chip in', 'pitch in', 'contribute'],
          social: ['whoever invites pays', 'everyone pays their share', 'no drama']
        },
        customs: {
          tipping: '15-20% is expected',
          splitting: 'Individual payment is common',
          groups: 'Smaller groups are typical',
          celebrations: 'Individual celebrations are common'
        },
        payment: {
          methods: ['Venmo', 'PayPal', 'Credit Card', 'Cash'],
          preferences: 'Venmo is popular for splitting',
          splitting: 'Individual payment is common',
          currency: 'USD ($)'
        },
        social: {
          dynamics: 'Individualistic but friendly',
          communication: 'Direct and efficient',
          relationships: 'Professional and casual',
          hospitality: 'Practical and efficient'
        }
      },
      'FR': {
        expressions: {
          splitting: ['partager l\'addition', 'diviser la note', 'chacun paie sa part'],
          groups: ['groupe', 'équipe', 'amis'],
          payments: ['participation', 'contribution', 'division'],
          social: ['celui qui invite paie', 'chacun sa part', 'sans chichi']
        },
        customs: {
          tipping: '5-10% is appreciated',
          splitting: 'Equal splitting is common',
          groups: 'Small to medium groups',
          celebrations: 'Intimate gatherings preferred'
        },
        payment: {
          methods: ['Lydia', 'Carte Bancaire', 'Espèces', 'Virement'],
          preferences: 'Lydia is popular for transfers',
          splitting: 'Equal splitting is common',
          currency: 'EUR (€)'
        },
        social: {
          dynamics: 'Formal but warm',
          communication: 'Polite and sophisticated',
          relationships: 'Close friendships valued',
          hospitality: 'Elegant and refined'
        }
      }
    };

    const region = validatedData.region || 'BR';
    const culturalContext = culturalContextData[region as keyof typeof culturalContextData] || culturalContextData['BR'];
    const contextType = validatedData.contextType || 'all';
    
    // Get specific cultural context data based on type
    let result;
    if (contextType === 'expressions') {
      result = { expressions: culturalContext.expressions };
    } else if (contextType === 'customs') {
      result = { customs: culturalContext.customs };
    } else if (contextType === 'payment') {
      result = { payment: culturalContext.payment };
    } else if (contextType === 'social') {
      result = { social: culturalContext.social };
    } else {
      result = culturalContext;
    }

    // Log cultural context request
    const supabase = createServerSupabaseClient();
    await supabase
      .from('internationalization_logs')
      .insert({
        user_id: validatedData.userId || 'test-user',
        i18n_type: 'cultural_context',
        region,
        language: validatedData.language || 'pt-BR',
        context_type: contextType,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      contextType,
      culturalContext: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('cultural-context error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}