import React from 'react';

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

interface MessageBubbleProps {
  message: Message;
  formatCurrency: (value: number) => string;
}

export default function MessageBubble({ message, formatCurrency }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = !!message.error;

  // Format timestamp for Brazilian locale
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get model color for visual indication
  const getModelColor = (model?: string) => {
    switch (model) {
      case 'claude-3-5-sonnet-20241022':
        return 'bg-blue-100 text-blue-800';
      case 'claude-3-haiku-20240307':
        return 'bg-green-100 text-green-800';
      case 'claude-3-opus-20240229':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get model display name
  const getModelDisplayName = (model?: string) => {
    switch (model) {
      case 'claude-3-5-sonnet-20241022':
        return 'Sonnet';
      case 'claude-3-haiku-20240307':
        return 'Haiku';
      case 'claude-3-opus-20240229':
        return 'Opus';
      default:
        return 'Claude';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
        isUser ? 'order-2' : 'order-1'
      }`}>
        {/* Avatar */}
        <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {isUser ? '👤' : '🤖'}
          </div>
          
          <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
            {/* Message Bubble */}
            <div className={`rounded-lg p-3 ${
              isUser
                ? 'bg-green-500 text-white'
                : isError
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              {/* Message Content */}
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {/* Message Metadata */}
              <div className={`mt-2 text-xs opacity-70 ${
                isUser ? 'text-right' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span>{formatTime(message.timestamp)}</span>
                  
                  {!isUser && message.modelUsed && (
                    <div className="flex items-center space-x-1">
                      <span className={`px-1 py-0.5 rounded text-xs ${getModelColor(message.modelUsed)}`}>
                        {getModelDisplayName(message.modelUsed)}
                      </span>
                      {message.cached && (
                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Cache
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Cost Information */}
                {!isUser && message.costBRL && (
                  <div className="mt-1 text-xs opacity-60">
                    Custo: {formatCurrency(message.costBRL)}
                  </div>
                )}
                
                {/* Error Information */}
                {isError && (
                  <div className="mt-1 text-xs text-red-600">
                    Erro: {message.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 