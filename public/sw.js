// RachaAI Service Worker - Brazilian Network Optimization
const CACHE_NAME = 'rachaai-v1.0.0';
const OFFLINE_CACHE = 'rachaai-offline-v1.0.0';

// Brazilian network optimization - cache critical resources
const CRITICAL_RESOURCES = [
  '/',
  '/test',
  '/manifest.json',
  '/styles/globals.css',
  '/api/ai/chat',
  '/api/auth/signin',
  '/api/auth/signup'
];

// Offline expense tracking cache
const OFFLINE_EXPENSES_KEY = 'rachaai-offline-expenses';

// Brazilian network conditions detection
const NETWORK_CONDITIONS = {
  EXCELLENT: 'excellent', // 4G/5G
  GOOD: 'good',           // 3G
  POOR: 'poor',           // 2G/Edge
  OFFLINE: 'offline'      // No connection
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('RachaAI Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('RachaAI Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('RachaAI Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('RachaAI Service Worker: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('RachaAI Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log('RachaAI Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('RachaAI Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - network-first with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with offline expense tracking
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static resources with cache-first strategy
  if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request));
    return;
  }

  // Handle navigation requests with network-first strategy
  event.respondWith(handleNavigationRequest(request));
});

// Handle API requests with offline expense tracking
async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('RachaAI Service Worker: Network failed, checking cache');
    
    // Check cache for API responses
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // For chat API, provide offline response
    if (request.url.includes('/api/ai/chat')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sem conexão com a internet. Suas despesas serão salvas offline.',
        offline: true,
        data: {
          content: 'Estou offline no momento. Suas despesas serão salvas e sincronizadas quando a conexão for restaurada.',
          modelUsed: 'offline',
          costBRL: 0,
          cached: false
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For other APIs, return offline response
    return new Response(JSON.stringify({
      success: false,
      error: 'Serviço indisponível offline',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static resources with cache-first strategy
async function handleStaticResource(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response);
      }
    });
    
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('RachaAI Service Worker: Navigation failed, serving offline page');
    
    // Check cache for navigation
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page
    return caches.match('/offline');
  }
}

// Check if request is for static resources
function isStaticResource(request) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  const url = new URL(request.url);
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.startsWith('/_next/') ||
         url.pathname.startsWith('/static/');
}

// Background sync for offline expenses
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-expenses') {
    console.log('RachaAI Service Worker: Syncing offline expenses');
    event.waitUntil(syncOfflineExpenses());
  }
});

// Sync offline expenses when connection is restored
async function syncOfflineExpenses() {
  try {
    // Get offline expenses from IndexedDB
    const offlineExpenses = await getOfflineExpenses();
    
    if (offlineExpenses.length === 0) {
      return;
    }
    
    console.log('RachaAI Service Worker: Syncing', offlineExpenses.length, 'offline expenses');
    
    // Sync each offline expense
    for (const expense of offlineExpenses) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expense)
        });
        
        if (response.ok) {
          // Remove synced expense from offline storage
          await removeOfflineExpense(expense.id);
          console.log('RachaAI Service Worker: Synced expense', expense.id);
        }
      } catch (error) {
        console.error('RachaAI Service Worker: Failed to sync expense', expense.id, error);
      }
    }
  } catch (error) {
    console.error('RachaAI Service Worker: Sync failed', error);
  }
}

// Store expense for offline sync
async function storeOfflineExpense(expense) {
  try {
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
    
    console.log('RachaAI Service Worker: Stored offline expense', expense.id);
  } catch (error) {
    console.error('RachaAI Service Worker: Failed to store offline expense', error);
  }
}

// Get offline expenses
async function getOfflineExpenses() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineExpenses'], 'readonly');
    const store = transaction.objectStore('offlineExpenses');
    
    return await store.getAll();
  } catch (error) {
    console.error('RachaAI Service Worker: Failed to get offline expenses', error);
    return [];
  }
}

// Remove offline expense
async function removeOfflineExpense(id) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineExpenses'], 'readwrite');
    const store = transaction.objectStore('offlineExpenses');
    
    await store.delete(id);
  } catch (error) {
    console.error('RachaAI Service Worker: Failed to remove offline expense', error);
  }
}

// Open IndexedDB for offline storage
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RachaAIOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create offline expenses store
      if (!db.objectStoreNames.contains('offlineExpenses')) {
        const store = db.createObjectStore('offlineExpenses', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Push notification handling for Brazilian users
self.addEventListener('push', (event) => {
  console.log('RachaAI Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do RachaAI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('RachaAI', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('RachaAI Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/test')
    );
  }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'STORE_OFFLINE_EXPENSE') {
    event.waitUntil(storeOfflineExpense(event.data.expense));
  }
  
  if (event.data && event.data.type === 'SYNC_OFFLINE_EXPENSES') {
    event.waitUntil(syncOfflineExpenses());
  }
});

console.log('RachaAI Service Worker: Loaded successfully'); 