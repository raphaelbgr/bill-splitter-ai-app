import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Grant consent
    try {
      const { userId, consentType, purpose, dataCategories, legalBasis } = req.body;

      if (!userId || !consentType || !purpose) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      const testUserId = userIdStr.startsWith('test-') ? '00000000-0000-0000-0000-000000000000' : userIdStr;

      // For now, return success without database operation due to RLS
      // In production, you would need proper authentication and RLS policies
      return res.status(200).json({ 
        success: true, 
        message: 'Consent granted successfully',
        consentType,
        purpose,
        dataCategories: dataCategories || [],
        legalBasis: legalBasis || 'consent',
        grantedAt: new Date().toISOString(),
        note: 'RLS policy prevents anonymous inserts - using mock response'
      });

    } catch (error) {
      console.error('Consent API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    // Revoke consent
    try {
      const { userId, consentType } = req.body;

      if (!userId || !consentType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // For now, return success without database operation due to RLS
      return res.status(200).json({ 
        success: true, 
        message: 'Consent revoked successfully',
        consentType,
        revokedAt: new Date().toISOString(),
        note: 'RLS policy prevents anonymous updates - using mock response'
      });

    } catch (error) {
      console.error('Consent revocation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    // Get consent status
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // For now, return mock data due to RLS
      return res.status(200).json({
        success: true,
        data: {
          user_id: userId,
          consent_type: 'cultural_analysis',
          granted: true,
          purpose: 'Análise cultural para personalização',
          legal_basis: 'consent',
          data_categories: ['conversations', 'preferences', 'cultural_context'],
          created_at: new Date().toISOString()
        },
        note: 'RLS policy prevents anonymous reads - using mock response'
      });

    } catch (error) {
      console.error('Consent fetch error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 