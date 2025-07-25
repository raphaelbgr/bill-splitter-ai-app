import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { performanceOptimizer } from '../../../lib/performance-optimizer';

interface PerformanceMonitoringData {
  regionalPerformance: {
    SP: { responseTime: number; errorRate: number; uptime: number; optimization: string };
    RJ: { responseTime: number; errorRate: number; uptime: number; optimization: string };
    NE: { responseTime: number; errorRate: number; uptime: number; optimization: string };
    Sul: { responseTime: number; errorRate: number; uptime: number; optimization: string };
  };
  peakHourPerformance: {
    morning: { responseTime: number; requests: number; optimization: string; modelUsage: Record<string, number> };
    lunch: { responseTime: number; requests: number; optimization: string; modelUsage: Record<string, number> };
    evening: { responseTime: number; requests: number; optimization: string; modelUsage: Record<string, number> };
    weekend: { responseTime: number; requests: number; optimization: string; modelUsage: Record<string, number> };
  };
  mobilePerformance: {
    loadTime: number;
    cacheHitRate: number;
    compressionEnabled: boolean;
    optimizationLevel: string;
    networkConditions: Record<string, number>;
  };
  systemHealth: {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      claude: { status: string; responseTime: number; errorRate: number };
      redis: { status: string; responseTime: number; hitRate: number };
      supabase: { status: string; responseTime: number; errorRate: number };
    };
  };
  alerts: Array<{
    id: string;
    type: 'performance' | 'error' | 'cost' | 'availability';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
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
        error: 'LGPD consent required for performance monitoring',
        consentRequired: true 
      });
    }

    // Get performance monitoring data
    const performanceData = await getPerformanceMonitoringData(userId);
    
    return res.status(200).json({
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString(),
      lgpdCompliant: true
    });
  } catch (error) {
    console.error('Performance monitoring error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPerformanceMonitoringData(userId: string): Promise<PerformanceMonitoringData> {
  // In a real implementation, this would aggregate performance data from various sources
  // For now, we'll return mock data that represents realistic performance patterns
  
  const performanceAnalytics = await performanceOptimizer.getPerformanceAnalytics();
  
  // Regional performance data
  const regionalPerformance = {
    SP: {
      responseTime: 1200,
      errorRate: 0.5,
      uptime: 99.9,
      optimization: 'sonnet'
    },
    RJ: {
      responseTime: 1350,
      errorRate: 0.8,
      uptime: 99.8,
      optimization: 'haiku'
    },
    NE: {
      responseTime: 1500,
      errorRate: 1.2,
      uptime: 99.7,
      optimization: 'haiku'
    },
    Sul: {
      responseTime: 1280,
      errorRate: 0.6,
      uptime: 99.9,
      optimization: 'sonnet'
    }
  };

  // Peak hour performance data
  const peakHourPerformance = {
    morning: {
      responseTime: 1100,
      requests: 450,
      optimization: 'sonnet',
      modelUsage: { haiku: 60, sonnet: 35, opus: 5 }
    },
    lunch: {
      responseTime: 1300,
      requests: 680,
      optimization: 'haiku',
      modelUsage: { haiku: 80, sonnet: 18, opus: 2 }
    },
    evening: {
      responseTime: 1400,
      requests: 920,
      optimization: 'haiku',
      modelUsage: { haiku: 75, sonnet: 22, opus: 3 }
    },
    weekend: {
      responseTime: 1250,
      requests: 580,
      optimization: 'sonnet',
      modelUsage: { haiku: 65, sonnet: 30, opus: 5 }
    }
  };

  // Mobile performance data
  const mobilePerformance = {
    loadTime: 2800,
    cacheHitRate: 85,
    compressionEnabled: true,
    optimizationLevel: 'high',
    networkConditions: {
      '4G': 75, // 75% of mobile users on 4G
      'WiFi': 20, // 20% on WiFi
      '3G': 5 // 5% on 3G
    }
  };

  // System health data
  const systemHealth = {
    overall: 'healthy' as const,
    components: {
      claude: {
        status: 'operational',
        responseTime: 1200,
        errorRate: 0.3
      },
      redis: {
        status: 'operational',
        responseTime: 50,
        hitRate: 85
      },
      supabase: {
        status: 'operational',
        responseTime: 200,
        errorRate: 0.1
      }
    }
  };

  // Generate alerts based on performance data
  const alerts = generateAlerts(regionalPerformance, peakHourPerformance, systemHealth);

  return {
    regionalPerformance,
    peakHourPerformance,
    mobilePerformance,
    systemHealth,
    alerts
  };
}

function generateAlerts(
  regionalPerformance: PerformanceMonitoringData['regionalPerformance'],
  peakHourPerformance: PerformanceMonitoringData['peakHourPerformance'],
  systemHealth: PerformanceMonitoringData['systemHealth']
): PerformanceMonitoringData['alerts'] {
  const alerts: PerformanceMonitoringData['alerts'] = [];

  // Check for high error rates
  Object.entries(regionalPerformance).forEach(([region, data]) => {
    if (data.errorRate > 1.0) {
      alerts.push({
        id: `error_${region}_${Date.now()}`,
        type: 'error',
        severity: 'high',
        message: `High error rate detected in ${region}: ${data.errorRate}%`,
        timestamp: new Date(),
        resolved: false
      });
    }
  });

  // Check for slow response times
  Object.entries(regionalPerformance).forEach(([region, data]) => {
    if (data.responseTime > 2000) {
      alerts.push({
        id: `performance_${region}_${Date.now()}`,
        type: 'performance',
        severity: 'medium',
        message: `Slow response time in ${region}: ${data.responseTime}ms`,
        timestamp: new Date(),
        resolved: false
      });
    }
  });

  // Check for system health issues
  Object.entries(systemHealth.components).forEach(([component, data]) => {
    if (data.status !== 'operational') {
      alerts.push({
        id: `system_${component}_${Date.now()}`,
        type: 'availability',
        severity: 'critical',
        message: `${component} is experiencing issues: ${data.status}`,
        timestamp: new Date(),
        resolved: false
      });
    }
  });

  // Check for peak hour performance issues
  Object.entries(peakHourPerformance).forEach(([hour, data]) => {
    if (data.responseTime > 1500) {
      alerts.push({
        id: `peak_${hour}_${Date.now()}`,
        type: 'performance',
        severity: 'medium',
        message: `Slow performance during ${hour} peak hours: ${data.responseTime}ms`,
        timestamp: new Date(),
        resolved: false
      });
    }
  });

  return alerts;
} 