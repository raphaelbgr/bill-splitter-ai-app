import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const paymentSystem = new BrazilianPaymentSystem();

  try {
    const exportData = await paymentSystem.exportUserPaymentData(userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="payment-data-${userId}-${new Date().toISOString().split('T')[0]}.json"`);
    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Payment Export API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 