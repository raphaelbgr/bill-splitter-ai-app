import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { operation_id } = req.query;

      if (operation_id) {
        // Get specific bulk operation
        const { data: operation, error } = await supabase
          .from('b2b_bulk_operations')
          .select('*')
          .eq('id', operation_id)
          .single();

        if (error) {
          return res.status(404).json({ error: 'Operação não encontrada' });
        }

        // Get bulk expenses for this operation
        const { data: expenses, error: expensesError } = await supabase
          .from('b2b_bulk_expenses')
          .select('*')
          .eq('operation_id', operation_id)
          .order('created_at', { ascending: false });

        if (expensesError) {
          return res.status(500).json({ error: 'Erro ao buscar despesas' });
        }

        return res.status(200).json({
          operation,
          expenses
        });
      } else {
        // Get all bulk operations for the authenticated user
        const { data: operations, error } = await supabase
          .from('b2b_bulk_operations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return res.status(500).json({ error: 'Erro ao buscar operações' });
        }

        return res.status(200).json(operations);
      }
    } catch (error) {
      console.error('Erro na API de operações em lote:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'create_operation':
          const { name, description, type, settings } = data;

          if (!name || !type) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
          }

          const { data: operation, error: operationError } = await supabase
            .from('b2b_bulk_operations')
            .insert({
              name,
              description,
              type,
              status: 'pending',
              progress: 0,
              total_items: 0,
              processed_items: 0,
              settings: settings || {}
            })
            .select()
            .single();

          if (operationError) {
            return res.status(500).json({ error: 'Erro ao criar operação' });
          }

          return res.status(201).json(operation);

        case 'upload_expenses':
          const { operation_id, expenses } = data;

          if (!operation_id || !expenses || !Array.isArray(expenses)) {
            return res.status(400).json({ error: 'Dados inválidos' });
          }

          // Process and validate expenses
          const processedExpenses = expenses.map((expense: any) => ({
            operation_id,
            description: expense.description,
            amount: parseFloat(expense.amount),
            category: expense.category || 'outros',
            date: expense.date,
            participants: expense.participants || [],
            split_method: expense.split_method || 'equal',
            status: 'pending',
            notes: expense.notes
          }));

          const { data: bulkExpenses, error: expensesError } = await supabase
            .from('b2b_bulk_expenses')
            .insert(processedExpenses)
            .select();

          if (expensesError) {
            return res.status(500).json({ error: 'Erro ao processar despesas' });
          }

          // Update operation with total items count
          const { error: updateError } = await supabase
            .from('b2b_bulk_operations')
            .update({ total_items: processedExpenses.length })
            .eq('id', operation_id);

          if (updateError) {
            console.error('Erro ao atualizar contagem de itens:', updateError);
          }

          return res.status(201).json({
            operation_id,
            expenses: bulkExpenses
          });

        case 'process_expenses':
          const { operation_id: processOperationId, expense_ids } = data;

          if (!processOperationId || !expense_ids || !Array.isArray(expense_ids)) {
            return res.status(400).json({ error: 'Dados inválidos' });
          }

          // Update expenses status to processed
          const { data: updatedExpenses, error: processError } = await supabase
            .from('b2b_bulk_expenses')
            .update({ status: 'processed' })
            .in('id', expense_ids)
            .select();

          if (processError) {
            return res.status(500).json({ error: 'Erro ao processar despesas' });
          }

          // Update operation progress
          const { data: operation } = await supabase
            .from('b2b_bulk_operations')
            .select('processed_items, total_items')
            .eq('id', processOperationId)
            .single();

          if (operation) {
            const newProcessedCount = (operation.processed_items || 0) + expense_ids.length;
            const progress = Math.round((newProcessedCount / operation.total_items) * 100);

            await supabase
              .from('b2b_bulk_operations')
              .update({
                processed_items: newProcessedCount,
                progress,
                status: progress >= 100 ? 'completed' : 'running'
              })
              .eq('id', processOperationId);
          }

          return res.status(200).json({
            processed_count: updatedExpenses.length,
            operation_id: processOperationId
          });

        case 'categorize_expenses':
          const { operation_id: categorizeOperationId, categorization_rules } = data;

          if (!categorizeOperationId || !categorization_rules) {
            return res.status(400).json({ error: 'Dados inválidos' });
          }

          // Get pending expenses for this operation
          const { data: pendingExpenses, error: fetchError } = await supabase
            .from('b2b_bulk_expenses')
            .select('*')
            .eq('operation_id', categorizeOperationId)
            .eq('status', 'pending');

          if (fetchError) {
            return res.status(500).json({ error: 'Erro ao buscar despesas' });
          }

          // Apply categorization rules
          const categorizedExpenses = pendingExpenses.map((expense) => {
            let category = expense.category;
            
            // Apply categorization rules
            for (const rule of categorization_rules) {
              if (expense.description.toLowerCase().includes(rule.keyword.toLowerCase())) {
                category = rule.category;
                break;
              }
            }

            return {
              id: expense.id,
              category
            };
          });

          // Update expenses with new categories
          const { data: updatedCategorizedExpenses, error: categorizeError } = await supabase
            .from('b2b_bulk_expenses')
            .upsert(categorizedExpenses)
            .select();

          if (categorizeError) {
            return res.status(500).json({ error: 'Erro ao categorizar despesas' });
          }

          return res.status(200).json({
            categorized_count: updatedCategorizedExpenses.length,
            operation_id: categorizeOperationId
          });

        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }
    } catch (error) {
      console.error('Erro na API de operações em lote:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'update_operation':
          const { operation_id, updateData } = data;

          if (!operation_id) {
            return res.status(400).json({ error: 'ID da operação é obrigatório' });
          }

          const { data: operation, error: operationError } = await supabase
            .from('b2b_bulk_operations')
            .update(updateData)
            .eq('id', operation_id)
            .select()
            .single();

          if (operationError) {
            return res.status(500).json({ error: 'Erro ao atualizar operação' });
          }

          return res.status(200).json(operation);

        case 'update_expense':
          const { expense_id, expenseUpdateData } = data;

          if (!expense_id) {
            return res.status(400).json({ error: 'ID da despesa é obrigatório' });
          }

          const { data: expense, error: expenseError } = await supabase
            .from('b2b_bulk_expenses')
            .update(expenseUpdateData)
            .eq('id', expense_id)
            .select()
            .single();

          if (expenseError) {
            return res.status(500).json({ error: 'Erro ao atualizar despesa' });
          }

          return res.status(200).json(expense);

        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }
    } catch (error) {
      console.error('Erro na API de operações em lote:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'delete_operation':
          const { operation_id } = data;

          if (!operation_id) {
            return res.status(400).json({ error: 'ID da operação é obrigatório' });
          }

          // Delete all expenses for this operation first
          const { error: expensesDeleteError } = await supabase
            .from('b2b_bulk_expenses')
            .delete()
            .eq('operation_id', operation_id);

          if (expensesDeleteError) {
            return res.status(500).json({ error: 'Erro ao deletar despesas da operação' });
          }

          // Delete the operation
          const { error: operationDeleteError } = await supabase
            .from('b2b_bulk_operations')
            .delete()
            .eq('id', operation_id);

          if (operationDeleteError) {
            return res.status(500).json({ error: 'Erro ao deletar operação' });
          }

          return res.status(200).json({ message: 'Operação deletada com sucesso' });

        case 'delete_expense':
          const { expense_id } = data;

          if (!expense_id) {
            return res.status(400).json({ error: 'ID da despesa é obrigatório' });
          }

          const { error: expenseDeleteError } = await supabase
            .from('b2b_bulk_expenses')
            .delete()
            .eq('id', expense_id);

          if (expenseDeleteError) {
            return res.status(500).json({ error: 'Erro ao deletar despesa' });
          }

          return res.status(200).json({ message: 'Despesa deletada com sucesso' });

        default:
          return res.status(400).json({ error: 'Ação inválida' });
      }
    } catch (error) {
      console.error('Erro na API de operações em lote:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 