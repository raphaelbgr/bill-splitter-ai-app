import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Test insert
      const { error: insertError } = await supabase
        .from('consent_records')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          consent_type: 'test',
          granted: true,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting test record:', insertError);
        return res.status(500).json({ 
          error: 'Failed to insert test record',
          details: insertError,
          message: insertError.message,
          code: insertError.code
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Test record inserted successfully'
      });
    }

    // Try to access the consent_records table
    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error accessing consent_records:', error);
      return res.status(500).json({ 
        error: 'Failed to access consent_records table',
        details: error,
        message: error.message,
        code: error.code
      });
    }

    return res.status(200).json({
      success: true,
      data: data,
      supabaseUrl,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });

  } catch (error) {
    console.error('Test DB error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error 
    });
  }
} 