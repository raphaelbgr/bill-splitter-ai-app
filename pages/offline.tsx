import React from 'react';
import Head from 'next/head';
import { WifiOff, RefreshCw, Home, Users, CreditCard } from 'lucide-react';

const OfflinePage: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Head>
        <title>RachaAI - Offline</title>
        <meta name="description" content="RachaAI está offline" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-semibold text-gray-900">RachaAI Offline</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Offline Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sem Conexão
              </h2>
              <p className="text-gray-600 mb-6">
                Você está offline. Algumas funcionalidades podem não estar disponíveis.
              </p>
            </div>

            {/* Offline Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✅ Funcionalidades Disponíveis Offline
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Visualizar conversas salvas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Ver grupos e pagamentos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Capturar fotos de recibos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Adicionar localização</span>
                </div>
              </div>
            </div>

            {/* Offline Limitations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                ⚠️ Funcionalidades Limitadas
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700">Processamento de IA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700">Sincronização de dados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700">Pagamentos online</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Tentar Novamente</span>
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Ir para Início</span>
              </button>
            </div>

            {/* Quick Navigation */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Navegação Rápida
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => window.location.href = '/conversation-test'}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs text-gray-600 mb-1">Conversas</div>
                  <div className="text-lg">💬</div>
                </button>
                <button
                  onClick={() => window.location.href = '/group-test'}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs text-gray-600 mb-1">Grupos</div>
                  <div className="text-lg">👥</div>
                </button>
                <button
                  onClick={() => window.location.href = '/payment-test'}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs text-gray-600 mb-1">Pagamentos</div>
                  <div className="text-lg">💳</div>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t px-4 py-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              RachaAI - Divisor de Contas Inteligente
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Otimizado para redes brasileiras
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default OfflinePage; 