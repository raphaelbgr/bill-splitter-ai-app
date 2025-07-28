import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';

const performanceMonitoringSchema = z.object({
  userId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional(),
  metricType: z.enum(['response_time', 'throughput', 'error_rate', 'availability', 'all']).optional()
}).passthrough();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestData = req.method === 'POST' ? req.body : req.query;
    const validatedData = performanceMonitoringSchema.parse(requestData);
    
    // Performance monitoring data by region
    const performanceData = {
      'BR': {
        responseTime: {
          average: 245, // ms
          p95: 420,
          p99: 680,
          target: 500,
          status: 'excellent'
        },
        throughput: {
          requestsPerSecond: 1250,
          concurrentUsers: 850,
          peakLoad: 2100,
          target: 1000,
          status: 'excellent'
        },
        errorRate: {
          percentage: 0.12,
          totalErrors: 45,
          criticalErrors: 2,
          target: 0.5,
          status: 'excellent'
        },
        availability: {
          uptime: 99.97,
          downtime: 0.03,
          lastOutage: '2024-12-15T14:30:00Z',
          target: 99.9,
          status: 'excellent'
        },
        aiPerformance: {
          claudeResponseTime: 180,
          processingAccuracy: 98.5,
          costPerRequest: 0.023,
          targetResponseTime: 300,
          status: 'excellent'
        }
      },
      'ES': {
        responseTime: {
          average: 280,
          p95: 450,
          p99: 720,
          target: 500,
          status: 'good'
        },
        throughput: {
          requestsPerSecond: 980,
          concurrentUsers: 650,
          peakLoad: 1650,
          target: 1000,
          status: 'good'
        },
        errorRate: {
          percentage: 0.18,
          totalErrors: 32,
          criticalErrors: 1,
          target: 0.5,
          status: 'excellent'
        },
        availability: {
          uptime: 99.95,
          downtime: 0.05,
          lastOutage: '2024-12-18T09:15:00Z',
          target: 99.9,
          status: 'excellent'
        },
        aiPerformance: {
          claudeResponseTime: 210,
          processingAccuracy: 97.8,
          costPerRequest: 0.028,
          targetResponseTime: 300,
          status: 'good'
        }
      },
      'US': {
        responseTime: {
          average: 265,
          p95: 440,
          p99: 700,
          target: 500,
          status: 'good'
        },
        throughput: {
          requestsPerSecond: 1100,
          concurrentUsers: 720,
          peakLoad: 1850,
          target: 1000,
          status: 'excellent'
        },
        errorRate: {
          percentage: 0.15,
          totalErrors: 38,
          criticalErrors: 1,
          target: 0.5,
          status: 'excellent'
        },
        availability: {
          uptime: 99.96,
          downtime: 0.04,
          lastOutage: '2024-12-16T11:45:00Z',
          target: 99.9,
          status: 'excellent'
        },
        aiPerformance: {
          claudeResponseTime: 195,
          processingAccuracy: 98.2,
          costPerRequest: 0.025,
          targetResponseTime: 300,
          status: 'good'
        }
      }
    };

    const region = validatedData.region || 'BR';
    const perfData = performanceData[region as keyof typeof performanceData] || performanceData['BR'];
    const metricType = validatedData.metricType || 'all';
    
    // Get specific performance data based on type
    let result;
    if (metricType === 'response_time') {
      result = { responseTime: perfData.responseTime };
    } else if (metricType === 'throughput') {
      result = { throughput: perfData.throughput };
    } else if (metricType === 'error_rate') {
      result = { errorRate: perfData.errorRate };
    } else if (metricType === 'availability') {
      result = { availability: perfData.availability };
    } else {
      result = perfData;
    }

    // Log performance monitoring request
    await supabase
      .from('analytics_logs')
      .insert({
        user_id: validatedData.userId || 'test-user',
        analytics_type: 'performance_monitoring',
        region,
        language: validatedData.language || 'pt-BR',
        metric_type: metricType,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      metricType,
      performanceData: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('performance-monitoring error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}