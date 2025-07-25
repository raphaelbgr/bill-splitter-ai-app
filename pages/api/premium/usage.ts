import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface UsageStats {
  currentDivisions: number;
  monthlyLimit: number;
  analyticsUsage: number;
  teamMembers: number;
  storageUsed: number;
  storageLimit: number;
  usagePercentage: number;
  daysUntilReset: number;
  nextResetDate: string;
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
        error: 'LGPD consent required for usage data',
        lgpdCompliant: false 
      });
    }

    const usageStats = await getUserUsageStats(userId);
    return res.status(200).json({ 
      success: true, 
      data: usageStats, 
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error fetching user usage stats:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function getUserUsageStats(userId: string): Promise<UsageStats> {
  // Mock data - in real implementation, this would come from database
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Simulate different usage levels based on user
  const isPremiumUser = userId.includes('premium') || Math.random() > 0.7;
  const isTeamUser = userId.includes('team') || Math.random() > 0.9;

  let monthlyLimit = 10; // Free tier
  let storageLimit = 100; // MB
  let teamMembers = 0;

  if (isPremiumUser) {
    monthlyLimit = -1; // Unlimited
    storageLimit = 1000; // MB
    teamMembers = Math.floor(Math.random() * 5) + 1;
  }

  if (isTeamUser) {
    monthlyLimit = -1; // Unlimited
    storageLimit = 5000; // MB
    teamMembers = Math.floor(Math.random() * 20) + 5;
  }

  const currentDivisions = isPremiumUser ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 8) + 2;
  const analyticsUsage = isPremiumUser ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 10) + 1;
  const storageUsed = Math.floor(Math.random() * (storageLimit * 0.8)) + 10;

  return {
    currentDivisions,
    monthlyLimit,
    analyticsUsage,
    teamMembers,
    storageUsed,
    storageLimit,
    usagePercentage: monthlyLimit > 0 ? (currentDivisions / monthlyLimit) * 100 : 0,
    daysUntilReset,
    nextResetDate: nextMonth.toISOString()
  };
} 