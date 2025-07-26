import { useState, useEffect, useCallback } from 'react';

// PWA Installation Hook
export function usePWAInstallation() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    installPWA
  };
}

// Service Worker Hook
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return {
    registration,
    isOnline,
    isUpdateAvailable,
    updateServiceWorker
  };
}

// Offline Storage Hook
export function useOfflineStorage() {
  const [offlineExpenses, setOfflineExpenses] = useState<any[]>([]);

  const openIndexedDB = useCallback((): Promise<IDBDatabase> => {
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
  }, []);

  const storeOfflineExpense = useCallback(async (expense: any) => {
    try {
      if ('indexedDB' in window) {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineExpenses'], 'readwrite');
        const store = transaction.objectStore('offlineExpenses');
        
        await store.add({
          id: expense.id || Date.now().toString(),
          message: expense.message,
          conversationId: expense.conversationId,
          culturalContext: expense.culturalContext,
          userPreferences: expense.userPreferences,
          timestamp: new Date().toISOString()
        });
        
        // Update local state
        setOfflineExpenses(prev => [...prev, expense]);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to store offline expense:', error);
      return false;
    }
  }, [openIndexedDB]);

  const getOfflineExpenses = useCallback(async () => {
    try {
      if ('indexedDB' in window) {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineExpenses'], 'readonly');
        const store = transaction.objectStore('offlineExpenses');
        
        const expenses = await store.getAll();
        setOfflineExpenses(expenses);
        return expenses;
      }
      return [];
    } catch (error) {
      console.error('Failed to get offline expenses:', error);
      return [];
    }
  }, [openIndexedDB]);

  const removeOfflineExpense = useCallback(async (id: string) => {
    try {
      if ('indexedDB' in window) {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineExpenses'], 'readwrite');
        const store = transaction.objectStore('offlineExpenses');
        
        await store.delete(id);
        
        // Update local state
        setOfflineExpenses(prev => prev.filter(expense => expense.id !== id));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove offline expense:', error);
      return false;
    }
  }, [openIndexedDB]);

  const syncOfflineExpenses = useCallback(async () => {
    try {
      const expenses = await getOfflineExpenses();
      
      for (const expense of expenses) {
        try {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(expense)
          });
          
          if (response.ok) {
            await removeOfflineExpense(expense.id);
          }
        } catch (error) {
          console.error('Failed to sync expense:', expense.id, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline expenses:', error);
    }
  }, [getOfflineExpenses, removeOfflineExpense]);

  // Load offline expenses on mount
  useEffect(() => {
    getOfflineExpenses();
  }, [getOfflineExpenses]);

  return {
    offlineExpenses,
    storeOfflineExpense,
    getOfflineExpenses,
    removeOfflineExpense,
    syncOfflineExpenses
  };
}

// Push Notifications Hook
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return true;
      }

      // Get VAPID public key from server
      const response = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await response.json();

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      setSubscription(newSubscription);

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: newSubscription.toJSON()
        })
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [isSupported, permission]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush
  };
}

// Network Status Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('unknown');

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection?.type || 'unknown');
        setEffectiveType(connection?.effectiveType || 'unknown');
      }
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const getNetworkQuality = useCallback(() => {
    if (!isOnline) return 'offline';
    
    switch (effectiveType) {
      case '4g':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
      case 'slow-2g':
        return 'poor';
      default:
        return 'unknown';
    }
  }, [isOnline, effectiveType]);

  return {
    isOnline,
    connectionType,
    effectiveType,
    networkQuality: getNetworkQuality()
  };
} 