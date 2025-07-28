import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingIndicator({ 
  message = 'Processando...', 
  size = 'medium' 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Animated dots */}
      <div className="flex items-center space-x-1">
        <div className={`${sizeClasses[size]} bg-green-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeClasses[size]} bg-green-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeClasses[size]} bg-green-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Loading message */}
      <div className={`${textSizes[size]} text-gray-600 font-medium`}>
        {message}
      </div>
      
      {/* Optional AI thinking indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">IA pensando</span>
      </div>
    </div>
  );
} 