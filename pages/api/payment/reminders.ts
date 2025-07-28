import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const remindersSchema = z.object({
  userId: z.string().optional(),
  debtId: z.string().optional(),
  type: z.string().optional(),
  message: z.string().optional(),
  method: z.string().optional(),
  scheduledFor: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const validatedData = remindersSchema.parse(req.body);
      
      // Mock reminder response
      const reminder = {
        userId: validatedData.userId || 'test-user',
        reminderId: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        debtId: validatedData.debtId || 'debt-123',
        type: validatedData.type || 'payment_due',
        message: validatedData.message || 'Lembrete de pagamento pendente',
        method: validatedData.method || 'push',
        scheduledFor: validatedData.scheduledFor || new Date().toISOString(),
        status: 'scheduled',
        culturalContext: {
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        notification: {
          title: 'Lembrete de Pagamento',
          body: validatedData.message || 'Lembrete de pagamento pendente',
          icon: 'payment-icon',
          badge: 'payment-badge',
        },
        timestamp: new Date().toISOString(),
      };

      return res.status(201).json(reminder);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}