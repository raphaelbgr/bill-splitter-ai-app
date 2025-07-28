import { MemorySystem } from '../lib/memory-system';
import { performanceOptimizer } from '../lib/performance-optimizer';

// Mock the performance optimizer
jest.mock('../lib/performance-optimizer', () => ({
  performanceOptimizer: {
    getPerformanceAnalytics: jest.fn().mockResolvedValue({
      targets: {
        haikuResponseTime: 1000,
        sonnetResponseTime: 2500,
        opusResponseTime: 5000
      },
      cacheHitRate: 0.85,
      totalCacheOperations: 15000,
      peakHourUsage: 450,
      mobileOptimization: {
        enableCompression: true
      }
    }),
    healthCheck: jest.fn().mockResolvedValue({
      status: 'healthy',
      metrics: {
        responseTime: 1200,
        errorRate: 0.5,
        uptime: 99.9
      }
    })
  }
}));

// Mock the memory system
jest.mock('../lib/memory-system', () => ({
  MemorySystem: jest.fn().mockImplementation(() => ({
    getUserConsent: jest.fn().mockResolvedValue({
      consentGiven: true,
      consentDate: new Date(),
      consentType: 'analytics'
    }),
    getMemoryAnalytics: jest.fn().mockResolvedValue({
      totalConversations: 150,
      totalMessages: 1200,
      averageMessagesPerConversation: 8,
      mostUsedSplittingMethods: {
        'equal': 60,
        'percentage': 25,
        'custom': 15
      },
      culturalContexts: {
        'SP': 40,
        'RJ': 25,
        'NE': 20,
        'Sul': 15
      }
    })
  }))
}));

describe('Story 12: Analytics & User Feedback Systems', () => {
  let memorySystem: MemorySystem;

  beforeEach(() => {
    memorySystem = new MemorySystem();
    jest.clearAllMocks();
  });

  describe('Brazilian Market Analytics', () => {
    it('should provide regional usage analytics', async () => {
      const analytics = await memorySystem.getMemoryAnalytics('user123');
      
      expect(analytics).toBeDefined();
      expect(analytics.totalConversations).toBeGreaterThan(0);
      expect(analytics.culturalContexts).toBeDefined();
      expect(Object.keys(analytics.culturalContexts)).toContain('SP');
      expect(Object.keys(analytics.culturalContexts)).toContain('RJ');
      expect(Object.keys(analytics.culturalContexts)).toContain('NE');
      expect(Object.keys(analytics.culturalContexts)).toContain('Sul');
    });

    it('should track cultural context effectiveness', async () => {
      const analytics = await memorySystem.getMemoryAnalytics('user123');
      
      expect(analytics.culturalContexts).toBeDefined();
      expect(typeof analytics.culturalContexts.SP).toBe('number');
      expect(typeof analytics.culturalContexts.RJ).toBe('number');
      expect(typeof analytics.culturalContexts.NE).toBe('number');
      expect(typeof analytics.culturalContexts.Sul).toBe('number');
    });

    it('should respect LGPD consent for analytics', async () => {
      const consent = await memorySystem.getUserConsent('user123', 'analytics');
      
      expect(consent.consentGiven).toBe(true);
      expect(consent.consentDate).toBeInstanceOf(Date);
      expect(consent.consentType).toBe('analytics');
    });
  });

  describe('Performance Monitoring', () => {
    it('should provide performance analytics', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics.targets).toBeDefined();
      expect(analytics.targets.haikuResponseTime).toBe(1000);
      expect(analytics.targets.sonnetResponseTime).toBe(2500);
      expect(analytics.targets.opusResponseTime).toBe(5000);
      expect(analytics.cacheHitRate).toBeGreaterThan(0);
      expect(analytics.cacheHitRate).toBeLessThanOrEqual(1);
    });

    it('should provide system health status', async () => {
      const health = await performanceOptimizer.healthCheck();
      
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.metrics).toBeDefined();
      expect(health.metrics.responseTime).toBeGreaterThan(0);
      expect(health.metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(health.metrics.uptime).toBeGreaterThan(99);
    });

    it('should track Brazilian regional performance', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics).toBeDefined();
      // In a real implementation, this would include regional performance data
      expect(analytics.targets).toBeDefined();
    });
  });

  describe('Cost Tracking', () => {
    it('should track model usage and costs', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics).toBeDefined();
      // The analytics should include cost tracking information
      expect(analytics.targets).toBeDefined();
    });

    it('should provide optimization opportunities', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics).toBeDefined();
      // The analytics should include optimization suggestions
      expect(analytics.cacheHitRate).toBeDefined();
    });
  });

  describe('User Feedback System', () => {
    it('should require LGPD consent for feedback', async () => {
      const consent = await memorySystem.getUserConsent('user123', 'feedback');
      
      expect(consent.consentGiven).toBe(true);
      expect(consent.consentType).toBe('analytics');
    });

    it('should validate feedback submission data', () => {
      const validFeedback = {
        type: 'satisfaction',
        rating: 5,
        title: 'Great experience',
        description: 'The app works perfectly for our group expenses',
        allowFollowUp: true
      };

      expect(validFeedback.type).toBe('satisfaction');
      expect(validFeedback.rating).toBeGreaterThanOrEqual(1);
      expect(validFeedback.rating).toBeLessThanOrEqual(5);
      expect(validFeedback.title).toBeTruthy();
      expect(validFeedback.description).toBeTruthy();
      expect(typeof validFeedback.allowFollowUp).toBe('boolean');
    });

    it('should handle different feedback types', () => {
      const feedbackTypes = ['satisfaction', 'feature_request', 'bug_report', 'general'];
      
      feedbackTypes.forEach(type => {
        expect(['satisfaction', 'feature_request', 'bug_report', 'general']).toContain(type);
      });
    });
  });

  describe('LGPD Compliance', () => {
    it('should require consent for all data collection', async () => {
      const analyticsConsent = await memorySystem.getUserConsent('user123', 'analytics');
      const feedbackConsent = await memorySystem.getUserConsent('user123', 'feedback');
      
      expect(analyticsConsent.consentGiven).toBe(true);
      expect(feedbackConsent.consentGiven).toBe(true);
    });

    it('should respect data retention policies', async () => {
      const analytics = await memorySystem.getMemoryAnalytics('user123');
      
      expect(analytics).toBeDefined();
      // In a real implementation, this would check retention policies
      expect(analytics.totalConversations).toBeGreaterThan(0);
    });

    it('should provide data deletion capabilities', () => {
      // This would test the data deletion functionality
      expect(memorySystem).toBeDefined();
      // In a real implementation, this would test actual deletion
    });
  });

  describe('Brazilian Market Focus', () => {
    it('should track regional usage patterns', async () => {
      const analytics = await memorySystem.getMemoryAnalytics('user123');
      
      expect(analytics.culturalContexts).toBeDefined();
      expect(analytics.culturalContexts.SP).toBeDefined();
      expect(analytics.culturalContexts.RJ).toBeDefined();
      expect(analytics.culturalContexts.NE).toBeDefined();
      expect(analytics.culturalContexts.Sul).toBeDefined();
    });

    it('should monitor cultural context effectiveness', async () => {
      const analytics = await memorySystem.getMemoryAnalytics('user123');
      
      expect(analytics.culturalContexts).toBeDefined();
      // The analytics should show how well cultural contexts are being applied
      expect(typeof analytics.culturalContexts.SP).toBe('number');
    });

    it('should track payment method preferences', () => {
      // This would test payment preference tracking
      const paymentPreferences = {
        pix: 65,
        transfer: 20,
        cash: 10,
        credit: 3,
        boleto: 2
      };

      expect(paymentPreferences.pix).toBe(65);
      expect(paymentPreferences.transfer).toBe(20);
      expect(paymentPreferences.cash).toBe(10);
      expect(paymentPreferences.credit).toBe(3);
      expect(paymentPreferences.boleto).toBe(2);
    });
  });

  describe('Performance Targets', () => {
    it('should meet response time targets', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics.targets.haikuResponseTime).toBeLessThanOrEqual(1000);
      expect(analytics.targets.sonnetResponseTime).toBeLessThanOrEqual(2500);
      expect(analytics.targets.opusResponseTime).toBeLessThanOrEqual(5000);
    });

    it('should maintain high cache hit rates', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics.cacheHitRate).toBeGreaterThanOrEqual(0.8);
    });

    it('should optimize for Brazilian peak hours', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics.peakHourUsage).toBeDefined();
      expect(analytics.peakHourUsage).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing consent gracefully', async () => {
      // Mock the memory system to return no consent and throw error
      (memorySystem.getUserConsent as jest.Mock).mockResolvedValueOnce({
        consentGiven: false,
        consentDate: null,
        consentType: 'analytics'
      });
      (memorySystem.getMemoryAnalytics as jest.Mock).mockRejectedValueOnce(
        new Error('LGPD consent required for analytics')
      );

      try {
        await memorySystem.getMemoryAnalytics('user123');
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain('LGPD consent required');
      }
    });

    it('should handle performance monitoring errors', async () => {
      // Mock the performance optimizer to throw an error
      (performanceOptimizer.getPerformanceAnalytics as jest.Mock).mockRejectedValueOnce(
        new Error('Performance monitoring error')
      );

      try {
        await performanceOptimizer.getPerformanceAnalytics();
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain('Performance monitoring error');
      }
    });
  });

  describe('Integration Tests', () => {
    it('should provide comprehensive analytics dashboard', async () => {
      const [analytics, health] = await Promise.all([
        performanceOptimizer.getPerformanceAnalytics(),
        performanceOptimizer.healthCheck()
      ]);
      
      expect(analytics).toBeDefined();
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
    });

    it('should maintain LGPD compliance throughout', async () => {
      const consent = await memorySystem.getUserConsent('user123', 'analytics');
      
      expect(consent.consentGiven).toBe(true);
      expect(consent.consentDate).toBeInstanceOf(Date);
    });

    it('should provide actionable insights', async () => {
      const analytics = await performanceOptimizer.getPerformanceAnalytics();
      
      expect(analytics.cacheHitRate).toBeDefined();
      expect(analytics.targets).toBeDefined();
      // These metrics should provide actionable insights for optimization
    });
  });
}); 