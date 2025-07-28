import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [offlineExpenses, setOfflineExpenses] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Load offline expenses
    loadOfflineExpenses();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const loadOfflineExpenses = async () => {
    try {
      if ('serviceWorker' in navigator && 'indexedDB' in window) {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineExpenses'], 'readonly');
        const store = transaction.objectStore('offlineExpenses');
        const expenses = await store.getAll();
        setOfflineExpenses(expenses);
      }
    } catch (error) {
      console.error('Failed to load offline expenses:', error);
    }
  };

  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RachaAIOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offlineExpenses')) {
          const store = db.createObjectStore('offlineExpenses', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  };

  const syncOfflineExpenses = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      // Send message to service worker to sync
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'SYNC_OFFLINE_EXPENSES'
        });
      }

      // Wait a bit for sync to complete
      setTimeout(() => {
        loadOfflineExpenses();
        setIsSyncing(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to sync offline expenses:', error);
      setIsSyncing(false);
    }
  };

  const retryConnection = () => {
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>RachaAI - Modo Offline</title>
        <meta name="description" content="RachaAI está offline. Suas despesas serão sincronizadas quando a conexão for restaurada." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {/* Status Indicator */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'
            } border-2`}>
              <div className={`text-3xl ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? '📶' : '📴'}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isOnline ? 'Conexão Restaurada!' : 'Modo Offline'}
            </h1>
            <p className="text-purple-200 text-sm">
              {isOnline 
                ? 'Você está online novamente. Sincronizando despesas...'
                : 'Sem conexão com a internet. Suas despesas estão salvas offline.'
              }
            </p>
          </div>

          {/* Offline Expenses */}
          {offlineExpenses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Despesas Offline ({offlineExpenses.length})
              </h2>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {offlineExpenses.map((expense) => (
                  <div key={expense.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white text-sm mb-1">
                      {expense.message.substring(0, 50)}...
                    </p>
                    <p className="text-purple-300 text-xs">
                      {new Date(expense.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {isOnline ? (
              <button
                onClick={syncOfflineExpenses}
                disabled={isSyncing}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    🔄 Sincronizar Despesas
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={retryConnection}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                🔄 Tentar Novamente
              </button>
            )}

            <Link
              href="/test"
              className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-center"
            >
              💬 Continuar Conversando
            </Link>

            <Link
              href="/"
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-center border border-white/20"
            >
              🏠 Voltar ao Início
            </Link>
          </div>

          {/* Offline Features Info */}
          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-2">✅ Funcionalidades Offline</h3>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Suas despesas são salvas automaticamente</li>
              <li>• Sincronização automática quando online</li>
              <li>• Interface conversacional funciona offline</li>
              <li>• Histórico de grupos preservado</li>
            </ul>
          </div>

          {/* Network Status */}
          <div className="mt-4 text-center">
            <p className="text-purple-300 text-xs">
              Status da Rede: {isOnline ? 'Online' : 'Offline'}
            </p>
            {!isOnline && (
              <p className="text-red-300 text-xs mt-1">
                Verifique sua conexão com a internet
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
} 