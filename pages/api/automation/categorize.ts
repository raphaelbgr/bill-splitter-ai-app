import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createPagesSupabaseClient } from '../../../lib/supabase-pages';
import { BrazilianNLPProcessor } from '../../../lib/brazilian-nlp';

const categorizeSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  userId: z.string().optional(),
  groupId: z.string().uuid().optional(),
  region: z.enum(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'MT', 'MS', 'DF', 'BR']).optional(),
  context: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const validatedData = categorizeSchema.parse(req.body);
      const supabase = createPagesSupabaseClient();

      // Initialize Brazilian NLP processor
      const nlpProcessor = new BrazilianNLPProcessor();

      // Analyze the expense description using Brazilian NLP
      const analysis = await nlpProcessor.analyzeExpense(
        validatedData.description,
        validatedData.amount,
        {
          region: validatedData.region || 'BR',
          context: validatedData.context || '',
          userId: validatedData.userId,
          groupId: validatedData.groupId,
        }
      );

      // Get user's historical categorization patterns if userId is provided
      let userPatterns = null;
      if (validatedData.userId) {
        userPatterns = await getUserCategorizationPatterns(supabase, validatedData.userId);
      }

      // Get group context if groupId is provided
      let groupContext = null;
      if (validatedData.groupId) {
        const { data: group } = await supabase
          .from('groups')
          .select('name, group_type, default_split_method')
          .eq('id', validatedData.groupId)
          .single();
        
        groupContext = group;
      }

      // Generate categorization suggestions based on analysis and context
      const suggestions = generateCategorizationSuggestions(
        analysis,
        userPatterns,
        groupContext,
        validatedData.region || 'BR',
        validatedData.amount
      );

      // Get cultural context for the region
      const culturalContext = getCulturalContext(validatedData.region || 'BR');

      // Log the categorization attempt for learning
      if (validatedData.userId) {
        await logCategorizationAttempt(supabase, {
          userId: validatedData.userId,
          description: validatedData.description,
          amount: validatedData.amount,
          analysis,
          suggestions,
          timestamp: new Date().toISOString(),
        });
      }

      const response = {
        description: validatedData.description,
        amount: validatedData.amount,
        analysis: {
          detectedCategory: analysis.category,
          confidence: analysis.confidence,
          keywords: analysis.keywords,
          culturalFactors: analysis.culturalFactors,
          regionalVariations: analysis.regionalVariations,
        },
        suggestions,
        culturalContext,
        userPatterns: userPatterns ? {
          preferredCategories: userPatterns.preferredCategories,
          averageAmounts: userPatterns.averageAmounts,
          frequency: userPatterns.frequency,
        } : null,
        groupContext: groupContext ? {
          groupType: groupContext.group_type,
          defaultSplitMethod: groupContext.default_split_method,
        } : null,
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Categorization error:', error);
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

async function getUserCategorizationPatterns(supabase: any, userId: string) {
  // Get user's recent expenses and their categories
  const { data: recentExpenses } = await supabase
    .from('expenses')
    .select('category, total_amount, description, expense_date')
    .eq('paid_by', userId)
    .gte('expense_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .order('expense_date', { ascending: false })
    .limit(100);

  if (!recentExpenses || recentExpenses.length === 0) {
    return null;
  }

  // Analyze patterns
  const categoryCounts: { [key: string]: number } = {};
  const categoryAmounts: { [key: string]: number[] } = {};
  const descriptions: { [key: string]: string[] } = {};

  recentExpenses.forEach(expense => {
    const category = expense.category || 'outros';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    if (!categoryAmounts[category]) {
      categoryAmounts[category] = [];
    }
    categoryAmounts[category].push(expense.total_amount);

    if (!descriptions[category]) {
      descriptions[category] = [];
    }
    descriptions[category].push(expense.description);
  });

  // Calculate averages and preferences
  const preferredCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({
      category,
      frequency: count,
      percentage: (count / recentExpenses.length) * 100,
    }));

  const averageAmounts = Object.entries(categoryAmounts).map(([category, amounts]) => ({
    category,
    averageAmount: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
    minAmount: Math.min(...amounts),
    maxAmount: Math.max(...amounts),
  }));

  return {
    preferredCategories,
    averageAmounts,
    frequency: recentExpenses.length,
    totalAmount: recentExpenses.reduce((sum, exp) => sum + exp.total_amount, 0),
    descriptions,
  };
}

function generateCategorizationSuggestions(
  analysis: any,
  userPatterns: any,
  groupContext: any,
  region: string,
  amount: number
) {
  const suggestions = [];

  // Primary suggestion based on NLP analysis
  suggestions.push({
    id: 'primary',
    category: analysis.category,
    confidence: analysis.confidence,
    reason: analysis.reason,
    priority: 1,
    culturalFactors: analysis.culturalFactors,
  });

  // User pattern-based suggestions
  if (userPatterns && userPatterns.preferredCategories.length > 0) {
    const topUserCategory = userPatterns.preferredCategories[0];
    if (topUserCategory.category !== analysis.category) {
      suggestions.push({
        id: 'user-pattern',
        category: topUserCategory.category,
        confidence: Math.min(topUserCategory.percentage / 100, 0.8),
        reason: `Baseado no seu histórico (${topUserCategory.frequency} vezes)`,
        priority: 2,
        culturalFactors: ['user_preference'],
      });
    }
  }

  // Regional suggestions
  const regionalSuggestions = getRegionalSuggestions(analysis, region);
  suggestions.push(...regionalSuggestions);

  // Group context suggestions
  if (groupContext) {
    const groupSuggestions = getGroupContextSuggestions(analysis, groupContext);
    suggestions.push(...groupSuggestions);
  }

  // Amount-based suggestions
  const amountSuggestions = getAmountBasedSuggestions(analysis, amount);
  suggestions.push(...amountSuggestions);

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

function getCulturalContext(region: string) {
  const contexts = {
    SP: {
      name: 'São Paulo',
      culturalFactors: ['urban_lifestyle', 'diverse_cuisine', 'business_culture'],
      commonCategories: ['restaurante', 'transporte', 'entretenimento', 'shopping'],
    },
    RJ: {
      name: 'Rio de Janeiro',
      culturalFactors: ['beach_culture', 'social_lifestyle', 'tourism'],
      commonCategories: ['restaurante', 'praia', 'entretenimento', 'transporte'],
    },
    MG: {
      name: 'Minas Gerais',
      culturalFactors: ['family_oriented', 'traditional_cuisine', 'hospitality'],
      commonCategories: ['restaurante', 'família', 'casa', 'tradicional'],
    },
    RS: {
      name: 'Rio Grande do Sul',
      culturalFactors: ['gaucho_culture', 'barbecue_tradition', 'strong_community'],
      commonCategories: ['churrasco', 'família', 'tradicional', 'comunidade'],
    },
    BR: {
      name: 'Brasil',
      culturalFactors: ['brazilian_social', 'shared_experiences', 'cost_conscious'],
      commonCategories: ['restaurante', 'transporte', 'entretenimento', 'família'],
    },
  };

  return contexts[region as keyof typeof contexts] || contexts.BR;
}

function getRegionalSuggestions(analysis: any, region: string) {
  const suggestions = [];

  if (region === 'SP' || region === 'RJ') {
    // Urban areas might have different categorization patterns
    if (analysis.category === 'restaurante' && analysis.amount > 100) {
      suggestions.push({
        id: 'regional-urban',
        category: 'fine_dining',
        confidence: 0.7,
        reason: 'Restaurante de alto padrão em área urbana',
        priority: 3,
        culturalFactors: ['urban_lifestyle'],
      });
    }
  } else if (region === 'RS') {
    // Gaucho culture might categorize differently
    if (analysis.keywords.includes('carne') || analysis.keywords.includes('churrasco')) {
      suggestions.push({
        id: 'regional-gaucho',
        category: 'churrasco',
        confidence: 0.85,
        reason: 'Tradição gaúcha de churrasco',
        priority: 2,
        culturalFactors: ['gaucho_culture'],
      });
    }
  }

  return suggestions;
}

function getGroupContextSuggestions(analysis: any, groupContext: any) {
  const suggestions = [];

  if (groupContext.group_type === 'travel') {
    suggestions.push({
      id: 'group-travel',
      category: 'viagem',
      confidence: 0.8,
      reason: 'Grupo de viagem',
      priority: 2,
      culturalFactors: ['travel_context'],
    });
  } else if (groupContext.group_type === 'family') {
    suggestions.push({
      id: 'group-family',
      category: 'família',
      confidence: 0.75,
      reason: 'Grupo familiar',
      priority: 2,
      culturalFactors: ['family_context'],
    });
  }

  return suggestions;
}

function getAmountBasedSuggestions(analysis: any, amount: number) {
  const suggestions = [];

  if (amount > 200) {
    suggestions.push({
      id: 'amount-high',
      category: 'grande_compra',
      confidence: 0.6,
      reason: 'Valor alto para categoria',
      priority: 3,
      culturalFactors: ['amount_threshold'],
    });
  } else if (amount < 20) {
    suggestions.push({
      id: 'amount-low',
      category: 'pequena_despesa',
      confidence: 0.5,
      reason: 'Valor baixo',
      priority: 4,
      culturalFactors: ['amount_threshold'],
    });
  }

  return suggestions;
}

async function logCategorizationAttempt(supabase: any, data: {
  userId: string;
  description: string;
  amount: number;
  analysis: any;
  suggestions: any[];
  timestamp: string;
}) {
  try {
    await supabase
      .from('processing_records')
      .insert({
        user_id: data.userId,
        processing_type: 'expense_categorization',
        input_data: {
          description: data.description,
          amount: data.amount,
        },
        output_data: {
          analysis: data.analysis,
          suggestions: data.suggestions,
        },
        processing_timestamp: data.timestamp,
        ai_model_used: 'brazilian_nlp',
        confidence_score: data.analysis.confidence,
        cultural_context: data.analysis.culturalFactors,
      });
  } catch (error) {
    console.error('Failed to log categorization attempt:', error);
  }
} 