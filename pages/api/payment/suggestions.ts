import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let userId: string;
  let amount: number;
  let context: any;

  if (req.method === 'GET') {
    // Extract from query parameters
    userId = req.query.userId as string;
    amount = parseFloat(req.query.amount as string);
    context = {
      participants: parseInt(req.query.participants as string) || 2,
      occasion: req.query.occasion as string || 'casual',
      socialContext: req.query.socialContext as string || 'friends'
    };
  } else {
    // Extract from body
    const body = req.body;
    userId = body.userId;
    amount = body.amount;
    context = body.context;
  }

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