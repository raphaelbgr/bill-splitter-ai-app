import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianMobilePaymentService } from '../../../lib/mobile-payment-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const mobilePaymentService = new BrazilianMobilePaymentService();

  try {
    const { userId, region = 'BR' } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check mobile wallet availability
    const wallets = await mobilePaymentService.checkMobileWalletAvailability(userId, region);

    return res.status(200).json({
      wallets,
      region,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mobile wallet availability error:', error);
    return res.status(500).json({
      error: 'Erro ao verificar disponibilidade de carteiras móveis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 