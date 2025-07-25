import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface SubscriptionRequest {
  userId: string;
  planId: string;
  paymentMethodId?: string;
  autoRenew?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, planId, paymentMethodId, autoRenew } = req.body as SubscriptionRequest;

  if (!userId || !planId) {
    return res.status(400).json({ error: 'User ID and Plan ID are required' });
  }

  try {
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'premium');
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for subscription changes',
        lgpdCompliant: false 
      });
    }

    // Validate plan exists
    const validPlans = ['free', 'premium', 'team', 'enterprise'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Process subscription change
    const result = await processSubscriptionChange(userId, planId, paymentMethodId, autoRenew);
    
    return res.status(200).json({ 
      success: true, 
      data: result, 
      message: 'Subscription updated successfully',
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error processing subscription change:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function processSubscriptionChange(
  userId: string, 
  planId: string, 
  paymentMethodId?: string, 
  autoRenew: boolean = true
) {
  // Mock subscription processing
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // Get plan details
  const planDetails = await getPlanDetails(planId);
  
  // Simulate payment processing
  if (planId !== 'free') {
    const paymentResult = await processPayment(userId, planDetails.price, paymentMethodId);
    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }
  }

  // Return updated subscription data
  return {
    planId,
    status: 'active',
    startDate: now.toISOString(),
    endDate: nextMonth.toISOString(),
    autoRenew,
    paymentMethod: paymentMethodId || 'PIX - Banco do Brasil',
    nextBillingDate: nextMonth.toISOString(),
    planName: planDetails.name,
    planPrice: planDetails.price,
    planCurrency: planDetails.currency
  };
}

async function getPlanDetails(planId: string) {
  const plans = {
    free: { name: 'Gratuito', price: 0, currency: 'BRL' },
    premium: { name: 'Premium', price: 19.90, currency: 'BRL' },
    team: { name: 'Equipe', price: 49.90, currency: 'BRL' },
    enterprise: { name: 'Empresarial', price: 199.90, currency: 'BRL' }
  };
  
  return plans[planId as keyof typeof plans] || plans.free;
}

async function processPayment(userId: string, amount: number, paymentMethodId?: string) {
  // Mock payment processing
  // In real implementation, this would integrate with Brazilian payment providers
  return {
    success: true,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency: 'BRL',
    paymentMethod: paymentMethodId || 'pix',
    status: 'completed'
  };
} 