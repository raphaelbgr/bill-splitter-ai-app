import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const brazilianMarketSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = brazilianMarketSchema.parse(req.query);
      
      // Mock Brazilian market data
      const brazilianMarket = {
        userId: validatedData.userId || 'test-user',
        marketInsights: {
          paymentMethods: {
            pix: {
              adoption: 0.85,
              growth: 0.12,
              userSatisfaction: 4.2,
              culturalFactors: ['instant_gratification', 'cost_consciousness'],
            },
            mobileWallets: {
              adoption: 0.45,
              growth: 0.08,
              userSatisfaction: 3.8,
              culturalFactors: ['convenience', 'social_payments'],
            },
            creditCards: {
              adoption: 0.72,
              growth: 0.05,
              userSatisfaction: 4.0,
              culturalFactors: ['installments', 'rewards'],
            },
          },
          regionalTrends: {
            saoPaulo: {
              avgGroupSize: 6.2,
              avgExpensePerPerson: 45.50,
              preferredPaymentMethod: 'pix',
              culturalContext: 'urban_social',
            },
            rioDeJaneiro: {
              avgGroupSize: 5.8,
              avgExpensePerPerson: 52.30,
              preferredPaymentMethod: 'pix',
              culturalContext: 'beach_social',
            },
            minasGerais: {
              avgGroupSize: 4.5,
              avgExpensePerPerson: 38.20,
              preferredPaymentMethod: 'credit_card',
              culturalContext: 'family_oriented',
            },
          },
          culturalInsights: [
            {
              insight: 'Preferência por pagamentos instantâneos',
              confidence: 0.92,
              impact: 'high',
              culturalContext: 'brazilian_immediacy',
            },
            {
              insight: 'Valorização de experiências compartilhadas',
              confidence: 0.88,
              impact: 'medium',
              culturalContext: 'brazilian_social',
            },
            {
              insight: 'Preferência por métodos sem taxas',
              confidence: 0.85,
              impact: 'high',
              culturalContext: 'brazilian_economy',
            },
          ],
        },
        competitiveAnalysis: {
          localCompetitors: [
            {
              name: 'Splitwise',
              marketShare: 0.15,
              strengths: ['simplicity', 'international'],
              weaknesses: ['no_pix_integration', 'limited_brazilian_context'],
            },
            {
              name: 'Divvyd',
              marketShare: 0.08,
              strengths: ['mobile_first', 'social_features'],
              weaknesses: ['limited_ai', 'no_cultural_adaptation'],
            },
          ],
          differentiation: [
            'PIX native integration',
            'Brazilian cultural context',
            'AI-powered categorization',
            'Regional payment methods',
          ],
        },
        culturalContext: {
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(brazilianMarket);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}