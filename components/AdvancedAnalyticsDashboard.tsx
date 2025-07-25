import React, { useState, useEffect } from 'react';
import { MemorySystem } from '../lib/memory-system';
import { performanceOptimizer } from '../lib/performance-optimizer';

interface BrazilianSpendingPattern {
  regionalTrends: {
    region: string;
    averageSpending: number;
    paymentPreference: string;
    culturalInfluence: string;
    seasonalPattern: string;
  }[];
  culturalInfluences: {
    factor: string;
    impact: number;
    description: string;
  }[];
  paymentPreferences: {
    method: string;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  socialPatterns: {
    groupSize: number;
    averageContribution: number;
    frequency: string;
    culturalContext: string;
  }[];
  seasonalAnalysis: {
    month: string;
    spending: number;
    category: string;
    reason: string;
  }[];
}

interface GroupDynamicsInsights {
  socialInteractions: {
    interactionType: string;
    frequency: number;
    culturalContext: string;
    impact: string;
  }[];
  paymentBehaviors: {
    behavior: string;
    frequency: number;
    culturalReason: string;
    optimization: string;
  }[];
  culturalContexts: {
    context: string;
    influence: number;
    description: string;
    recommendation: string;
  }[];
  groupSizeImpact: {
    size: number;
    efficiency: number;
    challenges: string[];
    benefits: string[];
  }[];
  regionalDynamics: {
    region: string;
    dynamics: string;
    culturalFactors: string[];
    recommendations: string[];
  }[];
}

interface ExpenseCategorization {
  brazilianCategories: {
    category: string;
    amount: number;
    frequency: number;
    culturalContext: string;
    regionalVariation: string;
  }[];
  culturalCategories: {
    category: string;
    description: string;
    examples: string[];
    culturalSignificance: string;
  }[];
  regionalPatterns: {
    region: string;
    topCategories: string[];
    spendingPatterns: string;
    culturalFactors: string[];
  }[];
  seasonalCategorization: {
    season: string;
    categories: string[];
    reasons: string[];
    culturalEvents: string[];
  }[];
  socialContextCategories: {
    context: string;
    categories: string[];
    culturalSignificance: string;
    recommendations: string[];
  }[];
}

interface PersonalizedRecommendations {
  userSpecificInsights: {
    insight: string;
    confidence: number;
    culturalContext: string;
    actionability: string;
  }[];
  culturalRecommendations: {
    recommendation: string;
    culturalReason: string;
    expectedBenefit: string;
    implementation: string;
  }[];
  regionalOptimizations: {
    region: string;
    optimization: string;
    culturalConsideration: string;
    expectedImpact: string;
  }[];
  socialDynamicSuggestions: {
    suggestion: string;
    groupContext: string;
    culturalBenefit: string;
    implementation: string;
  }[];
  paymentMethodOptimizations: {
    method: string;
    optimization: string;
    culturalReason: string;
    expectedSavings: number;
  }[];
}

interface AdvancedAnalyticsData {
  spendingPatterns: BrazilianSpendingPattern;
  groupDynamics: GroupDynamicsInsights;
  expenseCategorization: ExpenseCategorization;
  personalizedRecommendations: PersonalizedRecommendations;
}

export default function AdvancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'spending' | 'dynamics' | 'categorization' | 'recommendations'>('spending');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLGPDConsent();
  }, []);

  useEffect(() => {
    if (lgpdConsent) {
      loadAdvancedAnalytics();
    }
  }, [lgpdConsent]);

  const checkLGPDConsent = async () => {
    try {
      const memorySystem = new MemorySystem();
      const consent = await memorySystem.getUserConsent('user123', 'analytics');
      setLgpdConsent(consent.consentGiven);
    } catch (error) {
      console.error('LGPD consent check failed:', error);
      setError('Unable to verify privacy consent');
    }
  };

  const loadAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load spending patterns
      const spendingResponse = await fetch('/api/analytics/spending-patterns?userId=user123');
      const spendingData = await spendingResponse.json();

      // Load group dynamics
      const dynamicsResponse = await fetch('/api/analytics/group-dynamics?userId=user123');
      const dynamicsData = await dynamicsResponse.json();

      // Load expense categorization
      const categorizationResponse = await fetch('/api/analytics/expense-categorization?userId=user123');
      const categorizationData = await categorizationResponse.json();

      // Load personalized recommendations
      const recommendationsResponse = await fetch('/api/analytics/personalized-recommendations?userId=user123');
      const recommendationsData = await recommendationsResponse.json();

      setAnalyticsData({
        spendingPatterns: spendingData.data,
        groupDynamics: dynamicsData.data,
        expenseCategorization: categorizationData.data,
        personalizedRecommendations: recommendationsData.data
      });
    } catch (error) {
      console.error('Failed to load advanced analytics:', error);
      setError('Failed to load advanced analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (!lgpdConsent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
          <p className="text-gray-600 mb-4">
            Privacy consent is required to access advanced analytics and insights.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              Please provide consent for analytics data collection to view advanced insights.
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics & Insights</h2>
        <p className="text-gray-600 mt-1">
          Deep insights into Brazilian spending patterns, group dynamics, and personalized recommendations
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'spending', name: 'Spending Patterns', icon: '📊' },
            { id: 'dynamics', name: 'Group Dynamics', icon: '👥' },
            { id: 'categorization', name: 'Expense Categories', icon: '🏷️' },
            { id: 'recommendations', name: 'Recommendations', icon: '💡' }
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
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'spending' && analyticsData && (
          <SpendingPatternsTab data={analyticsData.spendingPatterns} />
        )}
        {activeTab === 'dynamics' && analyticsData && (
          <GroupDynamicsTab data={analyticsData.groupDynamics} />
        )}
        {activeTab === 'categorization' && analyticsData && (
          <ExpenseCategorizationTab data={analyticsData.expenseCategorization} />
        )}
        {activeTab === 'recommendations' && analyticsData && (
          <PersonalizedRecommendationsTab data={analyticsData.personalizedRecommendations} />
        )}
      </div>
    </div>
  );
}

// Spending Patterns Tab Component
function SpendingPatternsTab({ data }: { data: BrazilianSpendingPattern }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Trends */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Spending Trends</h3>
          <div className="space-y-3">
            {data.regionalTrends.map((trend, index) => (
              <div key={index} className="bg-white rounded-md p-3 border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{trend.region}</span>
                  <span className="text-green-600 font-semibold">R$ {trend.averageSpending.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <p>Payment: {trend.paymentPreference}</p>
                  <p>Cultural: {trend.culturalInfluence}</p>
                  <p>Seasonal: {trend.seasonalPattern}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural Influences */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Influences</h3>
          <div className="space-y-3">
            {data.culturalInfluences.map((influence, index) => (
              <div key={index} className="bg-white rounded-md p-3 border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{influence.factor}</span>
                  <span className="text-blue-600 font-semibold">{influence.impact}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{influence.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Preferences */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.paymentPreferences.map((pref, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{pref.method}</span>
                <span className="text-green-600 font-semibold">{pref.percentage}%</span>
              </div>
              <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                pref.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                pref.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {pref.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Patterns */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Spending Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.socialPatterns.map((pattern, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Group Size: {pattern.groupSize}</span>
                <span className="text-green-600 font-semibold">R$ {pattern.averageContribution.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Frequency: {pattern.frequency}</p>
              <p className="text-sm text-gray-600">Context: {pattern.culturalContext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Analysis */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Spending Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.seasonalAnalysis.map((season, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{season.month}</span>
                <span className="text-green-600 font-semibold">R$ {season.spending.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Category: {season.category}</p>
              <p className="text-sm text-gray-600">Reason: {season.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Group Dynamics Tab Component
function GroupDynamicsTab({ data }: { data: GroupDynamicsInsights }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Interactions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Interaction Patterns</h3>
          <div className="space-y-3">
            {data.socialInteractions.map((interaction, index) => (
              <div key={index} className="bg-white rounded-md p-3 border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{interaction.interactionType}</span>
                  <span className="text-blue-600 font-semibold">{interaction.frequency}x</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Context: {interaction.culturalContext}</p>
                <p className="text-sm text-gray-600">Impact: {interaction.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Behaviors */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Behavior Analysis</h3>
          <div className="space-y-3">
            {data.paymentBehaviors.map((behavior, index) => (
              <div key={index} className="bg-white rounded-md p-3 border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{behavior.behavior}</span>
                  <span className="text-blue-600 font-semibold">{behavior.frequency}x</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Reason: {behavior.culturalReason}</p>
                <p className="text-sm text-gray-600">Optimization: {behavior.optimization}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cultural Contexts */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Context Influence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.culturalContexts.map((context, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{context.context}</span>
                <span className="text-blue-600 font-semibold">{context.influence}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{context.description}</p>
              <p className="text-sm text-green-600">Recommendation: {context.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Group Size Impact */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Size Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.groupSizeImpact.map((impact, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Size: {impact.size}</span>
                <span className="text-green-600 font-semibold">{impact.efficiency}%</span>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Challenges:</p>
                <ul className="list-disc list-inside ml-2">
                  {impact.challenges.map((challenge, i) => (
                    <li key={i}>{challenge}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Benefits:</p>
                <ul className="list-disc list-inside ml-2">
                  {impact.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Dynamics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Group Dynamics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.regionalDynamics.map((regional, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{regional.region}</h4>
              <p className="text-sm text-gray-600 mb-2">{regional.dynamics}</p>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Cultural Factors:</p>
                <ul className="list-disc list-inside ml-2">
                  {regional.culturalFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Recommendations:</p>
                <ul className="list-disc list-inside ml-2">
                  {regional.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Expense Categorization Tab Component
function ExpenseCategorizationTab({ data }: { data: ExpenseCategorization }) {
  return (
    <div className="space-y-6">
      {/* Brazilian Categories */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brazilian Expense Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.brazilianCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{category.category}</span>
                <span className="text-green-600 font-semibold">R$ {category.amount.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Frequency: {category.frequency}x</p>
              <p className="text-sm text-gray-600">Context: {category.culturalContext}</p>
              <p className="text-sm text-gray-600">Regional: {category.regionalVariation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Categories */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Expense Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.culturalCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Examples:</p>
                <ul className="list-disc list-inside ml-2">
                  {category.examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Cultural Significance:</p>
                <p className="ml-2">{category.culturalSignificance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Patterns */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Expense Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.regionalPatterns.map((pattern, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{pattern.region}</h4>
              <p className="text-sm text-gray-600 mb-2">{pattern.spendingPatterns}</p>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Top Categories:</p>
                <ul className="list-disc list-inside ml-2">
                  {pattern.topCategories.map((category, i) => (
                    <li key={i}>{category}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Cultural Factors:</p>
                <ul className="list-disc list-inside ml-2">
                  {pattern.culturalFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Categorization */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Expense Categorization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.seasonalCategorization.map((season, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{season.season}</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Categories:</p>
                <ul className="list-disc list-inside ml-2">
                  {season.categories.map((category, i) => (
                    <li key={i}>{category}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Reasons:</p>
                <ul className="list-disc list-inside ml-2">
                  {season.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Cultural Events:</p>
                <ul className="list-disc list-inside ml-2">
                  {season.culturalEvents.map((event, i) => (
                    <li key={i}>{event}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Context Categories */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Context Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.socialContextCategories.map((context, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{context.context}</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Categories:</p>
                <ul className="list-disc list-inside ml-2">
                  {context.categories.map((category, i) => (
                    <li key={i}>{category}</li>
                  ))}
                </ul>
                <p className="font-medium mt-2">Cultural Significance:</p>
                <p className="ml-2">{context.culturalSignificance}</p>
                <p className="font-medium mt-2">Recommendations:</p>
                <ul className="list-disc list-inside ml-2">
                  {context.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Personalized Recommendations Tab Component
function PersonalizedRecommendationsTab({ data }: { data: PersonalizedRecommendations }) {
  return (
    <div className="space-y-6">
      {/* User Specific Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User-Specific Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.userSpecificInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Insight #{index + 1}</span>
                <span className="text-blue-600 font-semibold">{insight.confidence}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{insight.insight}</p>
              <p className="text-sm text-gray-600">Context: {insight.culturalContext}</p>
              <p className="text-sm text-green-600">Actionability: {insight.actionability}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Recommendations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.culturalRecommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{rec.recommendation}</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Cultural Reason:</p>
                <p className="ml-2">{rec.culturalReason}</p>
                <p className="font-medium mt-2">Expected Benefit:</p>
                <p className="ml-2">{rec.expectedBenefit}</p>
                <p className="font-medium mt-2">Implementation:</p>
                <p className="ml-2">{rec.implementation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Optimizations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Optimizations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.regionalOptimizations.map((opt, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{opt.region}</span>
                <span className="text-green-600 font-semibold">Optimized</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{opt.optimization}</p>
              <p className="text-sm text-gray-600">Cultural Consideration: {opt.culturalConsideration}</p>
              <p className="text-sm text-green-600">Expected Impact: {opt.expectedImpact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Dynamic Suggestions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Dynamic Suggestions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.socialDynamicSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">{suggestion.suggestion}</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Group Context:</p>
                <p className="ml-2">{suggestion.groupContext}</p>
                <p className="font-medium mt-2">Cultural Benefit:</p>
                <p className="ml-2">{suggestion.culturalBenefit}</p>
                <p className="font-medium mt-2">Implementation:</p>
                <p className="ml-2">{suggestion.implementation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Optimizations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Optimizations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.paymentMethodOptimizations.map((opt, index) => (
            <div key={index} className="bg-white rounded-md p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{opt.method}</span>
                <span className="text-green-600 font-semibold">R$ {opt.expectedSavings.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{opt.optimization}</p>
              <p className="text-sm text-gray-600">Cultural Reason: {opt.culturalReason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 