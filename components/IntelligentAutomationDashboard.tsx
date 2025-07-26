import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Settings,
  RefreshCw
} from 'lucide-react';

interface IntelligentAutomationDashboardProps {
  userId: string;
  onSuggestionAccepted?: (suggestion: any) => void;
  onReminderCreated?: (reminder: any) => void;
}

interface AutomationAnalytics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  accuracyRate: number;
  timeSaved: number;
  userSatisfaction: number;
  culturalAccuracy: number;
  costSavings: number;
}

interface SmartCategorization {
  category: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
  culturalContext: string;
}

interface PredictiveSplittingSuggestion {
  method: string;
  confidence: number;
  reasoning: string;
  participants: string[];
  amounts: { [key: string]: number };
  culturalContext: string;
  alternatives: PredictiveSplittingSuggestion[];
}

interface GroupRecommendation {
  groupName: string;
  confidence: number;
  reasoning: string;
  suggestedMembers: string[];
  culturalContext: string;
  splitMethod: string;
  paymentPreference: string;
}

export default function IntelligentAutomationDashboard({
  userId,
  onSuggestionAccepted,
  onReminderCreated
}: IntelligentAutomationDashboardProps) {
  const [analytics, setAnalytics] = useState<AutomationAnalytics | null>(null);
  const [categorization, setCategorization] = useState<SmartCategorization | null>(null);
  const [splittingSuggestions, setSplittingSuggestions] = useState<PredictiveSplittingSuggestion[]>([]);
  const [groupRecommendations, setGroupRecommendations] = useState<GroupRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categorization' | 'splitting' | 'groups' | 'reminders'>('overview');

  // Form states for testing automation features
  const [testExpense, setTestExpense] = useState({
    text: '',
    amount: 0,
    participants: [] as string[]
  });
  const [newParticipant, setNewParticipant] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/automation/analytics?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const testCategorization = async () => {
    if (!testExpense.text || testExpense.amount <= 0 || testExpense.participants.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automation/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          expenseText: testExpense.text,
          amount: testExpense.amount,
          participants: testExpense.participants
        })
      });

      if (!response.ok) {
        throw new Error('Failed to categorize expense');
      }

      const data = await response.json();
      setCategorization(data.categorization);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to categorize expense');
    } finally {
      setIsLoading(false);
    }
  };

  const testPredictiveSplitting = async () => {
    if (!testExpense.text || testExpense.amount <= 0 || testExpense.participants.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automation/predictive-splitting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          expenseText: testExpense.text,
          amount: testExpense.amount,
          participants: testExpense.participants
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate splitting suggestions');
      }

      const data = await response.json();
      setSplittingSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate splitting suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const testGroupRecommendations = async () => {
    if (!testExpense.text || testExpense.participants.length === 0) {
      setError('Please fill in context and participants');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automation/group-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          context: testExpense.text,
          participants: testExpense.participants
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate group recommendations');
      }

      const data = await response.json();
      setGroupRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate group recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !testExpense.participants.includes(newParticipant.trim())) {
      setTestExpense(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (participant: string) => {
    setTestExpense(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participant)
    }));
  };

  const acceptSuggestion = (suggestion: any) => {
    onSuggestionAccepted?.(suggestion);
    // Track acceptance in analytics
    fetch('/api/automation/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        interaction: { type: 'suggestion_accepted', suggestion }
      })
    });
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'categorization', label: 'Categorização', icon: Target },
    { id: 'splitting', label: 'Divisão', icon: Zap },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'reminders', label: 'Lembretes', icon: Clock }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Automação Inteligente
              </h2>
              <p className="text-sm text-gray-500">
                IA que aprende e sugere baseado no contexto brasileiro
              </p>
            </div>
          </div>
          
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Sugestões Aceitas</p>
                      <p className="text-2xl font-bold">{analytics.acceptedSuggestions}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Taxa de Precisão</p>
                      <p className="text-2xl font-bold">{(analytics.accuracyRate * 100).toFixed(1)}%</p>
                    </div>
                    <Target className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Tempo Economizado</p>
                      <p className="text-2xl font-bold">{Math.round(analytics.timeSaved / 60)}min</p>
                    </div>
                    <Clock className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Satisfação</p>
                      <p className="text-2xl font-bold">{analytics.userSatisfaction}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
            )}

            {/* Test Automation Features */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Testar Recursos de Automação
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Despesa
                  </label>
                  <textarea
                    value={testExpense.text}
                    onChange={(e) => setTestExpense(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Ex: Jantar no restaurante japonês com amigos..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={testExpense.amount}
                      onChange={(e) => setTestExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participantes
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Nome do participante"
                      />
                      <button
                        onClick={addParticipant}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        +
                      </button>
                    </div>
                    {testExpense.participants.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {testExpense.participants.map((participant) => (
                          <span
                            key={participant}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                          >
                            <span>{participant}</span>
                            <button
                              onClick={() => removeParticipant(participant)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={testCategorization}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Testar Categorização
                  </button>
                  <button
                    onClick={testPredictiveSplitting}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    Testar Divisão
                  </button>
                  <button
                    onClick={testGroupRecommendations}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    Testar Grupos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categorization' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Categorização Inteligente
            </h3>
            
            {categorization && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Categoria Sugerida: {categorization.category}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Confiança: {(categorization.confidence * 100).toFixed(1)}%
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${categorization.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{categorization.reasoning}</p>
                
                {categorization.alternatives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Alternativas:</p>
                    <div className="flex flex-wrap gap-2">
                      {categorization.alternatives.map((alt, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Contexto Cultural: {categorization.culturalContext}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'splitting' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Sugestões de Divisão Preditiva
            </h3>
            
            {splittingSuggestions.length > 0 && (
              <div className="space-y-4">
                {splittingSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {suggestion.method === 'equal' ? 'Divisão Igual' :
                         suggestion.method === 'by_consumption' ? 'Por Consumo' :
                         suggestion.method === 'host_pays' ? 'Anfitrião Paga' :
                         suggestion.method}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {(suggestion.confidence * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${suggestion.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{suggestion.reasoning}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Participantes:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.participants.map((participant) => (
                            <span key={participant} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {participant}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Valores:</p>
                        <div className="space-y-1">
                          {Object.entries(suggestion.amounts).map(([participant, amount]) => (
                            <div key={participant} className="flex justify-between text-sm">
                              <span className="text-gray-600">{participant}:</span>
                              <span className="font-medium">R$ {amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Contexto: {suggestion.culturalContext}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => acceptSuggestion(suggestion)}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Aceitar Sugestão
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recomendações de Grupo
            </h3>
            
            {groupRecommendations.length > 0 && (
              <div className="space-y-4">
                {groupRecommendations.map((recommendation, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {recommendation.groupName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {(recommendation.confidence * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${recommendation.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{recommendation.reasoning}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Membros Sugeridos:</p>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.suggestedMembers.map((member) => (
                            <span key={member} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Configuração:</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Método de Divisão:</span>
                            <span className="font-medium">{recommendation.splitMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pagamento Preferido:</span>
                            <span className="font-medium">{recommendation.paymentPreference}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Contexto: {recommendation.culturalContext}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => acceptSuggestion(recommendation)}
                      className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Criar Grupo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lembretes Automatizados
            </h3>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
                <h4 className="text-lg font-medium text-gray-900">
                  Sistema de Lembretes Inteligentes
                </h4>
              </div>
              
              <p className="text-gray-700 mb-4">
                O sistema cria automaticamente lembretes baseados no contexto cultural brasileiro:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">
                    <strong>Lembrete Suave:</strong> 3 dias após a despesa
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-700">
                    <strong>Lembrete Amigável:</strong> 5 dias após a despesa
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-700">
                    <strong>Lembrete Urgente:</strong> 10 dias após a despesa
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600">
                  <strong>Exemplo de Mensagem:</strong> "Oi! Lembra daquele churrasco? 
                  Ainda tem R$ 25,00 para acertar 😊"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 