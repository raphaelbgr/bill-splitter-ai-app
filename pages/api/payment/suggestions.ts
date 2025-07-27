import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createPagesSupabaseClient } from '../../../lib/supabase-pages';

const suggestionsSchema = z.object({
  userId: z.string().optional(),
  amount: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  groupId: z.string().uuid().optional(),
  region: z.enum(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'MT', 'MS', 'DF', 'BR']).optional(),
  scenario: z.enum(['restaurante', 'bar', 'shopping', 'viagem', 'evento', 'casa', 'outro']).optional(),
  groupSize: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = suggestionsSchema.parse(req.query);
      const supabase = createPagesSupabaseClient();

      // Get user preferences if userId is provided
      let userPreferences = null;
      if (validatedData.userId) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('ai_preferences, notification_preferences, region')
          .eq('id', validatedData.userId)
          .single();
        
        userPreferences = profile;
      }

      // Get group context if groupId is provided
      let groupContext = null;
      if (validatedData.groupId) {
        const { data: group } = await supabase
          .from('groups')
          .select('name, group_type, default_split_method, currency')
          .eq('id', validatedData.groupId)
          .single();
        
        groupContext = group;
      }

      // Analyze cultural context and regional preferences
      const region = validatedData.region || userPreferences?.region || 'BR';
      const scenario = validatedData.scenario || 'restaurante';
      const groupSize = validatedData.groupSize || 2;
      const amount = validatedData.amount || 50.00;

      // Generate payment suggestions based on Brazilian cultural context
      const suggestions = generatePaymentSuggestions({
        region,
        scenario,
        groupSize,
        amount,
        userPreferences,
        groupContext
      });

      // Get recent payment patterns for this user/group
      let recentPatterns = [];
      if (validatedData.userId) {
        const { data: recentExpenses } = await supabase
          .from('expenses')
          .select('payment_method, total_amount, expense_date')
          .eq('paid_by', validatedData.userId)
          .gte('expense_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('expense_date', { ascending: false })
          .limit(10);

        recentPatterns = recentExpenses || [];
      }

      // Calculate payment method preferences based on recent usage
      const paymentPreferences = analyzePaymentPreferences(recentPatterns, region);

      const response = {
        userId: validatedData.userId || 'anonymous',
        amount,
        suggestions,
        culturalContext: {
          region,
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          scenario,
          groupSize,
        },
        paymentPreferences,
        recentPatterns: recentPatterns.length,
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Payment suggestions error:', error);
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
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function generatePaymentSuggestions({
  region,
  scenario,
  groupSize,
  amount,
  userPreferences,
  groupContext
}: {
  region: string;
  scenario: string;
  groupSize: number;
  amount: number;
  userPreferences: any;
  groupContext: any;
}) {
  const suggestions = [];

  // PIX is always the top choice for Brazilian users
  suggestions.push({
    id: 'pix-instant',
    type: 'pix',
    title: 'PIX Instantâneo',
    description: 'Transferência instantânea e gratuita',
    icon: 'pix-icon',
    priority: 1,
    estimatedTime: 'instant',
    fee: 0,
    region: 'BR',
    culturalFactors: ['instant_gratification', 'cost_consciousness', 'brazilian_convenience'],
    confidence: 0.95,
  });

  // Mobile wallets for social scenarios
  if (scenario === 'restaurante' || scenario === 'bar' || scenario === 'shopping') {
    suggestions.push({
      id: 'mobile-wallet',
      type: 'mobile_wallet',
      title: 'Carteira Digital',
      description: 'Pagamento via carteira digital (PicPay, Mercado Pago)',
      icon: 'wallet-icon',
      priority: 2,
      estimatedTime: '5_minutes',
      fee: 0,
      region: 'BR',
      culturalFactors: ['social_payments', 'convenience', 'brazilian_mobile_adoption'],
      confidence: 0.85,
    });
  }

  // Credit card for larger amounts or travel
  if (amount > 100 || scenario === 'viagem') {
    suggestions.push({
      id: 'credit-card',
      type: 'credit_card',
      title: 'Cartão de Crédito',
      description: 'Pagamento via cartão de crédito',
      icon: 'card-icon',
      priority: 3,
      estimatedTime: 'instant',
      fee: 0,
      region: 'BR',
      culturalFactors: ['installments', 'rewards', 'brazilian_credit_culture'],
      confidence: 0.80,
    });
  }

  // Bank transfer for formal groups or larger amounts
  if (groupSize > 5 || amount > 200) {
    suggestions.push({
      id: 'bank-transfer',
      type: 'bank_transfer',
      title: 'Transferência Bancária',
      description: 'Transferência entre contas bancárias',
      icon: 'bank-icon',
      priority: 4,
      estimatedTime: '1_business_day',
      fee: 0,
      region: 'BR',
      culturalFactors: ['formal_payments', 'trust', 'brazilian_banking'],
      confidence: 0.75,
    });
  }

  // Regional variations
  if (region === 'SP' || region === 'RJ') {
    // Add Uber Pay for urban areas
    suggestions.push({
      id: 'uber-pay',
      type: 'app_payment',
      title: 'Uber Pay',
      description: 'Pagamento via aplicativo Uber',
      icon: 'uber-icon',
      priority: 5,
      estimatedTime: 'instant',
      fee: 0,
      region: 'BR',
      culturalFactors: ['urban_convenience', 'app_integration'],
      confidence: 0.70,
    });
  }

  // Group-specific suggestions
  if (groupContext?.group_type === 'recurring') {
    suggestions.push({
      id: 'recurring-payment',
      type: 'recurring',
      title: 'Pagamento Recorrente',
      description: 'Configurar pagamento automático',
      icon: 'recurring-icon',
      priority: 6,
      estimatedTime: 'instant',
      fee: 0,
      region: 'BR',
      culturalFactors: ['convenience', 'automation'],
      confidence: 0.65,
    });
  }

  return suggestions;
}

function analyzePaymentPreferences(recentPatterns: any[], region: string) {
  const preferences = {
    pix: { usage: 0, preference: 0.85 },
    mobile_wallet: { usage: 0, preference: 0.45 },
    credit_card: { usage: 0, preference: 0.72 },
    bank_transfer: { usage: 0, preference: 0.30 },
  };

  // Analyze recent payment patterns
  recentPatterns.forEach(expense => {
    const method = expense.payment_method;
    if (method && preferences[method as keyof typeof preferences]) {
      preferences[method as keyof typeof preferences].usage++;
    }
  });

  // Adjust preferences based on regional trends
  if (region === 'SP' || region === 'RJ') {
    preferences.mobile_wallet.preference += 0.1;
    preferences.credit_card.preference += 0.05;
  } else if (region === 'MG' || region === 'RS') {
    preferences.bank_transfer.preference += 0.1;
  }

  return preferences;
}