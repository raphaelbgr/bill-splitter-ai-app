import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import ErrorBoundary from './ErrorBoundary';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  costBRL?: number;
  cached?: boolean;
  error?: string;
}

interface UsageStats {
  dailySpend: number;
  budget: number;
  percentageUsed: number;
  modelDistribution: Record<string, number>;
}

interface ConversationInterfaceProps {
  userId?: string;
  conversationId?: string;
  onError?: (error: string) => void;
}

export default function ConversationInterface({
  userId,
  conversationId: initialConversationId,
  onError
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation ID on client side only
  useEffect(() => {
    setIsClient(true);
    if (!conversationId) {
      setConversationId(initialConversationId || uuidv4());
    }
  }, [initialConversationId, conversationId]);

  // Brazilian cultural context
  const culturalContext = {
    region: 'São Paulo',
    scenario: 'restaurante' as const,
    groupType: 'amigos' as const,
    timeOfDay: 'jantar' as const
  };

  const userPreferences = {
    language: 'pt-BR' as const,
    formalityLevel: 'informal' as const,
    region: 'São Paulo',
    paymentPreference: 'pix' as const
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Send message function
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !isClient) return;

    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Check if offline
      if (!isOnline) {
        throw new Error('Sem conexão com a internet. Tente novamente quando estiver online.');
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId,
          culturalContext,
          userPreferences
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro na resposta da API');
      }

      // Add Claude response to chat
      const assistantMessage: Message = {
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      onError?.(errorMessage);

      // Add error message to chat
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${errorMessage}`,
        timestamp: new Date(),
        error: errorMessage
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading && isClient) {
      sendMessage(inputMessage);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isLoading && isClient) {
        sendMessage(inputMessage);
      }
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setError(null);
    setUsageStats(null);
  };

  // Format currency for Brazilian market
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-500 font-bold text-sm">R</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">RachaAI</h1>
              <p className="text-xs opacity-90">Divisão inteligente de contas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isOnline && (
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Offline</span>
              </div>
            )}
            {usageStats && (
              <div className="text-xs opacity-90">
                {formatCurrency(usageStats.dailySpend)} / {formatCurrency(usageStats.budget)}
              </div>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-500 text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700">Bem-vindo ao RachaAI!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Conte sobre suas despesas em português e eu ajudo a dividir
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  onClick={() => sendMessage('Oi! Acabei de pagar R$ 120 no jantar. Éramos 4 pessoas: eu, João, Maria e Ana. Dividir igual?')}
                  className="p-3 text-left text-sm bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-700">Jantar em grupo</div>
                  <div className="text-gray-500 text-xs">R$ 120 entre 4 pessoas</div>
                </button>
                
                <button
                  onClick={() => sendMessage('Paguei R$ 50 no Uber pra galera. Foram 3 pessoas comigo. Como fica?')}
                  className="p-3 text-left text-sm bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-700">Transporte compartilhado</div>
                  <div className="text-gray-500 text-xs">Uber R$ 50 entre 3</div>
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              formatCurrency={formatCurrency}
            />
          ))}

          {isLoading && (
            <div className="flex justify-center">
              <LoadingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Conte sobre suas despesas em português..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={1}
                disabled={isLoading || !isOnline || !isClient}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              {!isOnline && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Offline</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !isOnline || !isClient}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>Enviar</span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <button
                onClick={clearChat}
                className="hover:text-gray-700 transition-colors"
              >
                Limpar conversa
              </button>
              <span>•</span>
              <span>Conversa #{conversationId.slice(0, 8)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Powered by Claude AI</span>
              {usageStats && (
                <span>• {Math.round(usageStats.percentageUsed)}% usado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 