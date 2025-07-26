import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { partnership_id } = req.query;

      if (partnership_id) {
        // Get specific partnership data
        const { data: partnership, error } = await supabase
          .from('b2b_partnerships')
          .select('*')
          .eq('id', partnership_id)
          .single();

        if (error) {
          return res.status(404).json({ error: 'Parceria não encontrada' });
        }

        // Get revenue data for this partnership
        const { data: revenueData, error: revenueError } = await supabase
          .from('b2b_partnership_revenue')
          .select('*')
          .eq('partnership_id', partnership_id)
          .order('month', { ascending: false });

        if (revenueError) {
          return res.status(500).json({ error: 'Erro ao buscar dados de receita' });
        }

        return res.status(200).json({
          partnership,
          revenue_data: revenueData
        });
      } else {
        // Get all partnerships for the authenticated user
        const { data: partnerships, error } = await supabase
          .from('b2b_partnerships')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return res.status(500).json({ error: 'Erro ao buscar parcerias' });
        }

        return res.status(200).json(partnerships);
      }
    } catch (error) {
      console.error('Erro na API de parcerias:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'create_partnership':
          const { name, type, contact_person, contact_email, contact_phone, revenue_share } = data;

          if (!name || !type || !contact_person || !contact_email) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
          }

          const { data: partnership, error: partnershipError } = await supabase
            .from('b2b_partnerships')
            .insert({
              name,
              type,
              status: 'pending',
              revenue_share: revenue_share || 0.05,
              total_revenue: 0,
              monthly_revenue: 0,
              customer_count: 0,
              contact_person,
              contact_email,
              contact_phone
            })
            .select()
            .single();

          if (partnershipError) {
            return res.status(500).json({ error: 'Erro ao criar parceria' });
          }

          return res.status(201).json(partnership);

        case 'add_revenue':
          const { partnership_id, month, revenue, transactions, customers, growth_rate } = data;

          if (!partnership_id || !month || !revenue) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
          }

          const { data: revenueRecord, error: revenueError } = await supabase
            .from('b2b_partnership_revenue')
            .insert({
              partnership_id,
              month,
              revenue,
              transactions: transactions || 0,
              customers: customers || 0,
              growth_rate: growth_rate || 0
            })
            .select()
            .single();

          if (revenueError) {
            return res.status(500).json({ error: 'Erro ao adicionar receita' });
          }

          // Update partnership totals
          const { data: currentPartnership } = await supabase
            .from('b2b_partnerships')
            .select('total_revenue, monthly_revenue, customer_count')
            .eq('id', partnership_id)
            .single();

          if (currentPartnership) {
            const newTotalRevenue = currentPartnership.total_revenue + revenue;
            const newMonthlyRevenue = revenue; // Latest month
            const newCustomerCount = Math.max(currentPartnership.customer_count, customers || 0);

            await supabase
              .from('b2b_partnerships')
              .update({
                total_revenue: newTotalRevenue,
                monthly_revenue: newMonthlyRevenue,
                customer_count: newCustomerCount
              })
              .eq('id', partnership_id);
          }

          return res.status(201).json(revenueRecord);

        case 'update_status':
          const { partnership_id: statusPartnershipId, status } = data;

          if (!statusPartnershipId || !status) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
          }

          const { data: updatedPartnership, error: statusError } = await supabase
            .from('b2b_partnerships')
            .update({ status })
            .eq('id', statusPartnershipId)
            .select()
            .single();

          if (statusError) {
            return res.status(500).json({ error: 'Erro ao atualizar status da parceria' });
          }

          return res.status(200).json(updatedPartnership);

        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }
    } catch (error) {
      console.error('Erro na API de parcerias:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'update_partnership':
          const { partnership_id, updateData } = data;

          if (!partnership_id) {
            return res.status(400).json({ error: 'ID da parceria é obrigatório' });
          }

          const { data: partnership, error: partnershipError } = await supabase
            .from('b2b_partnerships')
            .update(updateData)
            .eq('id', partnership_id)
            .select()
            .single();

          if (partnershipError) {
            return res.status(500).json({ error: 'Erro ao atualizar parceria' });
          }

          return res.status(200).json(partnership);

        case 'update_revenue':
          const { revenue_id, revenueUpdateData } = data;

          if (!revenue_id) {
            return res.status(400).json({ error: 'ID da receita é obrigatório' });
          }

          const { data: revenue, error: revenueError } = await supabase
            .from('b2b_partnership_revenue')
            .update(revenueUpdateData)
            .eq('id', revenue_id)
            .select()
            .single();

          if (revenueError) {
            return res.status(500).json({ error: 'Erro ao atualizar receita' });
          }

          return res.status(200).json(revenue);

        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }
    } catch (error) {
      console.error('Erro na API de parcerias:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'delete_partnership':
          const { partnership_id } = data;

          if (!partnership_id) {
            return res.status(400).json({ error: 'ID da parceria é obrigatório' });
          }

          // Delete all revenue records for this partnership first
          const { error: revenueDeleteError } = await supabase
            .from('b2b_partnership_revenue')
            .delete()
            .eq('partnership_id', partnership_id);

          if (revenueDeleteError) {
            return res.status(500).json({ error: 'Erro ao deletar dados de receita da parceria' });
          }

          // Delete the partnership
          const { error: partnershipDeleteError } = await supabase
            .from('b2b_partnerships')
            .delete()
            .eq('id', partnership_id);

          if (partnershipDeleteError) {
            return res.status(500).json({ error: 'Erro ao deletar parceria' });
          }

          return res.status(200).json({ message: 'Parceria deletada com sucesso' });

        case 'delete_revenue':
          const { revenue_id } = data;

          if (!revenue_id) {
            return res.status(400).json({ error: 'ID da receita é obrigatório' });
          }

          const { error: revenueDeleteError } = await supabase
            .from('b2b_partnership_revenue')
            .delete()
            .eq('id', revenue_id);

          if (revenueDeleteError) {
            return res.status(500).json({ error: 'Erro ao deletar receita' });
          }

          return res.status(200).json({ message: 'Receita deletada com sucesso' });

        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }
    } catch (error) {
      console.error('Erro na API de parcerias:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 