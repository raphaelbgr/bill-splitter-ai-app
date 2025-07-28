import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { RachaAIClaudeClient } from '../../../lib/claude-client';
import { rateLimit } from '../../../lib/rate-limit';

const ChatSchema = z.object({
  userId: z.string().optional(),
  message: z.string().min(1),
  conversationId: z.string().optional(),
  context: z.object({
    region: z.string().optional(),
    language: z.string().optional(),
    culturalContext: z.any().optional()
  }).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // For test/dev: return usage stats
    const claudeClient = new RachaAIClaudeClient();
    const usageStats = await claudeClient.getUsageStats();
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    
    return res.status(200).json({
      success: true,
      data: {
        content: hasApiKey 
          ? 'RachaAI está online e pronto para ajudar! 🤖'
          : 'RachaAI em modo de teste. Configure ANTHROPIC_API_KEY para usar IA completa.',
        modelUsed: hasApiKey ? 'claude-3-5-sonnet-20241022' : 'test-mode',
        tokensUsed: { total: 0, input: 0, output: 0 },
        costBRL: 0,
        apiKeyConfigured: hasApiKey
      },
      usage: usageStats
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = ChatSchema.parse(req.body);
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(req, {
      userId: validatedData.userId,
      claudeLimit: 10
    });
    
    if (rateLimitResult.error) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.resetTime
      });
    }
    
    // Initialize Claude client
    const claudeClient = new RachaAIClaudeClient();
    
    // Prepare conversation context
    const context = {
      userId: validatedData.userId || 'test-user',
      conversationId: validatedData.conversationId || `conv_${Date.now()}`,
      messageHistory: [], // Will be enhanced in Story 4 with memory system
      userPreferences: {
        language: 'pt-BR' as const,
        formalityLevel: 'informal' as const,
        region: validatedData.context?.region || 'BR',
        paymentPreference: 'pix' as const
      },
      culturalContext: validatedData.context?.culturalContext || {
        region: validatedData.context?.region || 'BR',
        scenario: 'restaurante' as const,
        groupType: 'amigos' as const,
        timeOfDay: 'jantar' as const
      }
    };

    // Process message with Claude AI
    const claudeResponse = await claudeClient.processMessage(
      validatedData.message,
      context
    );

    // Get usage statistics
    const usageStats = await claudeClient.getUsageStats();

    const result = {
      success: true,
      data: {
        content: claudeResponse.content,
        modelUsed: claudeResponse.modelUsed,
        tokensUsed: claudeResponse.tokensUsed,
        costBRL: claudeResponse.costBRL,
        cached: claudeResponse.cached,
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
      },
      usage: usageStats
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Message is required',
        details: error.errors
      });
    }
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 