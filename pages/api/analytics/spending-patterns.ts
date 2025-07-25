import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { performanceOptimizer } from '../../../lib/performance-optimizer';

interface BrazilianSpendingPattern {
  regionalTrends: {
    region: string;
    averageSpending: number;
    paymentPreference: string;
    culturalInfluence: string;
    seasonalPattern: string;
  }[];
  culturalInfluences: {
    factor: string;
    impact: number;
    description: string;
  }[];
  paymentPreferences: {
    method: string;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  socialPatterns: {
    groupSize: number;
    averageContribution: number;
    frequency: string;
    culturalContext: string;
  }[];
  seasonalAnalysis: {
    month: string;
    spending: number;
    category: string;
    reason: string;
  }[];
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
    const consent = await memorySystem.getUserConsent(userId, 'analytics');
    
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for spending pattern analysis',
        lgpdCompliant: false 
      });
    }

    const spendingPatterns = await getBrazilianSpendingPatterns(userId);
    
    return res.status(200).json({ 
      success: true, 
      data: spendingPatterns, 
      timestamp: new Date().toISOString(),
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Spending patterns API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getBrazilianSpendingPatterns(userId: string): Promise<BrazilianSpendingPattern> {
  const performanceData = await performanceOptimizer.getPerformanceAnalytics();
  
  // Mock data based on Brazilian market research and cultural patterns
  return {
    regionalTrends: [
      {
        region: 'São Paulo',
        averageSpending: 245.67,
        paymentPreference: 'PIX (65%)',
        culturalInfluence: 'High urbanization, diverse culture',
        seasonalPattern: 'Peak during holidays and festivals'
      },
      {
        region: 'Rio de Janeiro',
        averageSpending: 198.34,
        paymentPreference: 'Credit Card (45%)',
        culturalInfluence: 'Tourism and beach culture',
        seasonalPattern: 'Summer peak, Carnival influence'
      },
      {
        region: 'Minas Gerais',
        averageSpending: 156.78,
        paymentPreference: 'PIX (70%)',
        culturalInfluence: 'Traditional values, family-oriented',
        seasonalPattern: 'Religious holidays, family gatherings'
      },
      {
        region: 'Bahia',
        averageSpending: 134.56,
        paymentPreference: 'Cash (40%)',
        culturalInfluence: 'Afro-Brazilian culture, strong community',
        seasonalPattern: 'Carnival, religious festivals'
      },
      {
        region: 'Paraná',
        averageSpending: 178.90,
        paymentPreference: 'Transfer (55%)',
        culturalInfluence: 'European heritage, organized approach',
        seasonalPattern: 'German festivals, Oktoberfest'
      }
    ],
    culturalInfluences: [
      {
        factor: 'Family-oriented spending',
        impact: 78,
        description: 'Brazilian families prioritize group activities and shared expenses'
      },
      {
        factor: 'Social status considerations',
        impact: 65,
        description: 'Spending patterns reflect social standing and group dynamics'
      },
      {
        factor: 'Religious and cultural events',
        impact: 72,
        description: 'Significant spending during festivals, holidays, and celebrations'
      },
      {
        factor: 'Regional pride and identity',
        impact: 58,
        description: 'Local traditions influence spending on regional products and services'
      },
      {
        factor: 'Community support networks',
        impact: 81,
        description: 'Strong emphasis on helping friends and family financially'
      }
    ],
    paymentPreferences: [
      {
        method: 'PIX',
        percentage: 68,
        trend: 'increasing'
      },
      {
        method: 'Credit Card',
        percentage: 45,
        trend: 'stable'
      },
      {
        method: 'Cash',
        percentage: 32,
        trend: 'decreasing'
      },
      {
        method: 'Bank Transfer',
        percentage: 28,
        trend: 'increasing'
      },
      {
        method: 'Boleto',
        percentage: 15,
        trend: 'decreasing'
      }
    ],
    socialPatterns: [
      {
        groupSize: 4,
        averageContribution: 67.50,
        frequency: 'Weekly',
        culturalContext: 'Family dinners and weekend activities'
      },
      {
        groupSize: 6,
        averageContribution: 45.20,
        frequency: 'Bi-weekly',
        culturalContext: 'Friend group outings and celebrations'
      },
      {
        groupSize: 8,
        averageContribution: 38.75,
        frequency: 'Monthly',
        culturalContext: 'Large family gatherings and special events'
      },
      {
        groupSize: 12,
        averageContribution: 28.90,
        frequency: 'Quarterly',
        culturalContext: 'Extended family celebrations and holidays'
      }
    ],
    seasonalAnalysis: [
      {
        month: 'December',
        spending: 456.78,
        category: 'Holiday celebrations',
        reason: 'Christmas, New Year, family gatherings'
      },
      {
        month: 'February',
        spending: 389.45,
        category: 'Carnival and festivals',
        reason: 'Carnival celebrations, regional festivals'
      },
      {
        month: 'June',
        spending: 234.67,
        category: 'Winter activities',
        reason: 'São João festivals, winter comfort food'
      },
      {
        month: 'September',
        spending: 198.34,
        category: 'Spring activities',
        reason: 'Independence Day, spring celebrations'
      },
      {
        month: 'November',
        spending: 267.89,
        category: 'Pre-holiday preparation',
        reason: 'Black Friday, holiday shopping'
      }
    ]
  };
} 