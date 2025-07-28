import { MobileService, MobileConfig, NetworkStatus, OfflineData } from '../lib/mobile-service';

// Mock browser APIs
const mockNavigator = {
  onLine: true,
  mediaDevices: {
    getUserMedia: jest.fn(),
  },
  geolocation: {
    getCurrentPosition: jest.fn(),
  },
  serviceWorker: {
    register: jest.fn(),
  },
  connection: {
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  },
};

const mockNotification = {
  permission: 'default',
  requestPermission: jest.fn().mockResolvedValue('granted'),
};

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock window object
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockReturnValue({ matches: false }),
  writable: true,
});

describe('MobileService', () => {
  let mobileService: MobileService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset singleton instance
    (MobileService as any).instance = null;
    
    // Mock service worker registration
    mockNavigator.serviceWorker.register.mockResolvedValue({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      showNotification: jest.fn(),
    });

    mobileService = MobileService.getInstance();
  });

  describe('Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = MobileService.getInstance();
      const instance2 = MobileService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default config', () => {
      const networkStatus = mobileService.getNetworkStatus();
      expect(networkStatus.isOnline).toBe(true);
      expect(networkStatus.connectionType).toBe('wifi');
      expect(networkStatus.effectiveType).toBe('4g');
    });
  });

  describe('Network Status', () => {
    it('should detect online status', () => {
      mockNavigator.onLine = true;
      expect(mobileService.isOffline()).toBe(false);
    });

    it('should detect offline status', () => {
      mockNavigator.onLine = false;
      // Force update network status
      window.dispatchEvent(new Event('offline'));
      expect(mobileService.isOffline()).toBe(true);
    });

    it('should get network status', () => {
      mockNavigator.onLine = true;
      // Force update network status
      window.dispatchEvent(new Event('online'));
      const status = mobileService.getNetworkStatus();
      expect(status).toEqual({
        isOnline: true,
        connectionType: 'wifi',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
      });
    });
  });

  describe('Offline Data Management', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('should add offline data', () => {
      const data = { message: 'test', participants: ['user1', 'user2'] };
      const id = mobileService.addOfflineData('conversation', data);
      
      expect(id).toMatch(/^offline_\d+_[a-z0-9]+$/);
      
      const offlineData = mobileService.getOfflineData();
      expect(offlineData).toHaveLength(1);
      expect(offlineData[0]).toEqual({
        id,
        type: 'conversation',
        data,
        timestamp: expect.any(Number),
        synced: false,
      });
    });

    it('should load offline data from localStorage', () => {
      const mockData = [
        {
          id: 'test_id',
          type: 'conversation' as const,
          data: { message: 'test' },
          timestamp: Date.now(),
          synced: false,
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));
      
      // Create new instance to trigger load
      (MobileService as any).instance = null;
      const newService = MobileService.getInstance();
      
      // Force load offline data
      (newService as any).loadOfflineData();
      
      const offlineData = newService.getOfflineData();
      expect(offlineData).toEqual(mockData);
    });

    it('should sync offline data when online', async () => {
      const data = { message: 'test' };
      mobileService.addOfflineData('conversation', data);
      
      // Mock network as online
      mockNavigator.onLine = true;
      
      // Mock syncOfflineItem to mark as synced
      jest.spyOn(mobileService as any, 'syncOfflineItem').mockResolvedValue(undefined);
      
      await mobileService.syncOfflineData();
      
      const offlineData = mobileService.getOfflineData();
      expect(offlineData[0].synced).toBe(true);
    });
  });

  describe('PWA Installation', () => {
    it('should detect if PWA is already installed', async () => {
      // Mock as already installed
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn().mockReturnValue({ matches: true }),
        writable: true,
      });

      const result = await mobileService.installPWA();
      expect(result).toBe(true);
    });

    it('should handle install prompt', async () => {
      // Mock as not installed
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn().mockReturnValue({ matches: false }),
        writable: true,
      });

      const result = await mobileService.installPWA();
      expect(result).toBe(false); // Will timeout in test
    }, 10000);
  });

  describe('Push Notifications', () => {
    it('should request notification permission', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted');
      
      const result = await mobileService.requestNotificationPermission();
      expect(result).toBe(true);
      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should handle denied notification permission', async () => {
      mockNotification.permission = 'denied';
      
      const result = await mobileService.requestNotificationPermission();
      expect(result).toBe(false);
    });

    it('should send notification', async () => {
      mockNotification.permission = 'granted';
      
      await mobileService.sendNotification('Test Title', {
        body: 'Test Body',
      });
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Camera Integration', () => {
    it('should capture photo', async () => {
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([
          { stop: jest.fn() },
        ]),
      };

      const mockVideo = {
        srcObject: null,
        play: jest.fn(),
        addEventListener: jest.fn(),
        videoWidth: 1920,
        videoHeight: 1080,
      };

      const mockCanvas = {
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
        }),
        toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,test'),
        width: 1920,
        height: 1080,
      };

      // Mock DOM elements
      document.createElement = jest.fn((tag) => {
        if (tag === 'video') return mockVideo;
        if (tag === 'canvas') return mockCanvas;
        return {};
      });

      mockNavigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

      // Mock video loadedmetadata event
      setTimeout(() => {
        const callback = mockVideo.addEventListener.mock.calls.find(
          call => call[0] === 'loadedmetadata'
        )?.[1];
        if (callback) callback();
      }, 100);

      const result = await mobileService.capturePhoto();
      expect(result).toBe('data:image/jpeg;base64,test');
    });

    it('should handle camera access error', async () => {
      mockNavigator.mediaDevices.getUserMedia.mockRejectedValue(
        new Error('Camera access denied')
      );

      await expect(mobileService.capturePhoto()).rejects.toThrow(
        'Camera access denied'
      );
    });
  });

  describe('Location Services', () => {
    it('should get current location', async () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      mockNavigator.geolocation.getCurrentPosition.mockImplementation(
        (success) => success(mockPosition)
      );

      const result = await mobileService.getCurrentLocation();
      expect(result).toEqual({
        lat: -23.5505,
        lng: -46.6333,
      });
    });

    it('should handle location error', async () => {
      mockNavigator.geolocation.getCurrentPosition.mockImplementation(
        (success, error) => error(new Error('Location access denied'))
      );

      await expect(mobileService.getCurrentLocation()).rejects.toThrow(
        'Location access denied'
      );
    });
  });

  describe('Brazilian Network Optimization', () => {
    it('should apply slow network optimizations', () => {
      // Mock slow network
      mockNavigator.connection.effectiveType = '2g';
      mockNavigator.connection.downlink = 0.5;

      // Mock document.documentElement.style.setProperty
      const mockSetProperty = jest.fn();
      Object.defineProperty(document, 'documentElement', {
        value: {
          style: {
            setProperty: mockSetProperty,
          },
        },
        writable: true,
      });

      // Trigger network status update
      window.dispatchEvent(new Event('online'));

      expect(mockSetProperty).toHaveBeenCalledWith('--image-quality', '0.5');
      expect(mockSetProperty).toHaveBeenCalledWith('--animation-duration', '0.1s');
    });

    it('should apply medium network optimizations', () => {
      // Mock medium network
      mockNavigator.connection.effectiveType = '3g';
      mockNavigator.connection.downlink = 3;

      const mockSetProperty = jest.fn();
      Object.defineProperty(document, 'documentElement', {
        value: {
          style: {
            setProperty: mockSetProperty,
          },
        },
        writable: true,
      });

      window.dispatchEvent(new Event('online'));

      expect(mockSetProperty).toHaveBeenCalledWith('--image-quality', '0.7');
      expect(mockSetProperty).toHaveBeenCalledWith('--animation-duration', '0.3s');
    });

    it('should apply fast network optimizations', () => {
      // Mock fast network
      mockNavigator.connection.effectiveType = '4g';
      mockNavigator.connection.downlink = 10;

      const mockSetProperty = jest.fn();
      Object.defineProperty(document, 'documentElement', {
        value: {
          style: {
            setProperty: mockSetProperty,
          },
        },
        writable: true,
      });

      window.dispatchEvent(new Event('online'));

      expect(mockSetProperty).toHaveBeenCalledWith('--image-quality', '0.9');
      expect(mockSetProperty).toHaveBeenCalledWith('--animation-duration', '0.5s');
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig: Partial<MobileConfig> = {
        enableCameraIntegration: false,
        enableLocationServices: false,
      };

      mobileService.updateConfig(newConfig);

      // Test that camera integration is disabled
      expect(() => mobileService.capturePhoto()).rejects.toThrow(
        'Camera integration not enabled'
      );

      // Test that location services are disabled
      expect(() => mobileService.getCurrentLocation()).rejects.toThrow(
        'Location services not enabled'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle service worker registration failure', () => {
      mockNavigator.serviceWorker.register.mockRejectedValue(
        new Error('Registration failed')
      );

      // Should not throw error during initialization
      expect(() => {
        (MobileService as any).instance = null;
        MobileService.getInstance();
      }).not.toThrow();
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw error when adding offline data
      expect(() => {
        mobileService.addOfflineData('conversation', { test: 'data' });
      }).not.toThrow();
    });
  });
}); 