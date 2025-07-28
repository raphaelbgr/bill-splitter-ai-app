import React, { useState } from 'react';
import PremiumFeatures from '../components/PremiumFeatures';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard';
import PerformanceDashboard from '../components/PerformanceDashboard';

export default function PremiumTest() {
  const [activeComponent, setActiveComponent] = useState<'premium' | 'analytics' | 'advanced' | 'performance'>('premium');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Story 14: Premium Features & Monetization
          </h1>
          <p className="text-lg text-gray-600">
            Freemium model with Brazilian payment processing and premium features
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {[
              { id: 'premium', label: 'Premium Features', component: PremiumFeatures },
              { id: 'analytics', label: 'Basic Analytics', component: AnalyticsDashboard },
              { id: 'advanced', label: 'Advanced Analytics', component: AdvancedAnalyticsDashboard },
              { id: 'performance', label: 'Performance', component: PerformanceDashboard },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveComponent(item.id as any)}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeComponent === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Component Display */}
        <div className="mb-8">
          {activeComponent === 'premium' && <PremiumFeatures />}
          {activeComponent === 'analytics' && <AnalyticsDashboard />}
          {activeComponent === 'advanced' && <AdvancedAnalyticsDashboard />}
          {activeComponent === 'performance' && <PerformanceDashboard />}
        </div>

        {/* Story Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Story 14: Premium Features & Monetization - Implementation Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">✅ Completed Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Freemium Model:</strong> 10 divisions/month free tier with usage limits</li>
                <li>• <strong>Premium Plans:</strong> Unlimited divisions, advanced analytics, team features</li>
                <li>• <strong>Brazilian Payment Processing:</strong> PIX, credit cards, bank transfers, boleto</li>
                <li>• <strong>Subscription Management:</strong> Plan changes, cancellation, auto-renewal</li>
                <li>• <strong>Payment Methods:</strong> Add, manage, and set default payment methods</li>
                <li>• <strong>Usage Tracking:</strong> Monitor divisions, analytics, storage, team members</li>
                <li>• <strong>LGPD Compliance:</strong> Consent checks for all premium features</li>
                <li>• <strong>Revenue Tracking:</strong> Payment processing and subscription analytics</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">🇧🇷 Brazilian Market Focus</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>PIX Integration:</strong> Primary payment method for Brazilian users</li>
                <li>• <strong>Brazilian Banks:</strong> Banco do Brasil, Itaú, Santander, Nubank</li>
                <li>• <strong>Local Pricing:</strong> BRL currency with competitive pricing</li>
                <li>• <strong>Cultural Features:</strong> Team plans for family and business groups</li>
                <li>• <strong>Regional Compliance:</strong> LGPD compliance for payment data</li>
                <li>• <strong>Local Support:</strong> Portuguese language and Brazilian context</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">🔧 Technical Implementation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Frontend Components</h4>
                <ul className="space-y-1">
                  <li>• PremiumFeatures.tsx</li>
                  <li>• Subscription management UI</li>
                  <li>• Payment method forms</li>
                  <li>• Usage tracking dashboard</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">API Endpoints</h4>
                <ul className="space-y-1">
                  <li>• /api/premium/plans</li>
                  <li>• /api/premium/subscription</li>
                  <li>• /api/premium/usage</li>
                  <li>• /api/premium/payment-methods</li>
                  <li>• /api/premium/subscribe</li>
                  <li>• /api/premium/cancel</li>
                  <li>• /api/premium/add-payment-method</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                <ul className="space-y-1">
                  <li>• Freemium usage limits</li>
                  <li>• Brazilian payment methods</li>
                  <li>• LGPD consent management</li>
                  <li>• Subscription analytics</li>
                  <li>• Revenue tracking</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">📊 Business Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Revenue Model</h4>
                <ul className="space-y-1">
                  <li>• <strong>Free Tier:</strong> 10 divisions/month to drive adoption</li>
                  <li>• <strong>Premium:</strong> R$ 19.90/month for unlimited features</li>
                  <li>• <strong>Team:</strong> R$ 49.90/month for business users</li>
                  <li>• <strong>Enterprise:</strong> R$ 199.90/month for large organizations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Market Strategy</h4>
                <ul className="space-y-1">
                  <li>• <strong>Brazilian Focus:</strong> PIX-first payment strategy</li>
                  <li>• <strong>Cultural Fit:</strong> Team features for family and business groups</li>
                  <li>• <strong>Compliance:</strong> Full LGPD compliance for trust</li>
                  <li>• <strong>Localization:</strong> Portuguese language and Brazilian context</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 