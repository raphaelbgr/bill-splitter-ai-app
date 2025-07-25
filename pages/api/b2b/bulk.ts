import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { businessId, batchId } = req.query;

      if (!businessId) {
        return res.status(400).json({ error: 'Business ID is required' });
      }

      if (batchId) {
        // Get specific batch details
        const { data: batch, error: batchError } = await supabase
          .from('b2b_batch_operations')
          .select('*')
          .eq('id', batchId)
          .eq('business_id', businessId)
          .single();

        if (batchError) {
          return res.status(404).json({ error: 'Batch not found' });
        }

        // Get batch items
        const { data: batchItems, error: itemsError } = await supabase
          .from('b2b_bulk_expenses')
          .select('*')
          .eq('batch_id', batchId);

        if (itemsError) {
          return res.status(500).json({ error: 'Failed to fetch batch items' });
        }

        return res.status(200).json({ batch, items: batchItems });
      } else {
        // Get all batches for business
        const { data: batches, error: batchesError } = await supabase
          .from('b2b_batch_operations')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (batchesError) {
          return res.status(500).json({ error: 'Failed to fetch batches' });
        }

        // Get bulk expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('b2b_bulk_expenses')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (expensesError) {
          return res.status(500).json({ error: 'Failed to fetch expenses' });
        }

        return res.status(200).json({ batches, expenses });
      }
    } catch (error) {
      console.error('B2B Bulk API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'create_batch':
          const { data: batchCreate, error: batchCreateError } = await supabase
            .from('b2b_batch_operations')
            .insert(data)
            .select();

          if (batchCreateError) {
            return res.status(500).json({ error: 'Failed to create batch' });
          }

          return res.status(200).json({ batch: batchCreate[0] });

        case 'import_expenses':
          // Process bulk import
          const { expenses, batchId } = data;
          
          const { data: expensesInsert, error: expensesError } = await supabase
            .from('b2b_bulk_expenses')
            .insert(expenses)
            .select();

          if (expensesError) {
            return res.status(500).json({ error: 'Failed to import expenses' });
          }

          // Update batch status
          const { error: batchUpdateError } = await supabase
            .from('b2b_batch_operations')
            .update({ 
              status: 'completed',
              processed_items: expenses.length,
              success_count: expenses.length,
              completed_at: new Date().toISOString()
            })
            .eq('id', batchId);

          if (batchUpdateError) {
            return res.status(500).json({ error: 'Failed to update batch status' });
          }

          return res.status(200).json({ 
            expenses: expensesInsert,
            message: `Successfully imported ${expenses.length} expenses`
          });

        case 'process_batch':
          const { batchId: processBatchId, operation } = data;
          
          // Update batch status to running
          const { error: statusError } = await supabase
            .from('b2b_batch_operations')
            .update({ 
              status: 'running',
              started_at: new Date().toISOString()
            })
            .eq('id', processBatchId);

          if (statusError) {
            return res.status(500).json({ error: 'Failed to start batch processing' });
          }

          // Simulate batch processing
          setTimeout(async () => {
            const { error: completeError } = await supabase
              .from('b2b_batch_operations')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', processBatchId);

            if (completeError) {
              console.error('Failed to complete batch:', completeError);
            }
          }, 5000);

          return res.status(200).json({ 
            message: 'Batch processing started',
            batchId: processBatchId
          });

        case 'export_data':
          const { businessId: exportBusinessId, filters } = data;
          
          let query = supabase
            .from('b2b_bulk_expenses')
            .select('*')
            .eq('business_id', exportBusinessId);

          if (filters?.dateRange) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - filters.dateRange);
            query = query.gte('created_at', startDate.toISOString());
          }

          if (filters?.category) {
            query = query.eq('category', filters.category);
          }

          const { data: exportData, error: exportError } = await query;

          if (exportError) {
            return res.status(500).json({ error: 'Failed to export data' });
          }

          return res.status(200).json({ 
            data: exportData,
            count: exportData.length
          });

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('B2B Bulk API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 