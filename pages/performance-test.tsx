import React, { useState, useEffect } from 'react';
import PerformanceDashboard from '../components/PerformanceDashboard';
import { performanceOptimizer } from '../lib/performance-optimizer';

interface TestResult {
  testName: string;
  result: any;
  duration: number;
  success: boolean;
}

export default function PerformanceTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const runPerformanceTests = async () => {
    setLoading(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Cache Performance
      console.log('Running cache performance test...');
      const cacheStart = Date.now();
      const cacheResult = await performanceOptimizer.getCachedResponse(
        'Dividir conta do rodízio',
        { region: 'SP', userId: 'test-user' },
        'claude-3-haiku-20240307'
      );
      const cacheDuration = Date.now() - cacheStart;
      results.push({
        testName: 'Cache Performance',
        result: cacheResult ? 'Cache hit' : 'Cache miss',
        duration: cacheDuration,
        success: cacheDuration < 100
      });

      // Test 2: Peak Hour Optimization
      console.log('Running peak hour optimization test...');
      const peakStart = Date.now();
      const peakResult = await performanceOptimizer.optimizeForPeakHours('test-user', 'SP');
      const peakDuration = Date.now() - peakStart;
      results.push({
        testName: 'Peak Hour Optimization',
        result: peakResult,
        duration: peakDuration,
        success: peakDuration < 200
      });

      // Test 3: Mobile Optimization
      console.log('Running mobile optimization test...');
      const mobileStart = Date.now();
      const mobileResult = await performanceOptimizer.optimizeForMobile(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        'slow'
      );
      const mobileDuration = Date.now() - mobileStart;
      results.push({
        testName: 'Mobile Optimization',
        result: mobileResult,
        duration: mobileDuration,
        success: mobileDuration < 200
      });

      // Test 4: Cost Optimization
      console.log('Running cost optimization test...');
      const costStart = Date.now();
      const costResult = await performanceOptimizer.optimizeCosts(
        'test-user',
        'Dividir conta complexa com múltiplas pessoas e porcentagens diferentes',
        { region: 'SP', userId: 'test-user' }
      );
      const costDuration = Date.now() - costStart;
      results.push({
        testName: 'Cost Optimization',
        result: costResult,
        duration: costDuration,
        success: costDuration < 200
      });

      // Test 5: Health Check
      console.log('Running health check test...');
      const healthStart = Date.now();
      const healthResult = await performanceOptimizer.healthCheck();
      const healthDuration = Date.now() - healthStart;
      results.push({
        testName: 'System Health',
        result: healthResult,
        duration: healthDuration,
        success: healthResult.status === 'healthy'
      });

      // Test 6: Performance Analytics
      console.log('Running analytics test...');
      const analyticsStart = Date.now();
      const analyticsResult = await performanceOptimizer.getPerformanceAnalytics();
      const analyticsDuration = Date.now() - analyticsStart;
      results.push({
        testName: 'Performance Analytics',
        result: analyticsResult,
        duration: analyticsDuration,
        success: analyticsDuration < 500
      });

    } catch (error) {
      console.error('Performance test error:', error);
      results.push({
        testName: 'Error',
        result: error,
        duration: 0,
        success: false
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const testCacheResponse = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      // Simulate API call with caching
      const startTime = Date.now();
      
      // First call - should miss cache
      const firstResponse = await performanceOptimizer.getCachedResponse(
        message,
        { region: 'SP', userId: 'test-user' },
        'claude-3-haiku-20240307'
      );

      // Cache the response
      if (!firstResponse) {
        await performanceOptimizer.cacheResponse(
          message,
          { region: 'SP', userId: 'test-user' },
          'claude-3-haiku-20240307',
          { content: `Cached response for: ${message}`, tokensUsed: 100 }
        );
      }

      // Second call - should hit cache
      const secondResponse = await performanceOptimizer.getCachedResponse(
        message,
        { region: 'SP', userId: 'test-user' },
        'claude-3-haiku-20240307'
      );

      const duration = Date.now() - startTime;
      
      setResponse(`Cache test completed in ${duration}ms. First call: ${firstResponse ? 'HIT' : 'MISS'}, Second call: ${secondResponse ? 'HIT' : 'MISS'}`);
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Story 10: Performance Optimization & Caching Test
          </h1>
          <p className="text-gray-600">
            Testing comprehensive performance optimization including Claude API caching, 
            Brazilian peak hour optimization, mobile-first performance, and cost optimization strategies.
          </p>
        </div>

        {/* Performance Dashboard */}
        <div className="mb-8">
          <PerformanceDashboard />
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Tests</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runPerformanceTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {/* Cache Test */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cache Test</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to test caching..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={testCacheResponse}
                disabled={loading || !message.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Cache
              </button>
            </div>
            {response && (
              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">{response}</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{result.testName}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="text-sm text-gray-500">{result.duration}ms</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Features Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Intelligent Caching</h3>
              <p className="text-sm text-blue-700">
                Multi-layer caching with adaptive TTL based on model complexity and Brazilian peak hours.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Peak Hour Optimization</h3>
              <p className="text-sm text-green-700">
                Automatic optimization during Brazilian peak hours (7-9 AM, 12-2 PM, 6-9 PM, weekends).
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Mobile Optimization</h3>
              <p className="text-sm text-purple-700">
                Mobile-first performance with compression, reduced context, and faster models for slow networks.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Cost Optimization</h3>
              <p className="text-sm text-yellow-700">
                Intelligent model selection and token reduction to maintain quality while optimizing costs.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Targets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Response Times</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Haiku: &lt; 1 second</li>
                <li>• Sonnet: &lt; 2.5 seconds</li>
                <li>• Opus: &lt; 5 seconds</li>
                <li>• Mobile: &lt; 3 seconds</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cache Performance</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Hit Rate: &gt; 80%</li>
                <li>• Cache Response: &lt; 200ms</li>
                <li>• Adaptive TTL: 30min - 4h</li>
                <li>• Regional Optimization</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cost Targets</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Daily Budget: R$ 2.00</li>
                <li>• Monthly Budget: R$ 50.00</li>
                <li>• Model Distribution: 70/25/5</li>
                <li>• Cost per Interaction: &lt; R$ 0.80</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 