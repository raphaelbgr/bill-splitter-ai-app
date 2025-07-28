import Redis from 'ioredis';

// Redis client configuration
const redis = new Redis({
  host: '192.168.7.101',
  port: 6379,
  password: 'tjq5uxt3',
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Cache TTL constants
const CACHE_TTL = {
  SESSION: 3600, // 1 hour
  CONVERSATION: 86400, // 24 hours
  USER_PREFERENCES: 604800, // 7 days
  PATTERNS: 86400, // 24 hours
  CONTEXT: 1800, // 30 minutes
};

// Cache key patterns
const CACHE_KEYS = {
  SESSION: (userId: string) => `session:${userId}`,
  CONVERSATION: (conversationId: string) => `conversation:${conversationId}`,
  USER_PREFERENCES: (userId: string) => `user:${userId}:preferences`,
  CONTEXT: (conversationId: string) => `context:${conversationId}`,
  PATTERNS: (userId: string) => `patterns:${userId}`,
};

export class RedisCache {
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  // Session management
  async setSession(userId: string, sessionData: any): Promise<void> {
    try {
      await this.redis.setex(
        CACHE_KEYS.SESSION(userId),
        CACHE_TTL.SESSION,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error('Redis session set error:', error);
    }
  }

  async getSession(userId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(CACHE_KEYS.SESSION(userId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis session get error:', error);
      return null;
    }
  }

  // Conversation caching
  async setConversation(conversationId: string, conversationData: any): Promise<void> {
    try {
      await this.redis.setex(
        CACHE_KEYS.CONVERSATION(conversationId),
        CACHE_TTL.CONVERSATION,
        JSON.stringify(conversationData)
      );
    } catch (error) {
      console.error('Redis conversation set error:', error);
    }
  }

  async getConversation(conversationId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(CACHE_KEYS.CONVERSATION(conversationId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis conversation get error:', error);
      return null;
    }
  }

  // User preferences caching
  async setUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      await this.redis.setex(
        CACHE_KEYS.USER_PREFERENCES(userId),
        CACHE_TTL.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Redis preferences set error:', error);
    }
  }

  async getUserPreferences(userId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(CACHE_KEYS.USER_PREFERENCES(userId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis preferences get error:', error);
      return null;
    }
  }

  // Context management
  async setContext(conversationId: string, context: any): Promise<void> {
    try {
      await this.redis.setex(
        CACHE_KEYS.CONTEXT(conversationId),
        CACHE_TTL.CONTEXT,
        JSON.stringify(context)
      );
    } catch (error) {
      console.error('Redis context set error:', error);
    }
  }

  async getContext(conversationId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(CACHE_KEYS.CONTEXT(conversationId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis context get error:', error);
      return null;
    }
  }

  // Pattern caching
  async setPatterns(userId: string, patterns: any): Promise<void> {
    try {
      await this.redis.setex(
        CACHE_KEYS.PATTERNS(userId),
        CACHE_TTL.PATTERNS,
        JSON.stringify(patterns)
      );
    } catch (error) {
      console.error('Redis patterns set error:', error);
    }
  }

  async getPatterns(userId: string): Promise<any | null> {
    try {
      const data = await this.redis.get(CACHE_KEYS.PATTERNS(userId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis patterns get error:', error);
      return null;
    }
  }

  // Cache invalidation
  async invalidateSession(userId: string): Promise<void> {
    try {
      await this.redis.del(CACHE_KEYS.SESSION(userId));
    } catch (error) {
      console.error('Redis session invalidation error:', error);
    }
  }

  async invalidateConversation(conversationId: string): Promise<void> {
    try {
      await this.redis.del(CACHE_KEYS.CONVERSATION(conversationId));
      await this.redis.del(CACHE_KEYS.CONTEXT(conversationId));
    } catch (error) {
      console.error('Redis conversation invalidation error:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Close connection
  async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Redis close error:', error);
    }
  }

  // Proxy setex for compatibility
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.redis.setex(key, seconds, value);
  }

  // Proxy get for compatibility
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  // Proxy del for compatibility
  async del(...keys: string[]): Promise<number> {
    // @ts-ignore
    return this.redis.del(...keys);
  }

  // Proxy keys for compatibility
  async keys(pattern: string): Promise<string[]> {
    // @ts-ignore
    return this.redis.keys(pattern);
  }

  // Proxy ttl for compatibility
  async ttl(key: string): Promise<number> {
    // @ts-ignore
    return this.redis.ttl(key);
  }

  // Proxy expire for compatibility
  async expire(key: string, seconds: number): Promise<number> {
    // @ts-ignore
    return this.redis.expire(key, seconds);
  }
}

// Export singleton instance
export const redisCache = new RedisCache();

// Export for direct Redis access if needed
export { redis };
export { RedisCache as RedisClient }; 