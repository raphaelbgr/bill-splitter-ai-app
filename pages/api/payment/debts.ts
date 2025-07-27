import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createPagesSupabaseClient } from '../../../lib/supabase-pages';

const debtsSchema = z.object({
  userId: z.string().optional(),
  groupId: z.string().uuid().optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'all']).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = debtsSchema.parse(req.query);
      const supabase = createPagesSupabaseClient();

      const userId = validatedData.userId;
      const groupId = validatedData.groupId;
      const status = validatedData.status || 'all';
      const limit = validatedData.limit || 50;

      // Build query for settlements (debts)
      let settlementsQuery = supabase
        .from('settlements')
        .select(`
          id,
          group_id,
          payer_id,
          payee_id,
          amount,
          status,
          due_date,
          created_at,
          groups(name, description),
          payer:user_profiles!settlements_payer_id_fkey(display_name, email),
          payee:user_profiles!settlements_payee_id_fkey(display_name, email)
        `)
        .limit(limit);

      // Filter by user if provided
      if (userId) {
        settlementsQuery = settlementsQuery.or(`payer_id.eq.${userId},payee_id.eq.${userId}`);
      }

      // Filter by group if provided
      if (groupId) {
        settlementsQuery = settlementsQuery.eq('group_id', groupId);
      }

      // Filter by status
      if (status !== 'all') {
        settlementsQuery = settlementsQuery.eq('status', status);
      }

      const { data: settlements, error: settlementsError } = await settlementsQuery;

      if (settlementsError) {
        return res.status(500).json({ 
          success: false,
          error: 'Failed to fetch debts',
          details: settlementsError.message 
        });
      }

      // Get expense details for each settlement
      const debts = await Promise.all(
        (settlements || []).map(async (settlement) => {
          // Get related expenses for this settlement
          const { data: expenses } = await supabase
            .from('settlement_expenses')
            .select(`
              expense_id,
              expenses(
                id,
                description,
                total_amount,
                expense_date,
                payment_method
              )
            `)
            .eq('settlement_id', settlement.id);

          return {
            id: settlement.id,
            amount: settlement.amount,
            description: expenses?.[0]?.expenses?.description || 'Pagamento pendente',
            debtor: settlement.payer?.display_name || 'Usuário',
            creditor: settlement.payee?.display_name || 'Usuário',
            dueDate: settlement.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: settlement.status,
            groupId: settlement.group_id,
            groupName: settlement.groups?.name || 'Grupo',
            createdAt: settlement.created_at,
            expenses: expenses?.map(se => se.expenses) || [],
            paymentMethod: expenses?.[0]?.expenses?.payment_method || 'pix',
          };
        })
      );

      // Calculate summary statistics
      const summary = calculateDebtSummary(debts);

      // Get user preferences for cultural context
      let culturalContext = {
        region: 'BR',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
      };

      if (userId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('ai_preferences, timezone, language, currency')
          .eq('id', userId)
          .single();

        if (userProfile) {
          culturalContext = {
            region: userProfile.ai_preferences?.region || 'BR',
            language: userProfile.language || 'pt-BR',
            timezone: userProfile.timezone || 'America/Sao_Paulo',
            currency: userProfile.currency || 'BRL',
          };
        }
      }

      const response = {
        userId: userId || 'anonymous',
        debts,
        summary,
        culturalContext,
        filters: {
          groupId,
          status,
          limit,
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Debts API error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid request data',
          details: error.errors 
        });
      }
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function calculateDebtSummary(debts: any[]) {
  const summary = {
    totalDebts: debts.length,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    byStatus: {
      pending: 0,
      paid: 0,
      overdue: 0,
    },
    byGroup: {} as { [key: string]: number },
    averageAmount: 0,
    oldestDebt: null as string | null,
    newestDebt: null as string | null,
  };

  debts.forEach(debt => {
    summary.totalAmount += debt.amount;
    summary.byStatus[debt.status as keyof typeof summary.byStatus]++;
    
    if (debt.status === 'pending') {
      summary.pendingAmount += debt.amount;
    } else if (debt.status === 'paid') {
      summary.paidAmount += debt.amount;
    } else if (debt.status === 'overdue') {
      summary.overdueAmount += debt.amount;
    }

    // Group by group
    const groupName = debt.groupName;
    summary.byGroup[groupName] = (summary.byGroup[groupName] || 0) + debt.amount;

    // Track oldest and newest
    const debtDate = new Date(debt.createdAt);
    if (!summary.oldestDebt || debtDate < new Date(summary.oldestDebt)) {
      summary.oldestDebt = debt.createdAt;
    }
    if (!summary.newestDebt || debtDate > new Date(summary.newestDebt)) {
      summary.newestDebt = debt.createdAt;
    }
  });

  summary.averageAmount = debts.length > 0 ? summary.totalAmount / debts.length : 0;

  return summary;
}