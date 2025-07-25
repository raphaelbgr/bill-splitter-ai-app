import React, { useState, useEffect } from 'react';
import { MemorySystem } from '../lib/memory-system';
import { BrazilianPaymentSystem } from '../lib/payment-system';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  divisionsLimit: number;
  analyticsLevel: 'basic' | 'advanced' | 'premium';
  teamFeatures: boolean;
  prioritySupport: boolean;
}

interface UserSubscription {
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate: string;
}

interface UsageStats {
  currentDivisions: number;
  monthlyLimit: number;
  analyticsUsage: number;
  teamMembers: number;
  storageUsed: number;
  storageLimit: number;
}

interface PaymentMethod {
  id: string;
  type: 'pix' | 'credit_card' | 'bank_transfer' | 'boleto';
  name: string;
  lastFour?: string;
  isDefault: boolean;
  isActive: boolean;
}

export default function PremiumFeatures() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscription' | 'payment' | 'usage'>('plans');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  useEffect(() => {
    checkLGPDConsent();
  }, []);

  useEffect(() => {
    if (lgpdConsent) {
      loadPremiumData();
    }
  }, [lgpdConsent]);

  const checkLGPDConsent = async () => {
    try {
      const memorySystem = new MemorySystem();
      const consent = await memorySystem.getUserConsent('user123', 'premium');
      setLgpdConsent(consent.consentGiven);
    } catch (error) {
      console.error('Error checking LGPD consent:', error);
      setLgpdConsent(false);
    }
  };

  const loadPremiumData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subscription plans
      const plansResponse = await fetch('/api/premium/plans?userId=user123');
      const plansData = await plansResponse.json();
      if (plansData.success) {
        setSubscriptionPlans(plansData.data);
      }

      // Load user subscription
      const subscriptionResponse = await fetch('/api/premium/subscription?userId=user123');
      const subscriptionData = await subscriptionResponse.json();
      if (subscriptionData.success) {
        setUserSubscription(subscriptionData.data);
      }

      // Load usage stats
      const usageResponse = await fetch('/api/premium/usage?userId=user123');
      const usageData = await usageResponse.json();
      if (usageData.success) {
        setUsageStats(usageData.data);
      }

      // Load payment methods
      const paymentResponse = await fetch('/api/premium/payment-methods?userId=user123');
      const paymentData = await paymentResponse.json();
      if (paymentData.success) {
        setPaymentMethods(paymentData.data);
      }
    } catch (error) {
      console.error('Error loading premium data:', error);
      setError('Failed to load premium features data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/premium/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          planId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadPremiumData(); // Refresh data
        alert('Subscription updated successfully!');
      } else {
        setError(data.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/premium/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadPremiumData(); // Refresh data
        alert('Subscription cancelled successfully');
      } else {
        setError(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!lgpdConsent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Features</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              LGPD consent is required to access premium features and payment processing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading premium features...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Features</h2>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Premium Features & Monetization</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your subscription, payment methods, and premium features
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'plans', label: 'Subscription Plans' },
            { id: 'subscription', label: 'My Subscription' },
            { id: 'payment', label: 'Payment Methods' },
            { id: 'usage', label: 'Usage & Limits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'plans' && (
          <SubscriptionPlansTab
            plans={subscriptionPlans}
            currentSubscription={userSubscription}
            onSubscribe={handleSubscribe}
          />
        )}
        {activeTab === 'subscription' && (
          <SubscriptionTab
            subscription={userSubscription}
            onCancel={handleCancelSubscription}
          />
        )}
        {activeTab === 'payment' && (
          <PaymentMethodsTab
            paymentMethods={paymentMethods}
            onUpdate={loadPremiumData}
          />
        )}
        {activeTab === 'usage' && (
          <UsageTab usageStats={usageStats} />
        )}
      </div>
    </div>
  );
}

// Subscription Plans Tab
function SubscriptionPlansTab({ 
  plans, 
  currentSubscription, 
  onSubscribe 
}: { 
  plans: SubscriptionPlan[]; 
  currentSubscription: UserSubscription | null; 
  onSubscribe: (planId: string) => void; 
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Your Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 ${
              currentSubscription?.planId === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  R$ {plan.price}
                </span>
                <span className="text-gray-600">/{plan.currency === 'BRL' ? 'month' : 'month'}</span>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button
                onClick={() => onSubscribe(plan.id)}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  currentSubscription?.planId === plan.id
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={currentSubscription?.planId === plan.id}
              >
                {currentSubscription?.planId === plan.id ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subscription Tab
function SubscriptionTab({ 
  subscription, 
  onCancel 
}: { 
  subscription: UserSubscription | null; 
  onCancel: () => void; 
}) {
  if (!subscription) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
        <p className="text-gray-600">You are currently on the free plan.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">My Subscription</h3>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900">Subscription Details</h4>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Status</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{subscription.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Start Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">End Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Next Billing</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Payment Information</h4>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Payment Method</dt>
                <dd className="text-sm font-medium text-gray-900">{subscription.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Auto Renew</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {subscription.autoRenew ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Methods Tab
function PaymentMethodsTab({ 
  paymentMethods, 
  onUpdate 
}: { 
  paymentMethods: PaymentMethod[]; 
  onUpdate: () => void; 
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPaymentMethod = async (formData: any) => {
    try {
      const response = await fetch('/api/premium/add-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium text-gray-900">{method.name}</h4>
              <p className="text-sm text-gray-600">
                {method.type === 'credit_card' && method.lastFour
                  ? `•••• ${method.lastFour}`
                  : method.type}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {method.isDefault && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Default
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                method.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {method.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddPaymentMethod({
                type: formData.get('type'),
                name: formData.get('name'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                  <select
                    name="type"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select payment type</option>
                    <option value="pix">PIX</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Add Method
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Usage Tab
function UsageTab({ usageStats }: { usageStats: UsageStats | null }) {
  if (!usageStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No usage data available.</p>
      </div>
    );
  }

  const usagePercentage = (usageStats.currentDivisions / usageStats.monthlyLimit) * 100;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Usage & Limits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Divisions Usage</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Usage</span>
                <span className="font-medium text-gray-900">
                  {usageStats.currentDivisions} / {usageStats.monthlyLimit}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {usagePercentage >= 90 && (
                <p className="text-yellow-600">
                  ⚠️ You're approaching your monthly limit
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Analytics Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Analytics Queries</span>
              <span className="font-medium text-gray-900">{usageStats.analyticsUsage}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Team Members</span>
              <span className="font-medium text-gray-900">{usageStats.teamMembers}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Storage Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Storage Used</span>
              <span className="font-medium text-gray-900">
                {usageStats.storageUsed}MB / {usageStats.storageLimit}MB
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(usageStats.storageUsed / usageStats.storageLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 