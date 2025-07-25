import React, { useState, useEffect } from 'react';
import { performanceOptimizer } from '../lib/performance-optimizer';

interface PerformanceData {
  cacheHitRate: string;
  totalCacheOperations: number;
  peakHourUsage: number;
  mobileOptimization: any;
  targets: any;
}

interface PerformanceMetrics {
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

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>('checking');
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const [analytics, health] = await Promise.all([
        performanceOptimizer.getPerformanceAnalytics(),
        performanceOptimizer.healthCheck()
      ]);
      
      setPerformanceData(analytics);
      setHealthStatus(health.status);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCacheHitRateColor = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 0.8) return 'text-green-600';
    if (rateNum >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Performance Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStatusColor(healthStatus)}`}>
            {healthStatus.toUpperCase()}
          </span>
          <div className={`w-2 h-2 rounded-full ${
            healthStatus === 'healthy' ? 'bg-green-500' :
            healthStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </div>
      </div>

      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cache Hit Rate */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Cache Hit Rate</p>
                <p className={`text-2xl font-bold ${getCacheHitRateColor(performanceData.cacheHitRate)}`}>
                  {(parseFloat(performanceData.cacheHitRate) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Target: {(performanceData.targets.cacheHitRate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Total Cache Operations */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Cache Operations</p>
                <p className="text-2xl font-bold text-green-700">
                  {performanceData.totalCacheOperations.toLocaleString()}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              Total operations today
            </p>
          </div>

          {/* Peak Hour Usage */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Peak Hour Usage</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {performanceData.peakHourUsage}
                </p>
              </div>
              <div className="text-yellow-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              São Paulo region
            </p>
          </div>

          {/* Mobile Optimization */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Mobile Optimization</p>
                <p className="text-2xl font-bold text-purple-700">
                  {performanceData.mobileOptimization.enableCompression ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Compression enabled
            </p>
          </div>
        </div>
      )}

      {/* Performance Targets */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Haiku Response Time</span>
              <span className="text-sm font-bold text-gray-900">
                &lt; {performanceData?.targets.haikuResponseTime}ms
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Sonnet Response Time</span>
              <span className="text-sm font-bold text-gray-900">
                &lt; {performanceData?.targets.sonnetResponseTime}ms
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Opus Response Time</span>
              <span className="text-sm font-bold text-gray-900">
                &lt; {performanceData?.targets.opusResponseTime}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Brazilian Regional Optimization */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brazilian Regional Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['SP', 'RJ', 'NE', 'Sul'].map((region) => (
            <div key={region} className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">{region}</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-blue-600">Optimized</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Peak hour detection active
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadPerformanceData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
} 