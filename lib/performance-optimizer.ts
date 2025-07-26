import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

// Types and Interfaces
export interface PerformanceMetrics {
  responseTime: number;
  modelUsed: string;
  tokensUsed: number;
  costBRL: number;
  cacheHit: boolean;
  region: string;
  networkCondition: 'fast' | 'medium' | 'slow';
  peakHour: boolean;
  mobileDevice: boolean;
}

export interface CacheStrategy {
  key: string;
  ttl: number;
  compression: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface BrazilianPeakHourConfig {
  morning: { start: number; end: number }; // 7-9 AM
  lunch: { start: number; end: number }; // 12-2 PM
  evening: { start: number; end: number }; // 6-9 PM
  weekend: { start: number; end: number }; // 7-10 PM
}

export interface CostOptimizationConfig {
  dailyBudgetBRL: number;
  monthlyBudgetBRL: number;
  alertThreshold: number;
  modelCosts: Record<string, number>;
}

export interface PerformanceTargets {
  haikuResponseTime: number; // 1000ms
  sonnetResponseTime: number; // 2500ms
  opusResponseTime: number; // 5000ms
  mobileLoadTime: number; // 3000ms
  cacheHitRate: number; // 0.8 (80%)
}

export class PerformanceOptimizer {
  private redis: Redis;
  private supabase: any;
  private exchangeRate: number = 5.0; // USD to BRL

  // Brazilian peak hour configuration
  private readonly PEAK_HOURS: BrazilianPeakHourConfig = {
    morning: { start: 7, end: 9 },
    lunch: { start: 12, end: 14 },
    evening: { start: 18, end: 21 },
    weekend: { start: 19, end: 22 }
  };

  // Performance targets
  private readonly TARGETS: PerformanceTargets = {
    haikuResponseTime: 1000,
    sonnetResponseTime: 2500,
    opusResponseTime: 5000,
    mobileLoadTime: 3000,
    cacheHitRate: 0.8
  };

  // Cost optimization configuration
  private readonly COST_CONFIG: CostOptimizationConfig = {
    dailyBudgetBRL: 2.0,
    monthlyBudgetBRL: 50.0,
    alertThreshold: 0.8,
    modelCosts: {
      'claude-3-haiku-20240307': 0.02,
      'claude-3-sonnet-20240229': 0.10,
      'claude-3-opus-20240229': 0.15
    }
  };

  constructor() {
    // Initialize Redis client
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!redisUrl || !redisToken) {
      console.warn('Redis configuration not found. Performance optimization features will be limited.');
      // Create a mock Redis client for development
      this.redis = {
        get: async () => null,
        setex: async () => 'OK',
        del: async () => 1,
        keys: async () => [],
        ttl: async () => -1,
        expire: async () => 1,
        incr: async () => 1,
        exists: async () => 0,
        set: async () => 'OK',
        healthCheck: async () => false
      } as any;
    } else {
      this.redis = new Redis({
        url: redisUrl,
        token: redisToken
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration not found. Analytics features will be limited.');
      // Create a mock Supabase client for development
      this.supabase = {
        from: () => ({
          insert: async () => ({ data: null, error: null }),
          select: async () => ({ data: [], error: null }),
          update: async () => ({ data: null, error: null }),
          delete: async () => ({ data: null, error: null })
        })
      } as any;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Intelligent Claude API caching with Brazilian optimization
   */
  async getCachedResponse(
    message: string,
    context: any,
    model: string
  ): Promise<any | null> {
    try {
      const cacheKey = this.generateCacheKey(message, context, model);
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        await this.trackCacheHit(cacheKey);
        return JSON.parse(cached);
      }
      
      await this.trackCacheMiss(cacheKey);
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Cache Claude API response with intelligent TTL
   */
  async cacheResponse(
    message: string,
    context: any,
    model: string,
    response: any
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(message, context, model);
      const ttl = this.calculateAdaptiveTTL(model, response.tokensUsed);
      
      await this.redis.setex(cacheKey, ttl, JSON.stringify(response));
      await this.trackCacheSet(cacheKey, ttl);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Generate intelligent cache key
   */
  private generateCacheKey(message: string, context: any, model: string): string {
    const messageHash = this.hashString(message);
    const contextHash = this.hashString(JSON.stringify(context));
    const region = context.region || 'BR';
    
    return `claude:${region}:${model}:${messageHash}:${contextHash}`;
  }

  /**
   * Calculate adaptive TTL based on model and Brazilian peak hours
   */
  private calculateAdaptiveTTL(model: string, tokens: number): number {
    const baseTTL = 3600; // 1 hour base
    
    // Longer cache for expensive models
    if (model.includes('opus')) {
      return baseTTL * 4; // 4 hours
    }
    
    // Longer cache for long responses
    if (tokens > 2000) {
      return baseTTL * 2; // 2 hours
    }
    
    // Brazilian peak hour consideration
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo"
    }));
    
    const hour = brazilTime.getHours();
    const isPeakHour = this.isPeakHour(hour);
    
    // Shorter cache during peak hours for fresh responses
    if (isPeakHour) {
      return Math.floor(baseTTL * 0.5); // 30 minutes
    }
    
    return baseTTL;
  }

  /**
   * Check if current time is Brazilian peak hour
   */
  private isPeakHour(hour: number): boolean {
    return (
      (hour >= this.PEAK_HOURS.morning.start && hour <= this.PEAK_HOURS.morning.end) ||
      (hour >= this.PEAK_HOURS.lunch.start && hour <= this.PEAK_HOURS.lunch.end) ||
      (hour >= this.PEAK_HOURS.evening.start && hour <= this.PEAK_HOURS.evening.end) ||
      (hour >= this.PEAK_HOURS.weekend.start && hour <= this.PEAK_HOURS.weekend.end)
    );
  }

  /**
   * Brazilian peak hour optimization
   */
  async optimizeForPeakHours(userId: string, region: string): Promise<any> {
    try {
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo"
      }));
      
      const hour = brazilTime.getHours();
      const isPeakHour = this.isPeakHour(hour);
      
      // Pre-cache common responses during peak hours
      if (isPeakHour) {
        await this.warmCacheForPeakHours(region);
      }
      
      // Optimize model selection for peak hours
      const peakHourOptimization = {
        useFasterModel: isPeakHour,
        reduceContextLength: isPeakHour,
        increaseCacheTTL: !isPeakHour,
        enableCompression: true
      };
      
      await this.trackPeakHourOptimization(userId, region, isPeakHour);
      
      return peakHourOptimization;
    } catch (error) {
      console.error('Peak hour optimization error:', error);
      return {};
    }
  }

  /**
   * Warm cache for peak hours
   */
  private async warmCacheForPeakHours(region: string): Promise<void> {
    try {
      const commonQueries = this.getCommonQueriesForRegion(region);
      
      for (const query of commonQueries) {
        const cacheKey = `claude:${region}:common:${this.hashString(query)}`;
        
        try {
          const exists = await this.redis.exists(cacheKey);
          
          if (!exists) {
            // Generate response in background
            setImmediate(async () => {
              try {
                // This would typically call Claude API
                const response = { content: 'Cached response', cached: true };
                await this.redis.setex(cacheKey, 1800, JSON.stringify(response)); // 30 min
              } catch (error) {
                console.log('Cache warming failed for query:', query);
              }
            });
          }
        } catch (redisError) {
          // Skip cache warming if Redis is not available
          console.log('Redis not available, skipping cache warming');
          break;
        }
      }
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  /**
   * Get common queries for Brazilian region
   */
  private getCommonQueriesForRegion(region: string): string[] {
    const commonQueries = {
      'SP': [
        'Dividir conta do rodízio',
        'Happy hour com a galera',
        'Uber compartilhado'
      ],
      'RJ': [
        'Dividir conta do bar',
        'Praia com amigos',
        'Festa de aniversário'
      ],
      'NE': [
        'Churrasco na praia',
        'Forró com amigos',
        'Jantar em família'
      ],
      'Sul': [
        'Churrasco tradicional',
        'Happy hour trabalho',
        'Jantar com colegas'
      ]
    };
    
    return commonQueries[region as keyof typeof commonQueries] || commonQueries['SP'];
  }

  /**
   * Mobile-first performance optimization
   */
  async optimizeForMobile(userAgent: string, networkCondition: string): Promise<any> {
    try {
      const isMobile = this.detectMobile(userAgent);
      const isSlowNetwork = networkCondition === 'slow';
      
      const mobileOptimization = {
        reduceImageQuality: isMobile,
        enableCompression: true,
        reduceContextLength: isMobile && isSlowNetwork,
        useFasterModel: isMobile && isSlowNetwork,
        enableOfflineMode: isMobile,
        optimizeImages: isMobile,
        reduceAnimations: isMobile
      };
      
      await this.trackMobileOptimization(userAgent, networkCondition, mobileOptimization);
      
      return mobileOptimization;
    } catch (error) {
      console.error('Mobile optimization error:', error);
      return {};
    }
  }

  /**
   * Detect mobile device
   */
  private detectMobile(userAgent: string): boolean {
    const mobileKeywords = [
      'Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone',
      'BlackBerry', 'Opera Mini', 'IEMobile'
    ];
    
    return mobileKeywords.some(keyword => 
      userAgent.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Cost optimization strategies
   */
  async optimizeCosts(userId: string, message: string, context: any): Promise<any> {
    try {
      const complexity = this.analyzeComplexity(message);
      const userTier = await this.getUserTier(userId);
      const dailyUsage = await this.getDailyUsage(userId);
      const budget = this.COST_CONFIG.dailyBudgetBRL;
      
      const costOptimization = {
        useCheaperModel: complexity <= 3 || userTier === 'free',
        reduceTokens: dailyUsage > budget * 0.8,
        enableCaching: true,
        compressContext: complexity > 5,
        useFallback: dailyUsage > budget * 0.9
      };
      
      await this.trackCostOptimization(userId, complexity, dailyUsage, budget);
      
      return costOptimization;
    } catch (error) {
      console.error('Cost optimization error:', error);
      return {};
    }
  }

  /**
   * Analyze message complexity
   */
  private analyzeComplexity(message: string): number {
    let complexity = 1;
    
    // Add complexity for various factors
    if (message.length > 200) complexity += 2;
    if (message.includes('porcentagem') || message.includes('%')) complexity += 1;
    if (message.includes('condicional') || message.includes('se')) complexity += 1;
    if (message.includes('múltiplas') || message.includes('várias')) complexity += 1;
    if (message.includes('moeda') || message.includes('dólar')) complexity += 1;
    
    return Math.min(complexity, 10);
  }

  /**
   * Get user tier
   */
  private async getUserTier(userId: string): Promise<string> {
    try {
      const { data } = await this.supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();
      
      return data?.subscription_tier || 'free';
    } catch (error) {
      return 'free';
    }
  }

  /**
   * Get daily usage
   */
  private async getDailyUsage(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageKey = `usage:${userId}:${today}`;
      const usage = await this.redis.get(usageKey);
      return parseFloat(usage || '0');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Store in Redis for real-time monitoring
      const metricsKey = `metrics:${Date.now()}`;
      await this.redis.setex(metricsKey, 86400, JSON.stringify(metrics));
      
      // Store in Supabase for analytics
      await this.supabase.from('performance_metrics').insert({
        metric_name: 'response_time',
        metric_value: metrics.responseTime,
        metric_unit: 'ms',
        tags: {
          model: metrics.modelUsed,
          region: metrics.region,
          cacheHit: metrics.cacheHit,
          peakHour: metrics.peakHour,
          mobileDevice: metrics.mobileDevice,
          networkCondition: metrics.networkCondition
        },
        metadata: {
          tokensUsed: metrics.tokensUsed,
          costBRL: metrics.costBRL
        }
      });
      
      // Check performance targets
      await this.checkPerformanceTargets(metrics);
    } catch (error) {
      console.error('Performance tracking error:', error);
    }
  }

  /**
   * Check if performance meets targets
   */
  private async checkPerformanceTargets(metrics: PerformanceMetrics): Promise<void> {
    const targets = this.TARGETS;
    let alerts = [];
    
    if (metrics.modelUsed.includes('haiku') && metrics.responseTime > targets.haikuResponseTime) {
      alerts.push('Haiku response time exceeded target');
    }
    
    if (metrics.modelUsed.includes('sonnet') && metrics.responseTime > targets.sonnetResponseTime) {
      alerts.push('Sonnet response time exceeded target');
    }
    
    if (metrics.modelUsed.includes('opus') && metrics.responseTime > targets.opusResponseTime) {
      alerts.push('Opus response time exceeded target');
    }
    
    if (metrics.mobileDevice && metrics.responseTime > targets.mobileLoadTime) {
      alerts.push('Mobile response time exceeded target');
    }
    
    if (alerts.length > 0) {
      await this.sendPerformanceAlerts(alerts, metrics);
    }
  }

  /**
   * Send performance alerts
   */
  private async sendPerformanceAlerts(alerts: string[], metrics: PerformanceMetrics): Promise<void> {
    try {
      const alertData = {
        alerts,
        metrics,
        timestamp: new Date().toISOString(),
        severity: 'warning'
      };
      
      await this.redis.setex(`alerts:${Date.now()}`, 3600, JSON.stringify(alertData));
      
      // In production, this would send to monitoring system
      console.warn('Performance alerts:', alerts);
    } catch (error) {
      console.error('Alert sending error:', error);
    }
  }

  /**
   * Track cache operations
   */
  private async trackCacheHit(key: string): Promise<void> {
    await this.redis.incr('cache:hits');
  }

  private async trackCacheMiss(key: string): Promise<void> {
    await this.redis.incr('cache:misses');
  }

  private async trackCacheSet(key: string, ttl: number): Promise<void> {
    await this.redis.incr('cache:sets');
  }

  /**
   * Track peak hour optimization
   */
  private async trackPeakHourOptimization(userId: string, region: string, isPeakHour: boolean): Promise<void> {
    const key = `peak_hour:${region}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.incr(key);
  }

  /**
   * Track mobile optimization
   */
  private async trackMobileOptimization(userAgent: string, networkCondition: string, optimization: any): Promise<void> {
    const key = `mobile_optimization:${networkCondition}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.setex(key, 86400, JSON.stringify(optimization));
  }

  /**
   * Track cost optimization
   */
  private async trackCostOptimization(userId: string, complexity: number, dailyUsage: number, budget: number): Promise<void> {
    const key = `cost_optimization:${userId}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.setex(key, 86400, JSON.stringify({
      complexity,
      dailyUsage,
      budget,
      percentageUsed: (dailyUsage / budget) * 100
    }));
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(): Promise<any> {
    try {
      const [
        cacheHits,
        cacheMisses,
        cacheSets,
        peakHourUsage,
        mobileUsage
      ] = await Promise.all([
        this.redis.get('cache:hits'),
        this.redis.get('cache:misses'),
        this.redis.get('cache:sets'),
        this.redis.get('peak_hour:SP:2024-12-19'),
        this.redis.get('mobile_optimization:fast:2024-12-19')
      ]);
      
      const totalCacheOps = (parseInt(cacheHits || '0') + parseInt(cacheMisses || '0'));
      const cacheHitRate = totalCacheOps > 0 ? parseInt(cacheHits || '0') / totalCacheOps : 0;
      
      return {
        cacheHitRate: cacheHitRate.toFixed(2),
        totalCacheOperations: totalCacheOps,
        peakHourUsage: parseInt(peakHourUsage || '0'),
        mobileOptimization: mobileUsage ? JSON.parse(mobileUsage) : {},
        targets: this.TARGETS
      };
    } catch (error) {
      console.error('Analytics retrieval error:', error);
      return {};
    }
  }

  /**
   * Hash string for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; metrics: any }> {
    try {
      const redisHealth = await this.redis.ping();
      const analytics = await this.getPerformanceAnalytics();
      
      const status = redisHealth === 'PONG' ? 'healthy' : 'degraded';
      
      return {
        status,
        metrics: analytics
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: {}
      };
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer(); 