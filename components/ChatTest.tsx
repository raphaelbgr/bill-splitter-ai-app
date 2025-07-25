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
    if (!model) return 'bg-white/10 text-white';
    if (model.includes('haiku')) return 'bg-green-500/20 text-green-300 border border-green-500/30';
    if (model.includes('sonnet')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (model.includes('opus')) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    return 'bg-white/10 text-white';
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">RachaAI - Interface Conversacional</h1>
          <p className="text-purple-100 text-sm">
            Teste a IA Claude com otimização brasileira e contexto cultural
          </p>
        </div>

        {/* Usage Stats */}
        {usageStats && (
          <div className="bg-white/5 p-6 border-b border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="text-center">
                <span className="font-medium text-purple-200 block mb-2">Gasto Diário</span>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(usageStats.dailySpend)}
                </div>
              </div>
              <div className="text-center">
                <span className="font-medium text-purple-200 block mb-2">Orçamento</span>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(usageStats.budget)}
                </div>
              </div>
              <div className="text-center">
                <span className="font-medium text-purple-200 block mb-2">Uso</span>
                <div className="text-2xl font-bold text-orange-400">
                  {usageStats.percentageUsed.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <span className="font-medium text-purple-200 block mb-2">Modelos</span>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-green-300">Haiku:</span>
                    <span className="text-white">{usageStats.modelDistribution.haiku || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Sonnet:</span>
                    <span className="text-white">{usageStats.modelDistribution.sonnet || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Opus:</span>
                    <span className="text-white">{usageStats.modelDistribution.opus || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Scenarios */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <h3 className="font-medium text-white text-sm mb-4">🇧🇷 Cenários de Teste Brasileiros:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(scenario);
                  sendMessage(scenario);
                }}
                className="text-left text-xs p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 text-white hover:scale-105"
                disabled={isLoading}
              >
                {scenario.substring(0, 80)}...
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-purple-200 py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4">Bem-vindo ao RachaAI! 🇧🇷</h3>
              <p className="text-lg text-purple-200">
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
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                
                {/* Metadata for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="mt-3 pt-3 border-t border-white/20 text-xs">
                    <div className="flex flex-wrap gap-2">
                      {message.modelUsed && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(message.modelUsed)}`}>
                          {message.modelUsed.split('-')[2]} {/* Show just model name */}
                        </span>
                      )}
                      {message.costBRL && (
                        <span className="text-green-400 font-medium">
                          {formatCurrency(message.costBRL)}
                        </span>
                      )}
                      {message.cached && (
                        <span className="text-orange-400">📦 Cache</span>
                      )}
                    </div>
                    <div className="text-xs text-purple-300 mt-2">
                      {message.timestamp.toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-xl px-4 py-3 max-w-xs border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                  <span className="text-sm text-white">RachaAI pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-500/10 border-t border-red-500/30">
            <div className="text-red-300 text-sm">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua descrição de despesa em português..."
              className="flex-1 p-4 border border-white/20 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 text-white placeholder-purple-300"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/25"
              >
                {isLoading ? '...' : 'Enviar'}
              </button>
              <button
                onClick={clearChat}
                className="px-6 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm border border-white/20"
              >
                Limpar
              </button>
            </div>
          </div>
          <div className="text-xs text-purple-300 mt-3">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </div>
        </div>
      </div>
    </div>
  );
} 