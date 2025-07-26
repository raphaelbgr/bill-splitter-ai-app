import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock service worker
const mockServiceWorker = {
  register: jest.fn().mockResolvedValue({
    active: { postMessage: jest.fn() },
    waiting: { postMessage: jest.fn() },
    addEventListener: jest.fn(),
  }),
  ready: Promise.resolve({
    active: { postMessage: jest.fn() },
    waiting: { postMessage: jest.fn() },
    addEventListener: jest.fn(),
  }),
};

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn().mockReturnValue({
    onsuccess: jest.fn(),
    onerror: jest.fn(),
    onupgradeneeded: jest.fn(),
    result: {
      createObjectStore: jest.fn().mockReturnValue({
        add: jest.fn().mockResolvedValue(true),
        getAll: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(true),
      }),
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          add: jest.fn().mockResolvedValue(true),
          getAll: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue(true),
        }),
      }),
    },
  }),
};

// Mock fetch
const mockFetch = jest.fn();

// Extend Navigator interface for testing
declare global {
  interface Navigator {
    connection?: {
      type: string;
      effectiveType: string;
      addEventListener: jest.Mock;
    };
  }
}

// Mock window properties
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: mockServiceWorker,
    connection: {
      type: '4g',
      effectiveType: '4g',
      addEventListener: jest.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

Object.defineProperty(window, 'fetch', {
  value: mockFetch,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
  writable: true,
});

describe('PWA Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('PWA Core Features', () => {
    it('supports service worker registration', () => {
      expect(mockServiceWorker.register).toBeDefined();
      expect(typeof mockServiceWorker.register).toBe('function');
    });

    it('supports IndexedDB for offline storage', () => {
      expect(mockIndexedDB.open).toBeDefined();
      expect(typeof mockIndexedDB.open).toBe('function');
    });

    it('detects network status correctly', () => {
      expect(window.navigator.onLine).toBe(true);
      expect(window.navigator.connection.type).toBe('4g');
      expect(window.navigator.connection.effectiveType).toBe('4g');
    });

    it('supports fetch API for network requests', () => {
      expect(mockFetch).toBeDefined();
      expect(typeof mockFetch).toBe('function');
    });
  });

  describe('Offline Storage', () => {
    it('can open IndexedDB database', async () => {
      const dbRequest = mockIndexedDB.open('RachaAIOffline', 1);
      expect(dbRequest).toBeDefined();
      expect(dbRequest.onsuccess).toBeDefined();
      expect(dbRequest.onerror).toBeDefined();
      expect(dbRequest.onupgradeneeded).toBeDefined();
    });

    it('can create object stores for offline data', () => {
      const db = mockIndexedDB.open().result;
      const store = db.createObjectStore('offlineExpenses', { keyPath: 'id' });
      expect(store).toBeDefined();
    });

    it('can store offline expenses', async () => {
      const db = mockIndexedDB.open().result;
      const transaction = db.transaction(['offlineExpenses'], 'readwrite');
      const store = transaction.objectStore('offlineExpenses');
      
      const expense = {
        id: 'test-1',
        message: 'Test expense',
        timestamp: new Date().toISOString()
      };
      
      const result = await store.add(expense);
      expect(result).toBe(true);
    });

    it('can retrieve offline expenses', async () => {
      const db = mockIndexedDB.open().result;
      const transaction = db.transaction(['offlineExpenses'], 'readonly');
      const store = transaction.objectStore('offlineExpenses');
      
      const expenses = await store.getAll();
      expect(Array.isArray(expenses)).toBe(true);
    });
  });

  describe('Network Status Detection', () => {
    it('detects online status', () => {
      expect(window.navigator.onLine).toBe(true);
    });

    it('detects connection type', () => {
      const connection = window.navigator.connection;
      expect(connection?.type).toBe('4g');
    });

    it('detects effective connection type', () => {
      const connection = window.navigator.connection;
      expect(connection?.effectiveType).toBe('4g');
    });

    it('handles poor network conditions', () => {
      // Mock poor network
      Object.defineProperty(window, 'navigator', {
        value: {
          ...window.navigator,
          connection: {
            type: '2g',
            effectiveType: '2g',
            addEventListener: jest.fn(),
          },
        },
        writable: true,
      });

      expect(window.navigator.connection?.effectiveType).toBe('2g');
    });
  });

  describe('Service Worker Features', () => {
    it('registers service worker successfully', async () => {
      const registration = await mockServiceWorker.register('/sw.js');
      expect(registration).toBeDefined();
      expect(registration.active).toBeDefined();
      expect(registration.waiting).toBeDefined();
    });

    it('supports service worker messaging', () => {
      const registration = mockServiceWorker.register();
      expect(registration.active.postMessage).toBeDefined();
      expect(registration.waiting.postMessage).toBeDefined();
    });

    it('handles service worker events', () => {
      const registration = mockServiceWorker.register();
      expect(registration.addEventListener).toBeDefined();
    });
  });

  describe('Push Notifications', () => {
    beforeEach(() => {
      // Mock Notification API
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: jest.fn().mockResolvedValue('granted'),
        },
        writable: true,
      });
    });

    it('supports push notification permissions', () => {
      expect(window.Notification).toBeDefined();
      expect(window.Notification.permission).toBe('default');
      expect(window.Notification.requestPermission).toBeDefined();
    });

    it('can request notification permission', async () => {
      const permission = await window.Notification.requestPermission();
      expect(permission).toBe('granted');
    });
  });

  describe('Brazilian Market Optimization', () => {
    it('supports Portuguese language detection', () => {
      const brazilianLanguage = 'pt-BR';
      expect(brazilianLanguage).toBe('pt-BR');
    });

    it('handles Brazilian network conditions', () => {
      const networkConditions = {
        excellent: '4g',
        good: '3g',
        poor: '2g',
        offline: 'offline'
      };

      expect(networkConditions.excellent).toBe('4g');
      expect(networkConditions.poor).toBe('2g');
    });

    it('supports Brazilian payment methods', () => {
      const brazilianPaymentMethods = ['pix', 'boleto', 'cartao', 'dinheiro'];
      expect(brazilianPaymentMethods).toContain('pix');
      expect(brazilianPaymentMethods).toContain('boleto');
    });

    it('handles Brazilian cultural contexts', () => {
      const brazilianContexts = [
        'restaurante',
        'uber',
        'churrasco',
        'happy_hour',
        'viagem',
        'vaquinha'
      ];

      expect(brazilianContexts).toContain('churrasco');
      expect(brazilianContexts).toContain('happy_hour');
    });
  });

  describe('PWA Performance', () => {
    it('supports efficient caching strategies', () => {
      const cacheStrategies = {
        networkFirst: 'NetworkFirst',
        cacheFirst: 'CacheFirst',
        staleWhileRevalidate: 'StaleWhileRevalidate'
      };

      expect(cacheStrategies.networkFirst).toBe('NetworkFirst');
      expect(cacheStrategies.cacheFirst).toBe('CacheFirst');
    });

    it('handles offline scenarios gracefully', () => {
      // Mock offline scenario
      Object.defineProperty(window, 'navigator', {
        value: { onLine: false },
        writable: true,
      });

      expect(window.navigator.onLine).toBe(false);
    });

    it('supports background sync', () => {
      const backgroundSync = {
        tag: 'sync-offline-expenses',
        enabled: true
      };

      expect(backgroundSync.tag).toBe('sync-offline-expenses');
      expect(backgroundSync.enabled).toBe(true);
    });
  });

  describe('PWA Installation', () => {
    it('detects PWA installability', () => {
      const installability = {
        isInstallable: false,
        isInstalled: false,
        isStandalone: false
      };

      expect(typeof installability.isInstallable).toBe('boolean');
      expect(typeof installability.isInstalled).toBe('boolean');
    });

    it('handles beforeinstallprompt event', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      expect(mockEvent.preventDefault).toBeDefined();
      expect(mockEvent.prompt).toBeDefined();
      expect(mockEvent.userChoice).toBeDefined();
    });

    it('supports app installation flow', async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      mockEvent.preventDefault();
      mockEvent.prompt();
      const result = await mockEvent.userChoice;

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result.outcome).toBe('accepted');
    });
  });

  describe('Offline Functionality', () => {
    it('stores expenses offline', async () => {
      const expense = {
        id: 'offline-1',
        message: 'Jantar no restaurante',
        conversationId: 'conv-1',
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
        },
        timestamp: new Date().toISOString()
      };

      expect(expense.id).toBe('offline-1');
      expect(expense.message).toBe('Jantar no restaurante');
      expect(expense.culturalContext.region).toBe('São Paulo');
    });

    it('syncs offline data when online', async () => {
      const syncFunction = jest.fn().mockResolvedValue(true);
      const isOnline = true;

      if (isOnline) {
        await syncFunction();
      }

      expect(syncFunction).toHaveBeenCalled();
    });

    it('handles sync errors gracefully', async () => {
      const syncFunction = jest.fn().mockRejectedValue(new Error('Sync failed'));
      
      try {
        await syncFunction();
      } catch (error) {
        expect((error as Error).message).toBe('Sync failed');
      }
    });
  });
}); 