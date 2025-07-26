import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get AI transparency information
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get AI processing records
      const { data: processingRecords, error: processingError } = await supabase
        .from('processing_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (processingError) {
        console.error('Error fetching processing records:', processingError);
        return res.status(500).json({ error: 'Failed to fetch processing records' });
      }

      // Get data access logs
      const { data: accessLogs, error: accessError } = await supabase
        .from('data_access_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (accessError) {
        console.error('Error fetching access logs:', accessError);
        return res.status(500).json({ error: 'Failed to fetch access logs' });
      }

      // Calculate AI transparency metrics
      const aiModels = processingRecords?.map(r => r.model_used).filter(Boolean) || [];
      const uniqueModels = [...new Set(aiModels)];
      const totalTokens = processingRecords?.reduce((sum, r) => sum + (r.tokens_used || 0), 0) || 0;
      const totalCost = processingRecords?.reduce((sum, r) => sum + (r.cost_brl || 0), 0) || 0;

      const transparencyInfo = {
        aiModels: uniqueModels,
        totalProcessingRecords: processingRecords?.length || 0,
        totalTokensUsed: totalTokens,
        totalCostBRL: totalCost,
        dataCategories: ['conversations', 'preferences', 'cultural_context'],
        retentionPeriod: '90 days',
        legalBasis: 'consent',
        purposes: [
          'AI-assisted expense splitting',
          'Cultural context understanding',
          'Preference learning',
          'Conversation memory'
        ],
        dataProcessingActivities: [
          'Natural language processing',
          'Cultural pattern recognition',
          'Expense parsing and calculation',
          'Payment method suggestions'
        ],
        automatedDecisions: [
          'Expense splitting method selection',
          'Payment preference suggestions',
          'Cultural context application',
          'Regional language processing'
        ],
        userRights: [
          'Right to access all processed data',
          'Right to correct inaccurate data',
          'Right to delete all personal data',
          'Right to data portability',
          'Right to explanation of AI decisions'
        ]
      };

      return res.status(200).json({
        success: true,
        transparency: transparencyInfo,
        processingRecords: processingRecords || [],
        accessLogs: accessLogs || []
      });

    } catch (error) {
      console.error('Transparency API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Log AI processing activity
    try {
      const { 
        userId, 
        processingType, 
        dataProcessed, 
        modelUsed, 
        tokensUsed, 
        costBRL,
        legalBasis 
      } = req.body;

      if (!userId || !processingType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { error } = await supabase
        .from('processing_records')
        .insert({
          user_id: userId,
          processing_type: processingType,
          data_processed: dataProcessed || {},
          model_used: modelUsed,
          tokens_used: tokensUsed || 0,
          cost_brl: costBRL || 0,
          legal_basis: legalBasis || 'consent',
          data_retention_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging processing record:', error);
        return res.status(500).json({ error: 'Failed to log processing record' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Processing activity logged successfully' 
      });

    } catch (error) {
      console.error('Processing log error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 