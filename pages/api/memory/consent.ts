import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Grant consent
    try {
      const { userId, consentType, purpose, dataCategories, legalBasis } = req.body;

      if (!userId || !consentType || !purpose) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { error } = await supabase
        .from('consent_records')
        .insert({
          user_id: userId,
          consent_type: consentType,
          consent_version: '1.0',
          granted: true,
          purpose: purpose,
          legal_basis: legalBasis || 'consent',
          data_categories: dataCategories || [],
          ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'],
          consent_text: `Consentimento para ${purpose}`,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error granting consent:', error);
        return res.status(500).json({ error: 'Failed to grant consent' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Consent granted successfully',
        consentType,
        grantedAt: new Date().toISOString()
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

      const { error } = await supabase
        .from('consent_records')
        .update({
          granted: false,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .eq('granted', true);

      if (error) {
        console.error('Error revoking consent:', error);
        return res.status(500).json({ error: 'Failed to revoke consent' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Consent revoked successfully',
        consentType,
        revokedAt: new Date().toISOString()
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

      const { data, error } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consent:', error);
        return res.status(500).json({ error: 'Failed to fetch consent' });
      }

      return res.status(200).json({ 
        success: true, 
        consents: data || [],
        activeConsents: data?.filter(c => c.granted && !c.revoked_at) || []
      });

    } catch (error) {
      console.error('Consent fetch error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 