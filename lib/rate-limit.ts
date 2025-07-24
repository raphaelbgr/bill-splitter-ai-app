import Redis from 'ioredis';
import { NextApiRequest } from 'next';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  error?: string;
}

export class RateLimiter {
  private redis: Redis;
  private defaultLimits = {
    requestsPerMinute: parseInt(process.env.REQUESTS_PER_MINUTE_PER_USER || '30'),
    claudeCallsPerMinute: parseInt(process.env.CLAUDE_CALLS_PER_MINUTE_PER_USER || '10'),
    conversationLength: parseInt(process.env.MAX_CONVERSATION_LENGTH || '20')
  };

  constructor() {
    this.redis = new Redis({
      host: '192.168.7.101',
      port: 6379,
      password: 'tjq5uxt3',
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  /**
   * General rate limiting for API requests
   */
  async limitRequests(
    identifier: string,
    limit: number = this.defaultLimits.requestsPerMinute,
    window: number = 60 // seconds
  ): Promise<RateLimitResult> {
    const key = `rate_limit:requests:${identifier}`;
    const now = Date.now();
    const windowStart = now - (window * 1000);

    try {
      // Add current request
      await this.redis.zadd(key, now, now.toString());
      
      // Remove old entries
      await this.redis.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      const currentCount = await this.redis.zcard(key);
      
      // Set expiry
      await this.redis.expire(key, window);

      const remaining = Math.max(0, limit - currentCount);
      const resetTime = window;

      return {
        success: currentCount <= limit,
        limit,
        remaining,
        resetTime,
        error: currentCount > limit ? 'Rate limit exceeded' : undefined
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if Redis is down
      return {
        success: true,
        limit,
        remaining: limit,
        resetTime: window
      };
    }
  }

  /**
   * Specific rate limiting for Claude API calls (more restrictive)
   */
  async limitClaudeCalls(
    userId: string,
    limit: number = this.defaultLimits.claudeCallsPerMinute
  ): Promise<RateLimitResult> {
    return this.limitRequests(`claude:${userId}`, limit, 60);
  }

  /**
   * Limit conversation length to prevent token bloat
   */
  async checkConversationLength(
    conversationId: string,
    maxLength: number = this.defaultLimits.conversationLength
  ): Promise<RateLimitResult> {
    const key = `conversation_length:${conversationId}`;
    
    try {
      const currentLength = await this.redis.incr(key);
      await this.redis.expire(key, 3600); // 1 hour expiry

      return {
        success: currentLength <= maxLength,
        limit: maxLength,
        remaining: Math.max(0, maxLength - currentLength),
        resetTime: 3600,
        error: currentLength > maxLength ? 'Conversation too long' : undefined
      };
    } catch (error) {
      console.error('Conversation length check error:', error);
      return {
        success: true,
        limit: maxLength,
        remaining: maxLength,
        resetTime: 3600
      };
    }
  }

  /**
   * Daily budget rate limiting
   */
  async checkDailyBudget(
    userId: string,
    currentSpend: number,
    dailyBudget: number
  ): Promise<RateLimitResult> {
    const remainingBudget = dailyBudget - currentSpend;
    const percentageUsed = (currentSpend / dailyBudget) * 100;

    return {
      success: currentSpend < dailyBudget,
      limit: dailyBudget,
      remaining: Math.max(0, remainingBudget),
      resetTime: this.getSecondsUntilMidnight(),
      error: currentSpend >= dailyBudget ? 
        `Daily budget of R$ ${dailyBudget.toFixed(2)} exceeded` : 
        percentageUsed > 80 ? 
          `Warning: ${percentageUsed.toFixed(1)}% of daily budget used` : 
          undefined
    };
  }

  /**
   * Brazilian business hours aware rate limiting
   */
  async limitWithBusinessHours(
    identifier: string,
    baseLimit: number = 30
  ): Promise<RateLimitResult> {
    const isBusinessHours = this.isBrazilianBusinessHours();
    
    // Increase limits during business hours
    const adjustedLimit = isBusinessHours ? Math.floor(baseLimit * 1.5) : baseLimit;
    
    return this.limitRequests(identifier, adjustedLimit, 60);
  }

  /**
   * Get user IP for rate limiting
   */
  getUserIdentifier(req: NextApiRequest): string {
    // Prefer user ID if available in session, fallback to IP
    const userAgent = req.headers['user-agent'] || '';
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.toString().split(',')[0] : req.connection.remoteAddress;
    
    return ip || userAgent.slice(0, 50);
  }

  /**
   * Check if current time is Brazilian business hours
   */
  private isBrazilianBusinessHours(): boolean {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo"
    }));
    
    const hour = brazilTime.getHours();
    const day = brazilTime.getDay();
    
    // Monday-Friday 8AM-8PM Brasília time
    return day >= 1 && day <= 5 && hour >= 8 && hour <= 20;
  }

  /**
   * Get seconds until midnight in São Paulo timezone
   */
  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo"
    }));
    
    const midnight = new Date(brazilTime);
    midnight.setHours(24, 0, 0, 0);
    
    return Math.floor((midnight.getTime() - brazilTime.getTime()) / 1000);
  }

  /**
   * Reset user rate limits (admin function)
   */
  async resetUserLimits(userId: string): Promise<void> {
    const patterns = [
      `rate_limit:requests:${userId}`,
      `rate_limit:claude:${userId}`,
      `conversation_length:*${userId}*`
    ];

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  /**
   * Get rate limit status for user
   */
  async getUserRateLimitStatus(userId: string): Promise<{
    requests: RateLimitResult;
    claudeCalls: RateLimitResult;
    businessHours: boolean;
  }> {
    const [requests, claudeCalls] = await Promise.all([
      this.limitRequests(`user:${userId}`, this.defaultLimits.requestsPerMinute, 60),
      this.limitRequests(`claude:${userId}`, this.defaultLimits.claudeCallsPerMinute, 60)
    ]);

    return {
      requests,
      claudeCalls,
      businessHours: this.isBrazilianBusinessHours()
    };
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

/**
 * Main rate limiting function for API routes
 */
export async function rateLimit(
  req: NextApiRequest,
  options?: {
    requestLimit?: number;
    claudeLimit?: number;
    userId?: string;
  }
): Promise<RateLimitResult> {
  const identifier = options?.userId || rateLimiter.getUserIdentifier(req);
  const isClaudeEndpoint = req.url?.includes('/ai/');

  // Apply stricter limits for Claude endpoints
  if (isClaudeEndpoint) {
    return rateLimiter.limitClaudeCalls(
      identifier, 
      options?.claudeLimit
    );
  }

  // Apply business hours aware limiting
  return rateLimiter.limitWithBusinessHours(
    identifier,
    options?.requestLimit
  );
}

export { rateLimiter };
export type { RateLimitResult }; 