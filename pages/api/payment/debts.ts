import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const debtsSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = debtsSchema.parse(req.query);
      
      // Mock debts data
      const debts = {
        userId: validatedData.userId || 'test-user',
        debts: [
          {
            id: 'debt-1',
            amount: 25.50,
            description: 'Almoço no rodízio',
            debtor: 'João Silva',
            creditor: 'Maria Santos',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            groupId: 'group-1',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'debt-2',
            amount: 15.00,
            description: 'Uber compartilhado',
            debtor: 'Ana Costa',
            creditor: 'Pedro Lima',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            groupId: 'group-1',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'debt-3',
            amount: 30.00,
            description: 'Ingressos do cinema',
            debtor: 'Carlos Oliveira',
            creditor: 'João Silva',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            groupId: 'group-2',
            createdAt: new Date().toISOString(),
          },
        ],
        summary: {
          totalDebts: 3,
          totalAmount: 70.50,
          pendingAmount: 70.50,
          paidAmount: 0,
          overdueAmount: 0,
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

      return res.status(200).json(debts);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}