import { NextApiRequest, NextApiResponse } from 'next';
import { RachaAIClaudeClient } from '../../../lib/claude-client';
import { RateLimiter } from '../../../lib/rate-limit';
import { performanceOptimizer } from '../../../lib/performance-optimizer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const claudeClient = new RachaAIClaudeClient();
const rateLimiter = new RateLimiter();

// Initialize Supabase client for conversation storage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId, conversationId, culturalContext, userPreferences } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.limitRequests(userId || 'anonymous');
    if (!rateLimitResult.success) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        retryAfter: rateLimitResult.resetTime 
      });
    }

    // Performance optimization: Add network and device context
    const userAgent = req.headers['user-agent'] || 'unknown';
    const networkCondition = req.headers['x-network-condition'] as string || 'medium';
    
    // Get Claude response with performance optimization
    const context = {
      userId,
      conversationId: conversationId || uuidv4(),
      messageHistory: [],
      userAgent,
      networkCondition,
      culturalContext,
      userPreferences
    };
    const response = await claudeClient.processMessage(message, context);

    // Store conversation in Supabase (Story 3 requirement)
    if (userId) {
      try {
        // Store the conversation
        const { error: conversationError } = await supabase
          .from('conversations')
          .upsert({
            id: conversationId || uuidv4(),
            user_id: userId || uuidv4(), // Ensure user_id is a valid UUID
            title: message.substring(0, 200), // Use first 200 chars as title
            conversation_type: 'ai_help',
            context_summary: `User asked: ${message.substring(0, 100)}...`,
            ai_model_used: response.modelUsed || response.model,
            total_tokens_used: response.tokensUsed?.total || response.tokens?.total || 0,
            total_cost_brl: response.costBRL || response.cost || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          });

        if (conversationError) {
          console.error('Error storing conversation:', conversationError);
        }

        // Store individual messages for better structure
        const { error: messageError } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: conversationId || uuidv4(),
              role: 'user',
              content: message,
              message_type: 'text',
              created_at: new Date().toISOString()
            },
            {
              conversation_id: conversationId || uuidv4(),
              role: 'assistant',
              content: response.content,
              message_type: 'text',
              tokens_used: response.tokensUsed?.total || response.tokens?.total || 0,
              model_used: response.modelUsed || response.model,
              cost_brl: response.costBRL || response.cost || 0,
              processing_time_ms: response.processingTimeMs || 0,
              created_at: new Date().toISOString()
            }
          ]);

        if (messageError) {
          console.error('Error storing messages:', messageError);
        }

      } catch (storageError) {
        console.error('Error storing conversation in Supabase:', storageError);
        // Don't fail the request if storage fails
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        content: response.content,
        modelUsed: response.modelUsed || response.model,
        tokensUsed: response.tokensUsed || response.tokens,
        costBRL: response.costBRL || response.cost || 0,
        cached: response.cached || false,
        processingTimeMs: response.processingTimeMs || 0
      },
      usage: {
        dailySpend: 0,
        budget: 100,
        percentageUsed: 0,
        modelDistribution: {
          haiku: 1,
          sonnet: 0,
          opus: 0
        }
      },
      conversationId: conversationId || uuidv4()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for specific error types
    if (error instanceof Error && error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 