import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface UserSubscription {
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate: string;
  planName: string;
  planPrice: number;
  planCurrency: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'premium');
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for subscription data',
        lgpdCompliant: false 
      });
    }

    const subscription = await getUserSubscription(userId);
    return res.status(200).json({ 
      success: true, 
      data: subscription, 
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  // Mock data - in real implementation, this would come from database
  // For demo purposes, we'll return a premium subscription
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  return {
    planId: 'premium',
    status: 'active',
    startDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString(),
    endDate: nextMonth.toISOString(),
    autoRenew: true,
    paymentMethod: 'PIX - Banco do Brasil',
    nextBillingDate: nextMonth.toISOString(),
    planName: 'Premium',
    planPrice: 19.90,
    planCurrency: 'BRL'
  };

  // Alternative: return null for free tier
  // return null;
} 