import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';

const costTrackingSchema = z.object({
  userId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional(),
  costType: z.enum(['ai', 'infrastructure', 'operations', 'compliance', 'total']).optional()
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
    const validatedData = requestData;
    
    console.log('Cost tracking request data:', requestData);
    
    // Cost tracking data by region
    const costTrackingData = {
      'BR': {
        aiCosts: {
          claudeApi: { daily: 15.50, monthly: 465.00, currency: 'BRL' },
          processing: { daily: 8.20, monthly: 246.00, currency: 'BRL' },
          total: { daily: 23.70, monthly: 711.00, currency: 'BRL' }
        },
        infrastructure: {
          supabase: { daily: 12.30, monthly: 369.00, currency: 'BRL' },
          redis: { daily: 5.80, monthly: 174.00, currency: 'BRL' },
          hosting: { daily: 18.40, monthly: 552.00, currency: 'BRL' },
          total: { daily: 36.50, monthly: 1095.00, currency: 'BRL' }
        },
        operations: {
          compliance: { daily: 3.20, monthly: 96.00, currency: 'BRL' },
          monitoring: { daily: 2.10, monthly: 63.00, currency: 'BRL' },
          support: { daily: 4.50, monthly: 135.00, currency: 'BRL' },
          total: { daily: 9.80, monthly: 294.00, currency: 'BRL' }
        },
        total: { daily: 70.00, monthly: 2100.00, currency: 'BRL' }
      },
      'ES': {
        aiCosts: {
          claudeApi: { daily: 2.80, monthly: 84.00, currency: 'EUR' },
          processing: { daily: 1.50, monthly: 45.00, currency: 'EUR' },
          total: { daily: 4.30, monthly: 129.00, currency: 'EUR' }
        },
        infrastructure: {
          supabase: { daily: 2.20, monthly: 66.00, currency: 'EUR' },
          redis: { daily: 1.10, monthly: 33.00, currency: 'EUR' },
          hosting: { daily: 3.30, monthly: 99.00, currency: 'EUR' },
          total: { daily: 6.60, monthly: 198.00, currency: 'EUR' }
        },
        operations: {
          compliance: { daily: 0.60, monthly: 18.00, currency: 'EUR' },
          monitoring: { daily: 0.40, monthly: 12.00, currency: 'EUR' },
          support: { daily: 0.80, monthly: 24.00, currency: 'EUR' },
          total: { daily: 1.80, monthly: 54.00, currency: 'EUR' }
        },
        total: { daily: 12.70, monthly: 381.00, currency: 'EUR' }
      },
      'US': {
        aiCosts: {
          claudeApi: { daily: 3.20, monthly: 96.00, currency: 'USD' },
          processing: { daily: 1.70, monthly: 51.00, currency: 'USD' },
          total: { daily: 4.90, monthly: 147.00, currency: 'USD' }
        },
        infrastructure: {
          supabase: { daily: 2.50, monthly: 75.00, currency: 'USD' },
          redis: { daily: 1.20, monthly: 36.00, currency: 'USD' },
          hosting: { daily: 3.80, monthly: 114.00, currency: 'USD' },
          total: { daily: 7.50, monthly: 225.00, currency: 'USD' }
        },
        operations: {
          compliance: { daily: 0.70, monthly: 21.00, currency: 'USD' },
          monitoring: { daily: 0.50, monthly: 15.00, currency: 'USD' },
          support: { daily: 0.90, monthly: 27.00, currency: 'USD' },
          total: { daily: 2.10, monthly: 63.00, currency: 'USD' }
        },
        total: { daily: 14.50, monthly: 435.00, currency: 'USD' }
      }
    };

    const region = validatedData.region || 'BR';
    const costData = costTrackingData[region as keyof typeof costTrackingData] || costTrackingData['BR'];
    const costType = validatedData.costType || 'total';
    
    // Get specific cost data based on type
    let result;
    if (costType === 'ai') {
      result = costData.aiCosts;
    } else if (costType === 'infrastructure') {
      result = costData.infrastructure;
    } else if (costType === 'operations') {
      result = costData.operations;
    } else {
      result = costData;
    }

    // Log cost tracking request
    try {
      await supabase
        .from('analytics_logs')
        .insert({
          user_id: validatedData.userId || 'test-user',
          analytics_type: 'cost_tracking',
          region,
          language: validatedData.language || 'pt-BR',
          cost_type: costType,
          status: 'success',
          details: result
        });
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // Continue without logging if Supabase fails
    }

    return res.status(200).json({
      userId: validatedData.userId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      costType,
      costData: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('cost-tracking error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error',
      requestData: req.method === 'POST' ? req.body : req.query,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  }
}