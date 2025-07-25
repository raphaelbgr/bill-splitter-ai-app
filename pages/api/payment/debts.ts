import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const paymentSystem = new BrazilianPaymentSystem();

  try {
    switch (method) {
      case 'GET':
        // Get all debts for user
        const debts = await paymentSystem.getDebts(userId);
        return res.status(200).json(debts);

      case 'POST':
        // Create new debt tracking entry
        const { amount, description, method, socialContext, groupId, dueDate } = req.body;
        
        if (!amount || !description || !method || !socialContext) {
          return res.status(400).json({ 
            error: 'Amount, description, method, and socialContext are required' 
          });
        }

        if (typeof amount !== 'number' || amount <= 0) {
          return res.status(400).json({ 
            error: 'Amount must be a positive number' 
          });
        }

        const newDebt = await paymentSystem.createDebtTracking(
          userId,
          amount,
          description,
          method,
          socialContext,
          groupId,
          dueDate ? new Date(dueDate) : undefined
        );
        return res.status(201).json(newDebt);

      case 'PUT':
        // Update debt status
        const { debtId, status } = req.body;
        
        if (!debtId || !status) {
          return res.status(400).json({ error: 'Debt ID and status are required' });
        }

        const updatedDebt = await paymentSystem.updateDebtStatus(userId, debtId, status);
        return res.status(200).json(updatedDebt);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Debts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 