import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianMobilePaymentService } from '../../../lib/mobile-payment-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET' && method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const mobilePaymentService = new BrazilianMobilePaymentService();

  try {
    let userId: string;
    let amount: number;
    let region: string;
    let socialContext: string;
    let deviceType: string;
    let networkType: string;

    if (method === 'GET') {
      // Extract from query parameters
      userId = req.query.userId as string;
      amount = parseFloat(req.query.amount as string);
      region = (req.query.region as string) || 'BR';
      socialContext = (req.query.socialContext as string) || 'casual';
      deviceType = (req.query.deviceType as string) || 'mobile';
      networkType = (req.query.networkType as string) || 'wifi';
    } else {
      // Extract from body
      const body = req.body;
      userId = body.userId;
      amount = body.amount;
      region = body.region || 'BR';
      socialContext = body.socialContext;
      deviceType = body.deviceType || 'mobile';
      networkType = body.networkType || 'wifi';
    }

    // Validate required fields
    if (!userId || !amount || !socialContext) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, socialContext'
      });
    }

    // Validate amount
    if (amount <= 0 || amount > 20000) {
      return res.status(400).json({
        error: 'Amount must be between R$ 0.01 and R$ 20.000'
      });
    }

    // Generate mobile payment suggestions
    const suggestions = await mobilePaymentService.generateMobilePaymentSuggestions(
      userId,
      amount,
      {
        region,
        socialContext,
        deviceType,
        networkType
      }
    );

    return res.status(200).json({
      suggestions,
      context: {
        region,
        socialContext,
        deviceType,
        networkType,
        amount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mobile payment suggestions error:', error);
    return res.status(500).json({
      error: 'Erro ao gerar sugestões de pagamento móvel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 