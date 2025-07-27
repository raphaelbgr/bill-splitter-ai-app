import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const groupDynamicsSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = groupDynamicsSchema.parse(req.query);
      
      // Mock group dynamics data
      const groupDynamics = {
        userId: validatedData.userId || 'test-user',
        groups: [
          {
            id: 'group-1',
            name: 'Amigos do Trabalho',
            members: 8,
            totalExpenses: 1250.00,
            averageExpense: 156.25,
            mostActiveMember: 'João Silva',
            leastActiveMember: 'Ana Costa',
            paymentEfficiency: 0.85,
            culturalDynamics: {
              primaryLanguage: 'pt-BR',
              paymentPreferences: ['pix', 'mobile_wallet'],
              socialContext: 'professional',
              regionalFactors: 'são_paulo',
            },
          },
          {
            id: 'group-2',
            name: 'Família',
            members: 4,
            totalExpenses: 800.00,
            averageExpense: 200.00,
            mostActiveMember: 'Maria Santos',
            leastActiveMember: 'Pedro Lima',
            paymentEfficiency: 0.92,
            culturalDynamics: {
              primaryLanguage: 'pt-BR',
              paymentPreferences: ['pix', 'credit_card'],
              socialContext: 'family',
              regionalFactors: 'brasil',
            },
          },
        ],
        insights: [
          {
            type: 'payment_pattern',
            title: 'PIX é o método preferido',
            description: '80% dos pagamentos são feitos via PIX',
            confidence: 0.88,
            impact: 'high',
          },
          {
            type: 'social_dynamics',
            title: 'Grupos menores são mais eficientes',
            description: 'Grupos com 4-6 membros têm melhor pagamento',
            confidence: 0.75,
            impact: 'medium',
          },
          {
            type: 'cultural_insight',
            title: 'Preferência por pagamentos instantâneos',
            description: 'Brasileiros preferem métodos rápidos como PIX',
            confidence: 0.92,
            impact: 'high',
          },
        ],
        culturalContext: {
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(groupDynamics);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}