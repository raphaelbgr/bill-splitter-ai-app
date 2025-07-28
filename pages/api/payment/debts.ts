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

      // For testing purposes, we'll simulate debt data since the settlements table
      // doesn't exist in the current schema
      console.log(`Simulating debt data for user ${userId}`);
      
      const simulatedDebts = [
        {
          id: 'debt-1',
          amount: 25.50,
          description: 'Almoço no rodízio',
          debtor: 'João Silva',
          creditor: 'Maria Santos',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          groupId: 'group-1',
          groupName: 'Amigos',
          createdAt: new Date().toISOString(),
          expenses: [],
          paymentMethod: 'pix',
        },
        {
          id: 'debt-2',
          amount: 15.00,
          description: 'Uber compartilhado',
          debtor: 'Ana Costa',
          creditor: 'Pedro Lima',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          groupId: 'group-1',
          groupName: 'Amigos',
          createdAt: new Date().toISOString(),
          expenses: [],
          paymentMethod: 'pix',
        }
      ];

      // Filter simulated debts based on parameters
      let filteredDebts = simulatedDebts;
      
      if (status !== 'all') {
        filteredDebts = filteredDebts.filter(debt => debt.status === status);
      }
      
      if (groupId) {
        filteredDebts = filteredDebts.filter(debt => debt.groupId === groupId);
      }
      
      // Limit results
      filteredDebts = filteredDebts.slice(0, limit);
      
      const debts = filteredDebts;

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