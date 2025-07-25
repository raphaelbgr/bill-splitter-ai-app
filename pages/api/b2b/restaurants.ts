import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      // Get restaurant data
      const { data: restaurant, error: restaurantError } = await supabase
        .from('b2b_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Get menu items
      const { data: menuItems, error: menuError } = await supabase
        .from('b2b_menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (menuError) {
        return res.status(500).json({ error: 'Failed to fetch menu items' });
      }

      // Get recent bills
      const { data: bills, error: billsError } = await supabase
        .from('b2b_bills')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (billsError) {
        return res.status(500).json({ error: 'Failed to fetch bills' });
      }

      // Calculate analytics
      const totalRevenue = bills?.reduce((sum, bill) => sum + bill.amount, 0) || 0;
      const customerCount = bills?.length || 0;
      const averageBill = customerCount > 0 ? totalRevenue / customerCount : 0;

      const analytics = {
        totalRevenue,
        customerCount,
        averageBill,
        monthlyRevenue: totalRevenue * 0.3, // Mock calculation
        revenueShare: restaurant.revenue_share || 0.05
      };

      return res.status(200).json({
        restaurant,
        menuItems,
        bills,
        analytics
      });
    } catch (error) {
      console.error('B2B Restaurant API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'update_menu':
          const { data: menuUpdate, error: menuUpdateError } = await supabase
            .from('b2b_menu_items')
            .upsert(data)
            .select();

          if (menuUpdateError) {
            return res.status(500).json({ error: 'Failed to update menu' });
          }

          return res.status(200).json({ menuItems: menuUpdate });

        case 'add_bill':
          const { data: billAdd, error: billAddError } = await supabase
            .from('b2b_bills')
            .insert(data)
            .select();

          if (billAddError) {
            return res.status(500).json({ error: 'Failed to add bill' });
          }

          return res.status(200).json({ bill: billAdd[0] });

        case 'update_restaurant':
          const { data: restaurantUpdate, error: restaurantUpdateError } = await supabase
            .from('b2b_restaurants')
            .update(data)
            .eq('id', data.id)
            .select();

          if (restaurantUpdateError) {
            return res.status(500).json({ error: 'Failed to update restaurant' });
          }

          return res.status(200).json({ restaurant: restaurantUpdate[0] });

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('B2B Restaurant API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 