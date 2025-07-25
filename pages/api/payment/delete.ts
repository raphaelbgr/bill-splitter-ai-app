import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const paymentSystem = new BrazilianPaymentSystem();

  try {
    await paymentSystem.deleteUserPaymentData(userId);
    return res.status(200).json({ success: true, message: 'All payment data deleted successfully' });
  } catch (error) {
    console.error('Payment Delete API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 