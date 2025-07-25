import React, { useState } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserFeedbackSystem from '../components/UserFeedbackSystem';
import PerformanceDashboard from '../components/PerformanceDashboard';

export default function AnalyticsTest() {
  const [activeComponent, setActiveComponent] = useState<'analytics' | 'feedback' | 'performance'>('analytics');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Story 12: Analytics & User Feedback Systems
          </h1>
          <p className="text-gray-600">
            Comprehensive Brazilian market analytics, user feedback collection, performance monitoring, and cost tracking dashboards with LGPD compliance.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {[
              { id: 'analytics', label: 'Analytics Dashboard', icon: '📊' },
              { id: 'feedback', label: 'User Feedback System', icon: '💬' },
              { id: 'performance', label: 'Performance Dashboard', icon: '⚡' }
            ].map((component) => (
              <button
                key={component.id}
                onClick={() => setActiveComponent(component.id as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeComponent === component.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <span className="mr-2">{component.icon}</span>
                {component.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Component Display */}
        <div className="space-y-8">
          {activeComponent === 'analytics' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Analytics Dashboard
              </h2>
              <AnalyticsDashboard />
            </div>
          )}

          {activeComponent === 'feedback' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                User Feedback System
              </h2>
              <UserFeedbackSystem />
            </div>
          )}

          {activeComponent === 'performance' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Performance Dashboard
              </h2>
              <PerformanceDashboard />
            </div>
          )}
        </div>

        {/* Story Information */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Story 12 Implementation Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Completed Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Brazilian market analytics dashboard</li>
                <li>• User feedback collection system</li>
                <li>• Performance monitoring for Brazilian regions</li>
                <li>• Cost tracking and optimization dashboards</li>
                <li>• LGPD-compliant analytics</li>
                <li>• User-friendly feedback system</li>
                <li>• Performance insights generation</li>
                <li>• Cost optimization insights</li>
                <li>• LGPD-compliant data collection</li>
                <li>• Comprehensive analytics dashboard</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎯 Brazilian Market Focus</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Regional usage patterns (SP, RJ, NE, Sul)</li>
                <li>• Cultural context effectiveness tracking</li>
                <li>• Payment method preferences (PIX, transfer, etc.)</li>
                <li>• Social dynamics analysis</li>
                <li>• Regional performance metrics</li>
                <li>• Peak hour optimization</li>
                <li>• Mobile performance tracking</li>
                <li>• Brazilian cultural insights</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">🔒 LGPD Compliance</h4>
            <p className="text-sm text-gray-600 mb-3">
              All analytics and feedback systems respect Brazilian privacy requirements:
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• User consent required for all data collection</li>
              <li>• Data retention policies enforced</li>
              <li>• Right to data deletion implemented</li>
              <li>• Transparent data processing practices</li>
              <li>• Regional data storage compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 