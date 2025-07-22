import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { RachaAIClaudeClient, ConversationContext, ClaudeResponse } from '../../../lib/claude-client';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { rateLimit } from '../../../lib/rate-limit';

// Request validation schema
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
  culturalContext: z.object({
    region: z.string(),
    scenario: z.enum(['restaurante', 'uber', 'churrasco', 'happy_hour', 'viagem', 'vaquinha', 'outros']),
    groupType: z.enum(['amigos', 'familia', 'trabalho', 'faculdade']),
    timeOfDay: z.enum(['manha', 'almoco', 'tarde', 'jantar', 'noite'])
  }).optional(),
  userPreferences: z.object({
    language: z.enum(['pt-BR', 'en']).default('pt-BR'),
    formalityLevel: z.enum(['informal', 'formal', 'professional']).default('informal'),
    region: z.string(),
    paymentPreference: z.enum(['pix', 'boleto', 'cartao', 'dinheiro']).default('pix')
  }).optional()
});

// Response type
interface ApiResponse {
  success: boolean;
  data?: ClaudeResponse;
  error?: string;
  usage?: {
    dailySpend: number;
    budget: number;
    percentageUsed: number;
    modelDistribution: Record<string, number>;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Use POST.'
    });
  }

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req);
    if (!rateLimitResult.success) {
      return res.status(429).json({
        success: false,
        error: `Limite de requisições excedido. Tente novamente em ${rateLimitResult.resetTime} segundos.`
      });
    }

    // Validate request body
    const validationResult = ChatRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: `Dados inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`
      });
    }

    const { message, conversationId, groupId, culturalContext, userPreferences } = validationResult.data;

    // Initialize Supabase client for authentication
    const supabase = createServerSupabaseClient({ req, res });
    
    // Verify user authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return res.status(401).json({
        success: false,
        error: 'Não autorizado. Faça login para continuar.'
      });
    }

    const userId = session.user.id;

    // Load conversation history from Supabase
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        messages (
          id,
          role,
          content,
          created_at,
          model_used,
          tokens_used,
          cost_brl
        )
      `)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error loading conversation:', conversationError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao carregar conversa.'
      });
    }

    // Prepare conversation context
    const context: ConversationContext = {
      userId,
      conversationId,
      groupId,
      messageHistory: conversationData?.messages?.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        modelUsed: msg.model_used,
        tokensUsed: msg.tokens_used,
        costBRL: msg.cost_brl
      })) || [],
      userPreferences,
      culturalContext
    };

    // Initialize Claude client
    const claudeClient = new RachaAIClaudeClient();

    // Process message with Claude
    const response = await claudeClient.processMessage(message, context);

    // Save user message to database
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        user_id: userId
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
    }

    // Save Claude response to database
    const { error: responseError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content,
        model_used: response.modelUsed,
        tokens_used: response.tokensUsed.total,
        cost_brl: response.costBRL,
        processing_time_ms: response.processingTimeMs,
        confidence_score: response.confidence,
        user_id: userId
      });

    if (responseError) {
      console.error('Error saving response:', responseError);
    }

    // Update conversation metadata
    if (conversationData) {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
          total_amount: null, // Will be set when expense is finalized
          status: 'active'
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
      }
    } else {
      // Create new conversation if it doesn't exist
      const { error: createError } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: userId,
          group_id: groupId,
          title: message.substring(0, 100), // First 100 chars as title
          status: 'active',
          expense_type: culturalContext?.scenario || 'outros',
          cultural_context: culturalContext?.scenario || 'general'
        });

      if (createError) {
        console.error('Error creating conversation:', createError);
      }
    }

    // Log LGPD compliance
    await supabase
      .from('lgpd_audit_log')
      .insert({
        user_id: userId,
        operation_type: 'ai_processing',
        data_categories: ['conversations', 'messages'],
        legal_basis: 'consent',
        purpose: 'Processamento de IA para divisão de contas',
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        ai_model_used: response.modelUsed,
        contains_sensitive_data: false,
        processing_duration_ms: response.processingTimeMs
      });

    // Get current usage stats
    const usageStats = await claudeClient.getUsageStats();

    // Return successful response
    return res.status(200).json({
      success: true,
      data: response,
      usage: usageStats
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('orçamento')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: 'Muitas requisições. Aguarde um momento e tente novamente.'
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor. Tente novamente em alguns instantes.'
    });
  }
}

// Export config for larger request body sizes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} 