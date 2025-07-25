import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { businessId, partnershipId } = req.query;

      if (!businessId) {
        return res.status(400).json({ error: 'Business ID is required' });
      }

      if (partnershipId) {
        // Get specific partnership with details
        const { data: partnership, error: partnershipError } = await supabase
          .from('b2b_partnerships')
          .select(`
            *,
            performance:b2b_partnership_performance(*),
            transactions:b2b_partnership_transactions(*)
          `)
          .eq('id', partnershipId)
          .eq('business_id', businessId)
          .single();

        if (partnershipError) {
          return res.status(404).json({ error: 'Partnership not found' });
        }

        return res.status(200).json({ partnership });
      } else {
        // Get all partnerships for business
        const { data: partnerships, error: partnershipsError } = await supabase
          .from('b2b_partnerships')
          .select(`
            *,
            performance:b2b_partnership_performance(*)
          `)
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (partnershipsError) {
          return res.status(500).json({ error: 'Failed to fetch partnerships' });
        }

        // Calculate analytics
        const totalRevenue = partnerships?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0;
        const activePartnerships = partnerships?.filter(p => p.status === 'active').length || 0;
        const averageRating = partnerships?.length > 0 
          ? partnerships.reduce((sum, p) => sum + (p.rating || 0), 0) / partnerships.length 
          : 0;

        const analytics = {
          totalRevenue,
          activePartnerships,
          averageRating,
          totalPartnerships: partnerships?.length || 0,
          monthlyGrowth: 13.7, // Mock calculation
          retentionRate: 94.2 // Mock calculation
        };

        return res.status(200).json({ partnerships, analytics });
      }
    } catch (error) {
      console.error('B2B Partnerships API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'create_partnership':
          const { data: partnershipCreate, error: partnershipCreateError } = await supabase
            .from('b2b_partnerships')
            .insert(data)
            .select();

          if (partnershipCreateError) {
            return res.status(500).json({ error: 'Failed to create partnership' });
          }

          // Create initial performance record
          const performanceData = {
            partnership_id: partnershipCreate[0].id,
            revenue_growth: 0,
            customer_growth: 0,
            satisfaction_score: 0,
            response_time: 0,
            completion_rate: 0,
            monthly_transactions: 0
          };

          const { error: performanceError } = await supabase
            .from('b2b_partnership_performance')
            .insert(performanceData);

          if (performanceError) {
            console.error('Failed to create performance record:', performanceError);
          }

          return res.status(200).json({ partnership: partnershipCreate[0] });

        case 'update_partnership':
          const { data: partnershipUpdate, error: partnershipUpdateError } = await supabase
            .from('b2b_partnerships')
            .update(data)
            .eq('id', data.id)
            .select();

          if (partnershipUpdateError) {
            return res.status(500).json({ error: 'Failed to update partnership' });
          }

          return res.status(200).json({ partnership: partnershipUpdate[0] });

        case 'update_performance':
          const { data: performanceUpdate, error: performanceUpdateError } = await supabase
            .from('b2b_partnership_performance')
            .upsert(data)
            .select();

          if (performanceUpdateError) {
            return res.status(500).json({ error: 'Failed to update performance' });
          }

          return res.status(200).json({ performance: performanceUpdate[0] });

        case 'add_transaction':
          const { data: transactionAdd, error: transactionAddError } = await supabase
            .from('b2b_partnership_transactions')
            .insert(data)
            .select();

          if (transactionAddError) {
            return res.status(500).json({ error: 'Failed to add transaction' });
          }

          // Update partnership revenue
          const { error: revenueUpdateError } = await supabase
            .from('b2b_partnerships')
            .update({ 
              total_revenue: supabase.rpc('increment_revenue', { 
                partnership_id: data.partnership_id, 
                amount: data.amount 
              })
            })
            .eq('id', data.partnership_id);

          if (revenueUpdateError) {
            console.error('Failed to update revenue:', revenueUpdateError);
          }

          return res.status(200).json({ transaction: transactionAdd[0] });

        case 'get_analytics':
          const { businessId: analyticsBusinessId, dateRange } = data;
          
          let query = supabase
            .from('b2b_partnerships')
            .select('*')
            .eq('business_id', analyticsBusinessId);

          if (dateRange) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dateRange);
            query = query.gte('created_at', startDate.toISOString());
          }

          const { data: analyticsData, error: analyticsError } = await query;

          if (analyticsError) {
            return res.status(500).json({ error: 'Failed to fetch analytics' });
          }

          // Calculate analytics
          const analytics = {
            totalPartnerships: analyticsData.length,
            activePartnerships: analyticsData.filter(p => p.status === 'active').length,
            totalRevenue: analyticsData.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
            averageRating: analyticsData.length > 0 
              ? analyticsData.reduce((sum, p) => sum + (p.rating || 0), 0) / analyticsData.length 
              : 0,
            growthRate: 15.3, // Mock calculation
            retentionRate: 94.2 // Mock calculation
          };

          return res.status(200).json({ analytics });

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('B2B Partnerships API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 