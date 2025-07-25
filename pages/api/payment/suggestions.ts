import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId, amount, context } = req.body;

  if (!userId || !amount || !context) {
    return res.status(400).json({ 
      error: 'User ID, amount, and context are required' 
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ 
      error: 'Amount must be a positive number' 
    });
  }

  if (!context.participants || !context.occasion || !context.socialContext) {
    return res.status(400).json({ 
      error: 'Context must include participants, occasion, and socialContext' 
    });
  }

  const paymentSystem = new BrazilianPaymentSystem();

  try {
    const suggestions = await paymentSystem.generatePaymentSuggestions(
      userId,
      amount,
      context
    );

    return res.status(200).json({
      suggestions,
      amount,
      context,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Payment Suggestions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 