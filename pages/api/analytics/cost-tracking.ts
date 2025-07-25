import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { performanceOptimizer } from '../../../lib/performance-optimizer';

interface CostTrackingData {
  dailyCosts: Array<{ date: string; cost: number; requests: number; modelDistribution: Record<string, number> }>;
  modelUsage: {
    haiku: { usage: number; cost: number; accuracy: number; avgTokens: number };
    sonnet: { usage: number; cost: number; accuracy: number; avgTokens: number };
    opus: { usage: number; cost: number; accuracy: number; avgTokens: number };
  };
  optimizationOpportunities: Array<{ 
    opportunity: string; 
    potentialSavings: number; 
    impact: 'high' | 'medium' | 'low';
    implementation: string;
    estimatedROI: number;
  }>;
  budgetStatus: {
    dailyBudget: number;
    monthlyBudget: number;
    currentSpend: number;
    remainingBudget: number;
    budgetUtilization: number;
    alertThreshold: number;
  };
  costTrends: {
    daily: Array<{ date: string; cost: number; requests: number }>;
    weekly: Array<{ week: string; cost: number; requests: number }>;
    monthly: Array<{ month: string; cost: number; requests: number }>;
  };
  regionalCosts: {
    SP: { cost: number; requests: number; avgCostPerRequest: number };
    RJ: { cost: number; requests: number; avgCostPerRequest: number };
    NE: { cost: number; requests: number; avgCostPerRequest: number };
    Sul: { cost: number; requests: number; avgCostPerRequest: number };
  };
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
    // Check LGPD consent for analytics
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'analytics');
    
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for cost tracking',
        consentRequired: true 
      });
    }

    // Get cost tracking data
    const costData = await getCostTrackingData(userId);
    
    return res.status(200).json({
      success: true,
      data: costData,
      timestamp: new Date().toISOString(),
      lgpdCompliant: true
    });
  } catch (error) {
    console.error('Cost tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCostTrackingData(userId: string): Promise<CostTrackingData> {
  // In a real implementation, this would aggregate cost data from various sources
  // For now, we'll return mock data that represents realistic cost patterns
  
  const performanceData = await performanceOptimizer.getPerformanceAnalytics();
  
  // Calculate daily costs for the last 7 days
  const dailyCosts = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate realistic cost data
    const baseCost = 45 + Math.random() * 15; // R$ 45-60 per day
    const requests = 1200 + Math.random() * 300; // 1200-1500 requests per day
    
    dailyCosts.push({
      date: dateStr,
      cost: Math.round(baseCost * 100) / 100,
      requests: Math.round(requests),
      modelDistribution: {
        haiku: 70 + Math.random() * 10,
        sonnet: 25 + Math.random() * 10,
        opus: 5 + Math.random() * 5
      }
    });
  }

  // Calculate model usage statistics
  const totalCost = dailyCosts.reduce((sum, day) => sum + day.cost, 0);
  const totalRequests = dailyCosts.reduce((sum, day) => sum + day.requests, 0);
  
  const modelUsage = {
    haiku: {
      usage: 70, // 70% of requests use Haiku
      cost: totalCost * 0.4, // 40% of total cost
      accuracy: 92.8,
      avgTokens: 150
    },
    sonnet: {
      usage: 25, // 25% of requests use Sonnet
      cost: totalCost * 0.5, // 50% of total cost
      accuracy: 96.5,
      avgTokens: 300
    },
    opus: {
      usage: 5, // 5% of requests use Opus
      cost: totalCost * 0.1, // 10% of total cost
      accuracy: 98.7,
      avgTokens: 500
    }
  };

  // Calculate budget status
  const dailyBudget = 100; // R$ 100 per day
  const monthlyBudget = 2500; // R$ 2500 per month
  const currentSpend = totalCost;
  const remainingBudget = dailyBudget - currentSpend;
  const budgetUtilization = (currentSpend / dailyBudget) * 100;

  // Generate optimization opportunities
  const optimizationOpportunities = [
    {
      opportunity: 'Cache mais agressivo para cálculos simples',
      potentialSavings: 25,
      impact: 'high' as const,
      implementation: 'Implementar cache de 24h para divisões básicas',
      estimatedROI: 300
    },
    {
      opportunity: 'Modelo Haiku para cálculos simples',
      potentialSavings: 15,
      impact: 'medium' as const,
      implementation: 'Usar Haiku para 80% dos cálculos simples',
      estimatedROI: 180
    },
    {
      opportunity: 'Compressão de respostas',
      potentialSavings: 10,
      impact: 'low' as const,
      implementation: 'Implementar compressão gzip para respostas',
      estimatedROI: 120
    },
    {
      opportunity: 'Otimização de prompts',
      potentialSavings: 8,
      impact: 'medium' as const,
      implementation: 'Reduzir tokens desnecessários nos prompts',
      estimatedROI: 96
    }
  ];

  // Generate cost trends
  const costTrends = {
    daily: dailyCosts.map(day => ({
      date: day.date,
      cost: day.cost,
      requests: day.requests
    })),
    weekly: [
      { week: '2024-W01', cost: 320, requests: 8500 },
      { week: '2024-W02', cost: 340, requests: 8900 },
      { week: '2024-W03', cost: 330, requests: 8700 },
      { week: '2024-W04', cost: 360, requests: 9200 }
    ],
    monthly: [
      { month: '2024-01', cost: 1350, requests: 35000 },
      { month: '2024-02', cost: 1420, requests: 36500 },
      { month: '2024-03', cost: 1380, requests: 35800 }
    ]
  };

  // Calculate regional costs
  const regionalCosts = {
    SP: {
      cost: totalCost * 0.4, // 40% of costs from São Paulo
      requests: totalRequests * 0.4,
      avgCostPerRequest: (totalCost * 0.4) / (totalRequests * 0.4)
    },
    RJ: {
      cost: totalCost * 0.25, // 25% of costs from Rio de Janeiro
      requests: totalRequests * 0.25,
      avgCostPerRequest: (totalCost * 0.25) / (totalRequests * 0.25)
    },
    NE: {
      cost: totalCost * 0.2, // 20% of costs from Northeast
      requests: totalRequests * 0.2,
      avgCostPerRequest: (totalCost * 0.2) / (totalRequests * 0.2)
    },
    Sul: {
      cost: totalCost * 0.15, // 15% of costs from South
      requests: totalRequests * 0.15,
      avgCostPerRequest: (totalCost * 0.15) / (totalRequests * 0.15)
    }
  };

  return {
    dailyCosts,
    modelUsage,
    optimizationOpportunities,
    budgetStatus: {
      dailyBudget,
      monthlyBudget,
      currentSpend: Math.round(currentSpend * 100) / 100,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      alertThreshold: 80 // Alert when 80% of budget is used
    },
    costTrends,
    regionalCosts
  };
} 