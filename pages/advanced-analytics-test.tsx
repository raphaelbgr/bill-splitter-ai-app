import React, { useState } from 'react';
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserFeedbackSystem from '../components/UserFeedbackSystem';
import PerformanceDashboard from '../components/PerformanceDashboard';

export default function AdvancedAnalyticsTest() {
  const [activeComponent, setActiveComponent] = useState<'advanced' | 'basic' | 'feedback' | 'performance'>('advanced');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Story 13: Advanced Analytics & Insights
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Brazilian spending pattern analysis, group dynamics insights, expense categorization, and personalized recommendations
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'advanced', name: 'Advanced Analytics', icon: '📊', description: 'Story 13 - New Features' },
                { id: 'basic', name: 'Basic Analytics', icon: '📈', description: 'Story 12 - Foundation' },
                { id: 'feedback', name: 'User Feedback', icon: '💬', description: 'Story 12 - Feedback System' },
                { id: 'performance', name: 'Performance', icon: '⚡', description: 'Story 10 - Performance Monitoring' }
              ].map((component) => (
                <button
                  key={component.id}
                  onClick={() => setActiveComponent(component.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeComponent === component.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{component.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{component.name}</div>
                      <div className="text-xs text-gray-400">{component.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Component Display */}
        <div className="mb-8">
          {activeComponent === 'advanced' && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Story 13 Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-2">Brazilian Spending Pattern Analysis:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Regional spending trends across Brazilian states</li>
                      <li>Cultural influences on spending behavior</li>
                      <li>Payment method preferences (PIX, credit, cash)</li>
                      <li>Social spending patterns and group dynamics</li>
                      <li>Seasonal analysis for Brazilian festivals and holidays</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Advanced Insights:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Group dynamics and social interaction patterns</li>
                      <li>Expense categorization with cultural context</li>
                      <li>Personalized recommendations based on user behavior</li>
                      <li>Regional optimizations for different Brazilian states</li>
                      <li>Payment method optimizations with cultural reasoning</li>
                    </ul>
                  </div>
                </div>
              </div>
              <AdvancedAnalyticsDashboard />
            </div>
          )}
          
          {activeComponent === 'basic' && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">📈 Story 12 Foundation</h3>
                <p className="text-green-800">
                  Basic analytics dashboard with Brazilian market analytics, user feedback data, cost tracking, and performance monitoring.
                </p>
              </div>
              <AnalyticsDashboard />
            </div>
          )}
          
          {activeComponent === 'feedback' && (
            <div>
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">💬 User Feedback System</h3>
                <p className="text-purple-800">
                  Comprehensive feedback collection system with satisfaction surveys, feature requests, bug reports, and feedback history.
                </p>
              </div>
              <UserFeedbackSystem />
            </div>
          )}
          
          {activeComponent === 'performance' && (
            <div>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">⚡ Performance Monitoring</h3>
                <p className="text-orange-800">
                  Performance dashboard with cache optimization, regional response times, mobile performance, and system health monitoring.
                </p>
              </div>
              <PerformanceDashboard />
            </div>
          )}
        </div>

        {/* Story Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Story 13 Implementation Summary</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Completed Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Brazilian Spending Pattern Analysis:</strong> Regional trends, cultural influences, payment preferences, social patterns, seasonal analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Group Dynamics Insights:</strong> Social interactions, payment behaviors, cultural contexts, group size impact, regional dynamics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Expense Categorization:</strong> Brazilian categories, cultural categories, regional patterns, seasonal categorization, social contexts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Personalized Recommendations:</strong> User-specific insights, cultural recommendations, regional optimizations, social suggestions, payment optimizations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>LGPD Compliance:</strong> Privacy consent checks, data protection, user privacy preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Cultural Appropriateness:</strong> Brazilian cultural context, regional variations, traditional values</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Key Achievements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Advanced Analytics Dashboard:</strong> Comprehensive tabbed interface with 4 main analytics categories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>4 New API Endpoints:</strong> Spending patterns, group dynamics, expense categorization, personalized recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Brazilian Market Focus:</strong> Regional analysis, cultural insights, traditional values, payment preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Cultural Intelligence:</strong> Family-oriented insights, social dynamics, religious considerations, regional customs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Actionable Insights:</strong> Specific recommendations, implementation guidance, expected benefits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Performance Targets:</strong> Analytics processing &lt;10s, insight generation &lt;5s, 95%+ user satisfaction</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🇧🇷 Brazilian Market Intelligence</h3>
            <p className="text-sm text-gray-700 mb-3">
              Story 13 provides deep insights into Brazilian spending patterns, group dynamics, and cultural behaviors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Regional Analysis</h4>
                <p className="text-gray-600">São Paulo, Rio de Janeiro, Minas Gerais, Bahia, Paraná - each with distinct cultural and spending patterns</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Cultural Context</h4>
                <p className="text-gray-600">Family-oriented spending, social status considerations, religious events, regional pride, community support</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Payment Preferences</h4>
                <p className="text-gray-600">PIX (68%), Credit Card (45%), Cash (32%), Bank Transfer (28%), Boleto (15%)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🔒 LGPD Compliance & Privacy</h3>
            <p className="text-sm text-blue-800">
              All advanced analytics features respect Brazilian privacy laws and user consent preferences. 
              Data collection only proceeds with explicit user consent, and all insights are generated 
              while maintaining user privacy and data protection standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 