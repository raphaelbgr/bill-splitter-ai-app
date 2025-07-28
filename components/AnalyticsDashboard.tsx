import React, { useState, useEffect } from 'react';
import { MemorySystem } from '../lib/memory-system';
import { performanceOptimizer } from '../lib/performance-optimizer';

interface BrazilianMarketAnalytics {
  regionalUsage: {
    SP: { users: number; conversations: number; avgResponseTime: number };
    RJ: { users: number; conversations: number; avgResponseTime: number };
    NE: { users: number; conversations: number; avgResponseTime: number };
    Sul: { users: number; conversations: number; avgResponseTime: number };
  };
  culturalEffectiveness: {
    regionalExpressions: number;
    culturalReferences: number;
    userSatisfaction: number;
    authenticityScore: number;
  };
  paymentPreferences: {
    pix: number;
    transfer: number;
    cash: number;
    credit: number;
    boleto: number;
  };
  socialDynamics: {
    groupSize: { small: number; medium: number; large: number };
    interactionPatterns: Record<string, number>;
    peakHours: Record<string, number>;
  };
}

interface UserFeedbackData {
  satisfaction: number;
  featureRequests: Array<{ feature: string; votes: number; priority: string }>;
  bugReports: Array<{ issue: string; severity: string; status: string }>;
  userExperience: {
    easeOfUse: number;
    responseTime: number;
    accuracy: number;
    culturalRelevance: number;
  };
}

interface CostTrackingData {
  dailyCosts: Array<{ date: string; cost: number; requests: number }>;
  modelUsage: {
    haiku: { usage: number; cost: number; accuracy: number };
    sonnet: { usage: number; cost: number; accuracy: number };
    opus: { usage: number; cost: number; accuracy: number };
  };
  optimizationOpportunities: Array<{ opportunity: string; potentialSavings: number; impact: string }>;
  budgetStatus: {
    dailyBudget: number;
    monthlyBudget: number;
    currentSpend: number;
    remainingBudget: number;
  };
}

interface PerformanceMonitoringData {
  regionalPerformance: {
    SP: { responseTime: number; errorRate: number; uptime: number };
    RJ: { responseTime: number; errorRate: number; uptime: number };
    NE: { responseTime: number; errorRate: number; uptime: number };
    Sul: { responseTime: number; errorRate: number; uptime: number };
  };
  peakHourPerformance: {
    morning: { responseTime: number; requests: number; optimization: string };
    lunch: { responseTime: number; requests: number; optimization: string };
    evening: { responseTime: number; requests: number; optimization: string };
    weekend: { responseTime: number; requests: number; optimization: string };
  };
  mobilePerformance: {
    loadTime: number;
    cacheHitRate: number;
    compressionEnabled: boolean;
    optimizationLevel: string;
  };
}

export default function AnalyticsDashboard() {
  const [brazilianAnalytics, setBrazilianAnalytics] = useState<BrazilianMarketAnalytics | null>(null);
  const [feedbackData, setFeedbackData] = useState<UserFeedbackData | null>(null);
  const [costData, setCostData] = useState<CostTrackingData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'feedback' | 'cost' | 'performance'>('market');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  useEffect(() => {
    checkLGPDConsent();
    if (lgpdConsent) {
      loadAnalyticsData();
    }
  }, [lgpdConsent]);

  const checkLGPDConsent = async () => {
    try {
      const memorySystem = new MemorySystem();
      const consent = await memorySystem.getUserConsent('analytics', 'analytics');
      setLgpdConsent(consent.consentGiven);
    } catch (error) {
      console.error('Error checking LGPD consent:', error);
      setLgpdConsent(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load all analytics data in parallel
      const [marketData, feedback, cost, performance] = await Promise.all([
        loadBrazilianMarketAnalytics(),
        loadUserFeedbackData(),
        loadCostTrackingData(),
        loadPerformanceMonitoringData()
      ]);

      setBrazilianAnalytics(marketData);
      setFeedbackData(feedback);
      setCostData(cost);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrazilianMarketAnalytics = async (): Promise<BrazilianMarketAnalytics> => {
    // Mock data for demonstration - in real implementation, this would come from actual analytics
    return {
      regionalUsage: {
        SP: { users: 1250, conversations: 8900, avgResponseTime: 1200 },
        RJ: { users: 890, conversations: 6200, avgResponseTime: 1350 },
        NE: { users: 650, conversations: 4200, avgResponseTime: 1500 },
        Sul: { users: 720, conversations: 4800, avgResponseTime: 1280 }
      },
      culturalEffectiveness: {
        regionalExpressions: 85,
        culturalReferences: 92,
        userSatisfaction: 4.6,
        authenticityScore: 4.8
      },
      paymentPreferences: {
        pix: 65,
        transfer: 20,
        cash: 10,
        credit: 3,
        boleto: 2
      },
      socialDynamics: {
        groupSize: { small: 45, medium: 35, large: 20 },
        interactionPatterns: {
          'churrasco': 25,
          'happy_hour': 30,
          'viagem': 20,
          'reuniao': 15,
          'outros': 10
        },
        peakHours: {
          '7:00-9:00': 15,
          '12:00-14:00': 25,
          '18:00-21:00': 40,
          '19:00-22:00': 20
        }
      }
    };
  };

  const loadUserFeedbackData = async (): Promise<UserFeedbackData> => {
    return {
      satisfaction: 4.5,
      featureRequests: [
        { feature: 'Integração com WhatsApp', votes: 45, priority: 'high' },
        { feature: 'Histórico de pagamentos', votes: 32, priority: 'medium' },
        { feature: 'Exportar para Excel', votes: 28, priority: 'medium' },
        { feature: 'Lembretes automáticos', votes: 22, priority: 'low' }
      ],
      bugReports: [
        { issue: 'Erro no cálculo de porcentagens', severity: 'high', status: 'resolved' },
        { issue: 'Problema com caracteres especiais', severity: 'medium', status: 'in_progress' },
        { issue: 'Lentidão em horário de pico', severity: 'low', status: 'investigating' }
      ],
      userExperience: {
        easeOfUse: 4.7,
        responseTime: 4.3,
        accuracy: 4.8,
        culturalRelevance: 4.9
      }
    };
  };

  const loadCostTrackingData = async (): Promise<CostTrackingData> => {
    const performanceAnalytics = await performanceOptimizer.getPerformanceAnalytics();
    
    return {
      dailyCosts: [
        { date: '2024-01-15', cost: 45.20, requests: 1250 },
        { date: '2024-01-16', cost: 52.80, requests: 1380 },
        { date: '2024-01-17', cost: 48.90, requests: 1320 },
        { date: '2024-01-18', cost: 55.10, requests: 1450 },
        { date: '2024-01-19', cost: 51.30, requests: 1390 }
      ],
      modelUsage: {
        haiku: { usage: 70, cost: 1400, accuracy: 92.8 },
        sonnet: { usage: 25, cost: 2500, accuracy: 96.5 },
        opus: { usage: 5, cost: 750, accuracy: 98.7 }
      },
      optimizationOpportunities: [
        { opportunity: 'Cache mais agressivo', potentialSavings: 25, impact: 'high' },
        { opportunity: 'Modelo Haiku para cálculos simples', potentialSavings: 15, impact: 'medium' },
        { opportunity: 'Compressão de respostas', potentialSavings: 10, impact: 'low' }
      ],
      budgetStatus: {
        dailyBudget: 100,
        monthlyBudget: 2500,
        currentSpend: 65,
        remainingBudget: 35
      }
    };
  };

  const loadPerformanceMonitoringData = async (): Promise<PerformanceMonitoringData> => {
    return {
      regionalPerformance: {
        SP: { responseTime: 1200, errorRate: 0.5, uptime: 99.9 },
        RJ: { responseTime: 1350, errorRate: 0.8, uptime: 99.8 },
        NE: { responseTime: 1500, errorRate: 1.2, uptime: 99.7 },
        Sul: { responseTime: 1280, errorRate: 0.6, uptime: 99.9 }
      },
      peakHourPerformance: {
        morning: { responseTime: 1100, requests: 450, optimization: 'sonnet' },
        lunch: { responseTime: 1300, requests: 680, optimization: 'haiku' },
        evening: { responseTime: 1400, requests: 920, optimization: 'haiku' },
        weekend: { responseTime: 1250, requests: 580, optimization: 'sonnet' }
      },
      mobilePerformance: {
        loadTime: 2800,
        cacheHitRate: 85,
        compressionEnabled: true,
        optimizationLevel: 'high'
      }
    };
  };

  const getStatusColor = (value: number, threshold: number) => {
    return value <= threshold ? 'text-green-600' : 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!lgpdConsent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Para visualizar os analytics, é necessário consentimento LGPD.
          </p>
          <button
            onClick={checkLGPDConsent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Verificar Consentimento
          </button>
        </div>
      </div>
    );
  }

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
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-600 font-medium">LGPD Compliant</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'market', label: 'Mercado Brasileiro', icon: '🌎' },
            { id: 'feedback', label: 'Feedback de Usuários', icon: '💬' },
            { id: 'cost', label: 'Custos & Otimização', icon: '💰' },
            { id: 'performance', label: 'Performance', icon: '⚡' }
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
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'market' && brazilianAnalytics && (
          <BrazilianMarketTab analytics={brazilianAnalytics} />
        )}
        
        {activeTab === 'feedback' && feedbackData && (
          <UserFeedbackTab feedback={feedbackData} />
        )}
        
        {activeTab === 'cost' && costData && (
          <CostTrackingTab costData={costData} />
        )}
        
        {activeTab === 'performance' && performanceData && (
          <PerformanceMonitoringTab performance={performanceData} />
        )}
      </div>
    </div>
  );
}

// Brazilian Market Analytics Tab
function BrazilianMarketTab({ analytics }: { analytics: BrazilianMarketAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Regional Usage */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso Regional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.regionalUsage).map(([region, data]) => (
            <div key={region} className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">{region}</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-700">{data.users.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">usuários</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                <p>Conversas: {data.conversations.toLocaleString()}</p>
                <p>Tempo médio: {data.avgResponseTime}ms</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Effectiveness */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efetividade Cultural</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600">Expressões Regionais</p>
            <p className="text-2xl font-bold text-green-700">{analytics.culturalEffectiveness.regionalExpressions}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-600">Referências Culturais</p>
            <p className="text-2xl font-bold text-purple-700">{analytics.culturalEffectiveness.culturalReferences}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-600">Satisfação do Usuário</p>
            <p className="text-2xl font-bold text-yellow-700">{analytics.culturalEffectiveness.userSatisfaction}/5</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-600">Score de Autenticidade</p>
            <p className="text-2xl font-bold text-indigo-700">{analytics.culturalEffectiveness.authenticityScore}/5</p>
          </div>
        </div>
      </div>

      {/* Payment Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(analytics.paymentPreferences).map(([method, percentage]) => (
            <div key={method} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600 capitalize">{method}</p>
              <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Dynamics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dinâmicas Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Tamanho dos Grupos</h4>
            <div className="space-y-2">
              {Object.entries(analytics.socialDynamics.groupSize).map(([size, percentage]) => (
                <div key={size} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{size}</span>
                  <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Padrões de Interação</h4>
            <div className="space-y-2">
              {Object.entries(analytics.socialDynamics.interactionPatterns).map(([pattern, percentage]) => (
                <div key={pattern} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{pattern.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Feedback Tab
function UserFeedbackTab({ feedback }: { feedback: UserFeedbackData }) {
  return (
    <div className="space-y-6">
      {/* Overall Satisfaction */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfação Geral</h3>
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Satisfação Média</p>
              <p className="text-3xl font-bold text-green-700">{feedback.satisfaction}/5</p>
            </div>
            <div className="text-green-600">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Experience Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Experiência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(feedback.userExperience).map(([metric, score]) => (
            <div key={metric} className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-2xl font-bold text-blue-700">{score}/5</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Requests */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitações de Funcionalidades</h3>
        <div className="space-y-3">
          {feedback.featureRequests.map((request, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{request.feature}</p>
                  <p className="text-sm text-gray-600">{request.votes} votos</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.priority === 'high' ? 'bg-red-100 text-red-800' :
                  request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bug Reports */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios de Bugs</h3>
        <div className="space-y-3">
          {feedback.bugReports.map((bug, index) => (
            <div key={index} className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{bug.issue}</p>
                  <p className="text-sm text-gray-600">Severidade: {bug.severity}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bug.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  bug.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {bug.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cost Tracking Tab
function CostTrackingTab({ costData }: { costData: CostTrackingData }) {
  const budgetPercentage = (costData.budgetStatus.currentSpend / costData.budgetStatus.dailyBudget) * 100;
  
  return (
    <div className="space-y-6">
      {/* Budget Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Orçamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-600">Orçamento Diário</p>
            <p className="text-2xl font-bold text-blue-700">R$ {costData.budgetStatus.dailyBudget}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600">Gasto Atual</p>
            <p className="text-2xl font-bold text-green-700">R$ {costData.budgetStatus.currentSpend}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-600">Restante</p>
            <p className="text-2xl font-bold text-yellow-700">R$ {costData.budgetStatus.remainingBudget}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-600">Utilização</p>
            <p className={`text-2xl font-bold ${budgetPercentage > 80 ? 'text-red-600' : 'text-purple-700'}`}>
              {budgetPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Model Usage */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso dos Modelos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(costData.modelUsage).map(([model, data]) => (
            <div key={model} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 capitalize">{model}</span>
                <span className="text-sm font-bold text-gray-900">{data.usage}%</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Custo: R$ {data.cost}</p>
                <p>Precisão: {data.accuracy}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades de Otimização</h3>
        <div className="space-y-3">
          {costData.optimizationOpportunities.map((opportunity, index) => (
            <div key={index} className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{opportunity.opportunity}</p>
                  <p className="text-sm text-gray-600">Economia potencial: R$ {opportunity.potentialSavings}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  opportunity.impact === 'high' ? 'bg-red-100 text-red-800' :
                  opportunity.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {opportunity.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Costs Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custos Diários</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            {costData.dailyCosts.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{day.requests} requests</span>
                  <span className="text-sm font-medium text-gray-900">R$ {day.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance Monitoring Tab
function PerformanceMonitoringTab({ performance }: { performance: PerformanceMonitoringData }) {
  return (
    <div className="space-y-6">
      {/* Regional Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Regional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(performance.regionalPerformance).map(([region, data]) => (
            <div key={region} className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">{region}</span>
                <div className={`w-2 h-2 rounded-full ${
                  data.uptime >= 99.9 ? 'bg-green-500' :
                  data.uptime >= 99.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div className="space-y-1 text-xs text-blue-600">
                <p>Tempo de resposta: {data.responseTime}ms</p>
                <p>Taxa de erro: {data.errorRate}%</p>
                <p>Uptime: {data.uptime}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hour Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance em Horários de Pico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(performance.peakHourPerformance).map(([hour, data]) => (
            <div key={hour} className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-600 capitalize">{hour}</span>
                <span className="text-xs text-yellow-600 capitalize">{data.optimization}</span>
              </div>
              <div className="space-y-1 text-xs text-yellow-600">
                <p>Tempo de resposta: {data.responseTime}ms</p>
                <p>Requests: {data.requests}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Mobile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-600">Tempo de Carregamento</p>
            <p className="text-2xl font-bold text-purple-700">{performance.mobilePerformance.loadTime}ms</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600">Taxa de Cache Hit</p>
            <p className="text-2xl font-bold text-green-700">{performance.mobilePerformance.cacheHitRate}%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-600">Compressão</p>
            <p className="text-2xl font-bold text-blue-700">
              {performance.mobilePerformance.compressionEnabled ? 'Ativa' : 'Inativa'}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-600">Nível de Otimização</p>
            <p className="text-2xl font-bold text-indigo-700 capitalize">{performance.mobilePerformance.optimizationLevel}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 