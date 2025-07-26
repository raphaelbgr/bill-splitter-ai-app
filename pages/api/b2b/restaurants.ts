import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { restaurant_id } = req.query;

      if (restaurant_id) {
        // Get specific restaurant data
        const { data: restaurant, error } = await supabase
          .from('b2b_restaurants')
          .select('*')
          .eq('id', restaurant_id)
          .single();

        if (error) {
          return res.status(404).json({ error: 'Restaurante não encontrado' });
        }

        return res.status(200).json(restaurant);
      } else {
        // Get all restaurants for the authenticated user
        const { data: restaurants, error } = await supabase
          .from('b2b_restaurants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return res.status(500).json({ error: 'Erro ao buscar restaurantes' });
        }

        return res.status(200).json(restaurants);
      }
    } catch (error) {
      console.error('Erro na API de restaurantes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, address, phone, email, partnership_status, revenue_share } = req.body;

      // Validate required fields
      if (!name || !address || !phone || !email) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
      }

      const { data: restaurant, error } = await supabase
        .from('b2b_restaurants')
        .insert({
          name,
          address,
          phone,
          email,
          partnership_status: partnership_status || 'pending',
          revenue_share: revenue_share || 0.05,
          total_transactions: 0,
          monthly_revenue: 0,
          customer_count: 0
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Erro ao criar restaurante' });
      }

      return res.status(201).json(restaurant);
    } catch (error) {
      console.error('Erro na API de restaurantes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { restaurant_id } = req.query;
      const updateData = req.body;

      if (!restaurant_id) {
        return res.status(400).json({ error: 'ID do restaurante é obrigatório' });
      }

      const { data: restaurant, error } = await supabase
        .from('b2b_restaurants')
        .update(updateData)
        .eq('id', restaurant_id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Erro ao atualizar restaurante' });
      }

      return res.status(200).json(restaurant);
    } catch (error) {
      console.error('Erro na API de restaurantes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { restaurant_id } = req.query;

      if (!restaurant_id) {
        return res.status(400).json({ error: 'ID do restaurante é obrigatório' });
      }

      const { error } = await supabase
        .from('b2b_restaurants')
        .delete()
        .eq('id', restaurant_id);

      if (error) {
        return res.status(500).json({ error: 'Erro ao deletar restaurante' });
      }

      return res.status(200).json({ message: 'Restaurante deletado com sucesso' });
    } catch (error) {
      console.error('Erro na API de restaurantes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 