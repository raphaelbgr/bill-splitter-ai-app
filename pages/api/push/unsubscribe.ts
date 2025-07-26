import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, userId } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription is required' });
    }

    // Remove subscription from database (simplified for demo)
    // In production, you would remove this from Supabase
    console.log('Push subscription removed:', {
      userId,
      subscription: subscription.endpoint,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Unsubscription successful',
    });
  } catch (error) {
    console.error('Error in push unsubscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 