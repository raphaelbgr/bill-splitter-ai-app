import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { usePWAInstallation, useServiceWorker, useOfflineStorage, usePushNotifications, useNetworkStatus } from '../lib/pwa-hooks';

export default function PWATestPage() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstallation();
  const { registration, isOnline, isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const { offlineExpenses, storeOfflineExpense, syncOfflineExpenses } = useOfflineStorage();
  const { isSupported: pushSupported, permission, subscription, requestPermission, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const { isOnline: networkOnline, connectionType, effectiveType, networkQuality } = useNetworkStatus();

  const [testMessage, setTestMessage] = useState('');
  const [isStoringOffline, setIsStoringOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Test offline expense storage
  const testOfflineStorage = async () => {
    if (!testMessage.trim()) return;

    setIsStoringOffline(true);
    try {
      const expense = {
        id: `test_${Date.now()}`,
        message: testMessage,
        conversationId: 'test-conversation',
        culturalContext: {
          region: 'São Paulo',
          scenario: 'test',
          groupType: 'amigos',
          timeOfDay: 'tarde'
        },
        userPreferences: {
          language: 'pt-BR',
          formalityLevel: 'informal',
          region: 'São Paulo',
          paymentPreference: 'pix'
        }
      };

      await storeOfflineExpense(expense);
      setTestMessage('');
      alert('Despesa salva offline com sucesso!');
    } catch (error) {
      console.error('Failed to store offline expense:', error);
      alert('Erro ao salvar despesa offline');
    } finally {
      setIsStoringOffline(false);
    }
  };

  // Test sync offline expenses
  const testSyncOffline = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineExpenses();
      alert('Sincronização concluída!');
    } catch (error) {
      console.error('Failed to sync offline expenses:', error);
      alert('Erro na sincronização');
    } finally {
      setIsSyncing(false);
    }
  };

  // Test push notifications
  const testPushNotifications = async () => {
    if (!pushSupported) {
      alert('Push notifications não são suportadas neste navegador');
      return;
    }

    if (permission === 'default') {
      const granted = await requestPermission();
      if (!granted) {
        alert('Permissão negada para notificações');
        return;
      }
    }

    if (permission === 'granted') {
      if (subscription) {
        await unsubscribeFromPush();
        alert('Inscrição removida');
      } else {
        await subscribeToPush();
        alert('Inscrição realizada com sucesso!');
      }
    }
  };

  // Test service worker update
  const testServiceWorkerUpdate = () => {
    if (isUpdateAvailable) {
      updateServiceWorker();
    } else {
      alert('Nenhuma atualização disponível');
    }
  };

  return (
    <>
      <Head>
        <title>RachaAI - Teste PWA</title>
        <meta name="description" content="Teste as funcionalidades PWA do RachaAI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="text-4xl mr-3">📱</div>
                <div>
                  <h1 className="text-3xl font-bold text-white">RachaAI PWA</h1>
                  <p className="text-purple-200 text-sm">Teste de Funcionalidades</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 text-sm rounded-full border backdrop-blur-sm ${
                  isInstalled 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  {isInstalled ? '✅ Instalado' : '📱 Instalável'}
                </span>
                <span className={`px-4 py-2 text-sm rounded-full border backdrop-blur-sm ${
                  networkOnline 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {networkOnline ? '📶 Online' : '📴 Offline'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* PWA Installation */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">📱 Instalação PWA</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Status de Instalação:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isInstalled ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {isInstalled ? 'Instalado' : 'Não Instalado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Pode Instalar:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isInstallable ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {isInstallable ? 'Sim' : 'Não'}
                    </span>
                  </div>

                  {isInstallable && !isInstalled && (
                    <button
                      onClick={() => setShowInstallPrompt(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      📱 Instalar App
                    </button>
                  )}

                  {isUpdateAvailable && (
                    <button
                      onClick={testServiceWorkerUpdate}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      🔄 Atualizar App
                    </button>
                  )}
                </div>
              </div>

              {/* Network Status */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">📶 Status da Rede</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Conexão:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      networkOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {networkOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Tipo de Conexão:</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {connectionType}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Qualidade:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      networkQuality === 'excellent' ? 'bg-green-500/20 text-green-300' :
                      networkQuality === 'good' ? 'bg-yellow-500/20 text-yellow-300' :
                      networkQuality === 'poor' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {networkQuality === 'excellent' ? 'Excelente' :
                       networkQuality === 'good' ? 'Boa' :
                       networkQuality === 'poor' ? 'Ruim' :
                       networkQuality === 'offline' ? 'Offline' : 'Desconhecida'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Velocidade Efetiva:</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {effectiveType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offline Storage */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">💾 Armazenamento Offline</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Despesas Offline:</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {offlineExpenses.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Digite uma mensagem de teste..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    
                    <button
                      onClick={testOfflineStorage}
                      disabled={!testMessage.trim() || isStoringOffline}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      {isStoringOffline ? '💾 Salvando...' : '💾 Salvar Offline'}
                    </button>
                    
                    <button
                      onClick={testSyncOffline}
                      disabled={offlineExpenses.length === 0 || isSyncing}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      {isSyncing ? '🔄 Sincronizando...' : '🔄 Sincronizar'}
                    </button>
                  </div>

                  {offlineExpenses.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Despesas Salvas:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {offlineExpenses.map((expense) => (
                          <div key={expense.id} className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <p className="text-white text-xs">{expense.message.substring(0, 40)}...</p>
                            <p className="text-purple-300 text-xs">{new Date(expense.timestamp).toLocaleString('pt-BR')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">🔔 Notificações Push</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Suporte:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      pushSupported ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {pushSupported ? 'Suportado' : 'Não Suportado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Permissão:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      permission === 'granted' ? 'bg-green-500/20 text-green-300' :
                      permission === 'denied' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {permission === 'granted' ? 'Concedida' :
                       permission === 'denied' ? 'Negada' : 'Pendente'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Inscrição:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      subscription ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {subscription ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {pushSupported && (
                    <button
                      onClick={testPushNotifications}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      {subscription ? '🔕 Desativar Notificações' : '🔔 Ativar Notificações'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/test"
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                💬 Testar Conversa
              </Link>
              
              <Link
                href="/offline"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                📴 Página Offline
              </Link>
              
              <Link
                href="/"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
              >
                🏠 Voltar ao Início
              </Link>
            </div>
          </div>
        </main>

        {/* PWA Install Prompt */}
        {showInstallPrompt && (
          <PWAInstallPrompt
            onInstall={() => setShowInstallPrompt(false)}
            onDismiss={() => setShowInstallPrompt(false)}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
} 