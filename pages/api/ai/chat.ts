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
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId, conversationId } = req.body;

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
      networkCondition
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
            user_id: userId,
            content: message,
            ai_response: response.content,
            processed_at: new Date().toISOString(),
            retention_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
            created_at: new Date().toISOString()
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
              user_id: userId,
              content: message,
              message_type: 'user',
              created_at: new Date().toISOString()
            },
            {
              conversation_id: conversationId || uuidv4(),
              user_id: userId,
              content: response.content,
              message_type: 'ai',
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
      content: response.content,
      model: response.modelUsed,
      tokens: response.tokensUsed,
      cost: response.costBRL,
      conversationId: conversationId || uuidv4()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 