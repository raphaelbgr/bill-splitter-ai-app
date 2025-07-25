import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface CancelRequest {
  userId: string;
  reason?: string;
  feedback?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, reason, feedback } = req.body as CancelRequest;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'premium');
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for subscription cancellation',
        lgpdCompliant: false 
      });
    }

    // Process subscription cancellation
    const result = await processSubscriptionCancellation(userId, reason, feedback);
    
    return res.status(200).json({ 
      success: true, 
      data: result, 
      message: 'Subscription cancelled successfully',
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error processing subscription cancellation:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function processSubscriptionCancellation(
  userId: string, 
  reason?: string, 
  feedback?: string
) {
  // Mock subscription cancellation
  const now = new Date();
  
  // Store cancellation feedback for business intelligence
  if (reason || feedback) {
    await storeCancellationFeedback(userId, reason, feedback);
  }

  // Return cancelled subscription data
  return {
    planId: 'free',
    status: 'cancelled',
    startDate: now.toISOString(),
    endDate: now.toISOString(),
    autoRenew: false,
    paymentMethod: 'N/A',
    nextBillingDate: 'N/A',
    planName: 'Gratuito',
    planPrice: 0,
    planCurrency: 'BRL',
    cancellationDate: now.toISOString(),
    cancellationReason: reason || 'User requested cancellation'
  };
}

async function storeCancellationFeedback(userId: string, reason?: string, feedback?: string) {
  // Mock storing cancellation feedback
  // In real implementation, this would be stored in database for business intelligence
  console.log('Cancellation feedback stored:', {
    userId,
    reason,
    feedback,
    timestamp: new Date().toISOString()
  });
} 