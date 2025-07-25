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
        // Get payment preferences for user
        const preferences = await paymentSystem.getPaymentPreferences(userId);
        return res.status(200).json(preferences);

      case 'PUT':
        // Update payment preferences
        const updates = req.body;
        
        if (!updates || typeof updates !== 'object') {
          return res.status(400).json({ error: 'Updates object is required' });
        }

        const updatedPreferences = await paymentSystem.updatePaymentPreferences(userId, updates);
        return res.status(200).json(updatedPreferences);

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Payment Preferences API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 