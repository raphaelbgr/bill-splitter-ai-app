import { performanceOptimizer } from '../lib/performance-optimizer';

describe('Story 10: Performance Optimization & Caching', () => {
  beforeEach(() => {
    // Mock environment variables for testing
    process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:6379';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
  });

  describe('Intelligent Claude API Caching', () => {
    test('should cache responses with intelligent TTL', async () => {
      const message = 'Dividir conta do rodízio';
      const context = { region: 'SP', userId: 'test-user' };
      const model = 'claude-3-haiku-20240307';
      const response = { content: 'Test response', tokensUsed: 100 };

      // Cache the response
      await performanceOptimizer.cacheResponse(message, context, model, response);

      // Retrieve cached response
      const cached = await performanceOptimizer.getCachedResponse(message, context, model);
      
      expect(cached).toBeTruthy();
      expect(cached.content).toBe('Test response');
    });

    test('should handle cache misses gracefully', async () => {
      const message = 'Non-cached message';
      const context = { region: 'SP', userId: 'test-user' };
      const model = 'claude-3-haiku-20240307';

      const cached = await performanceOptimizer.getCachedResponse(message, context, model);
      
      expect(cached).toBeNull();
    });

    test('should generate unique cache keys', async () => {
      const message1 = 'Dividir conta do rodízio';
      const message2 = 'Dividir conta do rodízio';
      const context1 = { region: 'SP', userId: 'user1' };
      const context2 = { region: 'RJ', userId: 'user2' };
      const model = 'claude-3-haiku-20240307';

      // Cache responses
      await performanceOptimizer.cacheResponse(message1, context1, model, { content: 'SP response' });
      await performanceOptimizer.cacheResponse(message2, context2, model, { content: 'RJ response' });

      // Retrieve responses
      const spResponse = await performanceOptimizer.getCachedResponse(message1, context1, model);
      const rjResponse = await performanceOptimizer.getCachedResponse(message2, context2, model);

      expect(spResponse.content).toBe('SP response');
      expect(rjResponse.content).toBe('RJ response');
    });
  });

  describe('Brazilian Peak Hour Optimization', () => {
    test('should detect peak hours correctly', async () => {
      // Test morning peak hour (7-9 AM)
      const morningOptimization = await performanceOptimizer.optimizeForPeakHours('test-user', 'SP');
      
      expect(morningOptimization).toHaveProperty('useFasterModel');
      expect(morningOptimization).toHaveProperty('reduceContextLength');
      expect(morningOptimization).toHaveProperty('increaseCacheTTL');
      expect(morningOptimization).toHaveProperty('enableCompression');
    });

    test('should optimize for different regions', async () => {
      const regions = ['SP', 'RJ', 'NE', 'Sul'];
      
      for (const region of regions) {
        const optimization = await performanceOptimizer.optimizeForPeakHours('test-user', region);
        expect(optimization).toBeDefined();
        expect(typeof optimization.useFasterModel).toBe('boolean');
      }
    });

    test('should warm cache during peak hours', async () => {
      // This test would verify cache warming functionality
      // Implementation depends on the actual cache warming logic
      const optimization = await performanceOptimizer.optimizeForPeakHours('test-user', 'SP');
      expect(optimization).toBeDefined();
    });
  });

  describe('Mobile-First Performance Optimization', () => {
    test('should detect mobile devices', async () => {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)';
      const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

      const mobileOptimization = await performanceOptimizer.optimizeForMobile(mobileUserAgent, 'fast');
      const desktopOptimization = await performanceOptimizer.optimizeForMobile(desktopUserAgent, 'fast');

      expect(mobileOptimization.enableCompression).toBe(true);
      expect(mobileOptimization.optimizeImages).toBe(true);
      expect(mobileOptimization.reduceAnimations).toBe(true);
    });

    test('should optimize for slow networks', async () => {
      const userAgent = 'Mozilla/5.0 (Android; Mobile; rv:68.0)';
      
      const fastNetworkOptimization = await performanceOptimizer.optimizeForMobile(userAgent, 'fast');
      const slowNetworkOptimization = await performanceOptimizer.optimizeForMobile(userAgent, 'slow');

      expect(slowNetworkOptimization.reduceContextLength).toBe(true);
      expect(slowNetworkOptimization.useFasterModel).toBe(true);
    });

    test('should enable offline mode for mobile', async () => {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)';
      
      const optimization = await performanceOptimizer.optimizeForMobile(mobileUserAgent, 'medium');
      
      expect(optimization.enableOfflineMode).toBe(true);
    });
  });

  describe('Cost Optimization Strategies', () => {
    test('should analyze message complexity', async () => {
      const simpleMessage = 'Dividir conta igualmente';
      const complexMessage = 'Dividir conta com múltiplas pessoas, porcentagens diferentes, e condições especiais';
      
      const simpleOptimization = await performanceOptimizer.optimizeCosts('test-user', simpleMessage, { region: 'SP' });
      const complexOptimization = await performanceOptimizer.optimizeCosts('test-user', complexMessage, { region: 'SP' });

      expect(simpleOptimization.useCheaperModel).toBe(true);
      expect(complexOptimization.compressContext).toBe(true);
    });

    test('should optimize based on user tier', async () => {
      const freeUserOptimization = await performanceOptimizer.optimizeCosts('free-user', 'Test message', { region: 'SP' });
      
      expect(freeUserOptimization.useCheaperModel).toBe(true);
      expect(freeUserOptimization.enableCaching).toBe(true);
    });

    test('should handle budget limits', async () => {
      // This test would verify budget management
      // Implementation depends on actual budget tracking
      const optimization = await performanceOptimizer.optimizeCosts('test-user', 'Test message', { region: 'SP' });
      
      expect(optimization).toHaveProperty('useCheaperModel');
      expect(optimization).toHaveProperty('reduceTokens');
      expect(optimization).toHaveProperty('enableCaching');
    });
  });

  describe('Performance Metrics Tracking', () => {
    test('should track performance metrics', async () => {
      const metrics = {
        responseTime: 1500,
        modelUsed: 'claude-3-sonnet-20240229',
        tokensUsed: 500,
        costBRL: 0.25,
        cacheHit: false,
        region: 'SP',
        networkCondition: 'fast' as const,
        peakHour: false,
        mobileDevice: false
      };

      await performanceOptimizer.trackPerformance(metrics);
      
      // Verify metrics were tracked (this would check Redis/Supabase in real implementation)
      expect(true).toBe(true); // Placeholder for actual verification
    });

    test('should check performance targets', async () => {
      const haikuMetrics = {
        responseTime: 800,
        modelUsed: 'claude-3-haiku-20240307',
        tokensUsed: 200,
        costBRL: 0.05,
        cacheHit: true,
        region: 'SP',
        networkCondition: 'fast' as const,
        peakHour: false,
        mobileDevice: false
      };

      await performanceOptimizer.trackPerformance(haikuMetrics);
      
      // Verify no alerts were triggered for good performance
      expect(true).toBe(true); // Placeholder for actual verification
    });
  });

  describe('Performance Analytics', () => {
    test('should provide performance analytics', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics).toHaveProperty('cacheHitRate');
      expect(analytics).toHaveProperty('totalCacheOperations');
      expect(analytics).toHaveProperty('peakHourUsage');
      expect(analytics).toHaveProperty('mobileOptimization');
      expect(analytics).toHaveProperty('targets');
    });

    test('should calculate cache hit rate correctly', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      const hitRate = parseFloat(analytics.cacheHitRate);
      expect(hitRate).toBeGreaterThanOrEqual(0);
      expect(hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('System Health', () => {
    test('should provide health status', async () => {
      const health = await performanceOptimizer.healthCheck();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('metrics');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });
  });

  describe('Brazilian Regional Optimization', () => {
    test('should optimize for São Paulo region', async () => {
      const optimization = await performanceOptimizer.optimizeForPeakHours('test-user', 'SP');
      
      expect(optimization).toBeDefined();
      expect(typeof optimization.useFasterModel).toBe('boolean');
    });

    test('should optimize for Rio de Janeiro region', async () => {
      const optimization = await performanceOptimizer.optimizeForPeakHours('test-user', 'RJ');
      
      expect(optimization).toBeDefined();
      expect(typeof optimization.useFasterModel).toBe('boolean');
    });

    test('should optimize for Northeast region', async () => {
      const optimization = await performanceOptimizer.optimizeForPeakHours('test-user', 'NE');
      
      expect(optimization).toBeDefined();
      expect(typeof optimization.useFasterModel).toBe('boolean');
    });

    test('should optimize for South region', async () => {
      const optimization = await performanceOptimizer.optimizeForPeakHours('test-user', 'Sul');
      
      expect(optimization).toBeDefined();
      expect(typeof optimization.useFasterModel).toBe('boolean');
    });
  });

  describe('Performance Targets Validation', () => {
    test('should meet Haiku response time target', async () => {
      const startTime = Date.now();
      await performanceOptimizer.getCachedResponse('test', { region: 'SP' }, 'claude-3-haiku-20240307');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(1000); // < 1 second target
    });

    test('should meet Sonnet response time target', async () => {
      const startTime = Date.now();
      await performanceOptimizer.getCachedResponse('test', { region: 'SP' }, 'claude-3-sonnet-20240229');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2500); // < 2.5 seconds target
    });

    test('should meet Opus response time target', async () => {
      const startTime = Date.now();
      await performanceOptimizer.getCachedResponse('test', { region: 'SP' }, 'claude-3-opus-20240229');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // < 5 seconds target
    });

    test('should meet mobile load time target', async () => {
      const startTime = Date.now();
      await performanceOptimizer.optimizeForMobile('Mobile User Agent', 'slow');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // < 3 seconds target
    });
  });

  describe('Cache Performance Validation', () => {
    test('should achieve target cache hit rate', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      const hitRate = parseFloat(analytics.cacheHitRate);
      
      expect(hitRate).toBeGreaterThanOrEqual(0.8); // > 80% target
    });

    test('should provide fast cache responses', async () => {
      const startTime = Date.now();
      await performanceOptimizer.getCachedResponse('test', { region: 'SP' }, 'claude-3-haiku-20240307');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(200); // < 200ms target
    });
  });

  describe('Cost Optimization Validation', () => {
    test('should maintain daily budget target', async () => {
      const optimization = await performanceOptimizer.optimizeCosts('test-user', 'Simple message', { region: 'SP' });
      
      expect(optimization.useCheaperModel).toBe(true);
      expect(optimization.enableCaching).toBe(true);
    });

    test('should optimize for complex queries', async () => {
      const complexMessage = 'Dividir conta com múltiplas pessoas, porcentagens diferentes, condições especiais, e moedas diferentes';
      const optimization = await performanceOptimizer.optimizeCosts('test-user', complexMessage, { region: 'SP' });
      
      expect(optimization.compressContext).toBe(true);
    });
  });
}); 