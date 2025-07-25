import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Clean up expired data (90-day retention policy)
    try {
      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

      // Delete expired conversations
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (conversationError) {
        console.error('Error deleting expired conversations:', conversationError);
      }

      // Delete expired messages
      const { error: messageError } = await supabase
        .from('messages')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (messageError) {
        console.error('Error deleting expired messages:', messageError);
      }

      // Delete expired processing records
      const { error: processingError } = await supabase
        .from('processing_records')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (processingError) {
        console.error('Error deleting expired processing records:', processingError);
      }

      // Delete expired consent records (keep for 2 years for legal compliance)
      const consentCutoffDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
      const { error: consentError } = await supabase
        .from('consent_records')
        .delete()
        .lt('created_at', consentCutoffDate.toISOString());

      if (consentError) {
        console.error('Error deleting expired consent records:', consentError);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Data retention cleanup completed',
        cutoffDate: cutoffDate.toISOString(),
        consentCutoffDate: consentCutoffDate.toISOString()
      });

    } catch (error) {
      console.error('Retention cleanup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    // Get retention statistics
    try {
      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Count expired data
      const { count: expiredConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString());

      const { count: expiredMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString());

      const { count: expiredProcessing } = await supabase
        .from('processing_records')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString());

      const retentionStats = {
        retentionPeriod: '90 days',
        cutoffDate: cutoffDate.toISOString(),
        expiredData: {
          conversations: expiredConversations || 0,
          messages: expiredMessages || 0,
          processingRecords: expiredProcessing || 0
        },
        policy: {
          conversations: '90 days',
          messages: '90 days',
          processingRecords: '90 days',
          consentRecords: '2 years (legal requirement)',
          accessLogs: '2 years (legal requirement)'
        }
      };

      return res.status(200).json({
        success: true,
        retentionStats
      });

    } catch (error) {
      console.error('Retention stats error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 