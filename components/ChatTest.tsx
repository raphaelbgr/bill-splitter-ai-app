import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  costBRL?: number;
  cached?: boolean;
}

interface UsageStats {
  dailySpend: number;
  budget: number;
  percentageUsed: number;
  modelDistribution: Record<string, number>;
}

export default function ChatTest() {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => uuidv4());
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Brazilian test scenarios
  const testScenarios = [
    'Oi! Acabei de pagar R$ 120 no jantar. Éramos 4 pessoas: eu, João, Maria e Ana. Dividir igual?',
    'Paguei R$ 50 no Uber pra galera. Foram 3 pessoas comigo. Como fica?',
    'Fiz uma vaquinha de R$ 200 pro churrasco. Somos 8 pessoas, mas 2 crianças pagam meia.',
    'Happy hour custou R$ 80. Eu, Pedro e Carla. Mas eu só bebi água, desconta R$ 15?',
    'Dividir R$ 300 da viagem entre 5 amigos. Todo mundo paga igual.',
    'Conta do restaurante: R$ 180. Éramos 6, mas o Carlos chegou depois e só comeu sobremesa.'
  ];

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const userMessage: TestMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId,
          culturalContext: {
            region: 'São Paulo',
            scenario: 'restaurante',
            groupType: 'amigos',
            timeOfDay: 'jantar'
          },
          userPreferences: {
            language: 'pt-BR',
            formalityLevel: 'informal',
            region: 'São Paulo',
            paymentPreference: 'pix'
          }
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro na resposta da API');
      }

      // Add Claude response to chat
      const assistantMessage: TestMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.data.content,
        timestamp: new Date(),
        modelUsed: data.data.modelUsed,
        costBRL: data.data.costBRL,
        cached: data.data.cached
      };

      setMessages(prev => [...prev, assistantMessage]);
      setUsageStats(data.usage);

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Remove user message if request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const useTestScenario = (scenario: string) => {
    setInputMessage(scenario);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setUsageStats(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getModelColor = (model?: string) => {
    if (!model) return 'bg-gray-100';
    if (model.includes('haiku')) return 'bg-green-100 text-green-800';
    if (model.includes('sonnet')) return 'bg-blue-100 text-blue-800';
    if (model.includes('opus')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">RachaAI - Claude Integration Test</h1>
          <p className="text-blue-100 text-sm">
            Testando integração Claude com otimização brasileira
          </p>
        </div>

        {/* Usage Stats */}
        {usageStats && (
          <div className="bg-gray-50 p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Gasto Diário:</span>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(usageStats.dailySpend)}
                </div>
              </div>
              <div>
                <span className="font-medium">Orçamento:</span>
                <div className="text-lg font-bold">
                  {formatCurrency(usageStats.budget)}
                </div>
              </div>
              <div>
                <span className="font-medium">Uso:</span>
                <div className="text-lg font-bold text-orange-600">
                  {usageStats.percentageUsed.toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="font-medium">Modelos:</span>
                <div className="text-xs">
                  <div>Haiku: {usageStats.modelDistribution.haiku || 0}</div>
                  <div>Sonnet: {usageStats.modelDistribution.sonnet || 0}</div>
                  <div>Opus: {usageStats.modelDistribution.opus || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Scenarios */}
        <div className="p-4 border-b bg-yellow-50">
          <h3 className="font-medium text-sm mb-2">Cenários de Teste Brasileiros:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => useTestScenario(scenario)}
                className="text-left text-xs p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                {scenario.substring(0, 80)}...
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <h3 className="text-lg font-medium mb-2">Bem-vindo ao RachaAI! 🇧🇷</h3>
              <p className="text-sm">
                Digite uma descrição de despesa ou use um dos cenários de teste acima.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                
                {/* Metadata for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {message.modelUsed && (
                        <span className={`px-2 py-1 rounded text-xs ${getModelColor(message.modelUsed)}`}>
                          {message.modelUsed.split('-')[2]} {/* Show just model name */}
                        </span>
                      )}
                      {message.costBRL && (
                        <span className="text-green-600">
                          {formatCurrency(message.costBRL)}
                        </span>
                      )}
                      {message.cached && (
                        <span className="text-orange-600">📦 Cache</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">RachaAI pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <div className="text-red-800 text-sm">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua descrição de despesa em português..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '...' : 'Enviar'}
              </button>
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Limpar
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </div>
        </div>
      </div>
    </div>
  );
} 