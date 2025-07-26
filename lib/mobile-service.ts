// Mobile Service for RachaAI
// Handles PWA installation, offline functionality, and Brazilian network optimization

export interface MobileConfig {
  enablePWA: boolean;
  enableOfflineMode: boolean;
  enableCameraIntegration: boolean;
  enableLocationServices: boolean;
  enablePushNotifications: boolean;
  optimizeForBrazilianNetworks: boolean;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface OfflineData {
  id: string;
  type: 'conversation' | 'payment' | 'group' | 'photo';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class MobileService {
  private static instance: MobileService;
  private config: MobileConfig;
  private networkStatus: NetworkStatus;
  private offlineData: OfflineData[] = [];
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.config = {
      enablePWA: true,
      enableOfflineMode: true,
      enableCameraIntegration: true,
      enableLocationServices: true,
      enablePushNotifications: true,
      optimizeForBrazilianNetworks: true,
    };

    this.networkStatus = {
      isOnline: navigator.onLine,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
    };

    this.initialize();
  }

  public static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  private async initialize() {
    await this.registerServiceWorker();
    this.setupNetworkMonitoring();
    this.setupOfflineDataManagement();
    this.loadOfflineData();
  }

  // Service Worker Registration
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.serviceWorkerRegistration);
        
        // Handle service worker updates
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorkerRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Network Monitoring
  private setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());

    // Monitor connection quality (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', () => this.updateNetworkStatus());
      }
    }

    this.updateNetworkStatus();
  }

  private updateNetworkStatus() {
    const connection = (navigator as any).connection;
    
    this.networkStatus = {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
    };

    // Trigger network status change events
    this.onNetworkStatusChange();
  }

  private onNetworkStatusChange() {
    // Sync offline data when connection is restored
    if (this.networkStatus.isOnline) {
      this.syncOfflineData();
    }

    // Optimize for Brazilian network conditions
    if (this.config.optimizeForBrazilianNetworks) {
      this.optimizeForBrazilianNetworks();
    }
  }

  // Brazilian Network Optimization
  private optimizeForBrazilianNetworks() {
    const { effectiveType, downlink } = this.networkStatus;
    
    // Apply optimizations based on network quality
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
      this.applySlowNetworkOptimizations();
    } else if (effectiveType === '3g' || downlink < 5) {
      this.applyMediumNetworkOptimizations();
    } else {
      this.applyFastNetworkOptimizations();
    }
  }

  private applySlowNetworkOptimizations() {
    // Reduce image quality
    document.documentElement.style.setProperty('--image-quality', '0.5');
    
    // Reduce animations
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    
    // Enable offline mode
    this.config.enableOfflineMode = true;
    
    console.log('Applied slow network optimizations');
  }

  private applyMediumNetworkOptimizations() {
    // Medium image quality
    document.documentElement.style.setProperty('--image-quality', '0.7');
    
    // Normal animations
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    
    console.log('Applied medium network optimizations');
  }

  private applyFastNetworkOptimizations() {
    // High image quality
    document.documentElement.style.setProperty('--image-quality', '0.9');
    
    // Full animations
    document.documentElement.style.setProperty('--animation-duration', '0.5s');
    
    console.log('Applied fast network optimizations');
  }

  // Offline Data Management
  private setupOfflineDataManagement() {
    // Save data when going offline
    window.addEventListener('beforeunload', () => {
      this.saveOfflineData();
    });
  }

  private loadOfflineData() {
    try {
      const stored = localStorage.getItem('rachaai_offline_data');
      if (stored) {
        this.offlineData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  private saveOfflineData() {
    try {
      localStorage.setItem('rachaai_offline_data', JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  public addOfflineData(type: OfflineData['type'], data: any): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    this.offlineData.push(offlineData);
    this.saveOfflineData();

    return id;
  }

  public async syncOfflineData(): Promise<void> {
    if (!this.networkStatus.isOnline) return;

    const unsyncedData = this.offlineData.filter(item => !item.synced);
    
    for (const item of unsyncedData) {
      try {
        await this.syncOfflineItem(item);
        item.synced = true;
      } catch (error) {
        console.error('Failed to sync offline item:', item.id, error);
      }
    }

    this.saveOfflineData();
  }

  private async syncOfflineItem(item: OfflineData): Promise<void> {
    // Implement API calls to sync data
    switch (item.type) {
      case 'conversation':
        // Sync conversation data
        break;
      case 'payment':
        // Sync payment data
        break;
      case 'group':
        // Sync group data
        break;
      case 'photo':
        // Sync photo data
        break;
    }
  }

  // PWA Installation
  public async installPWA(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service Worker not registered');
      return false;
    }

    try {
      // Check if PWA is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA already installed');
        return true;
      }

      // Trigger install prompt
      const promptEvent = await this.waitForInstallPrompt();
      if (promptEvent) {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        return outcome === 'accepted';
      }

      return false;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  private waitForInstallPrompt(): Promise<any> {
    return new Promise((resolve) => {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        resolve(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }

  // Push Notifications
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  public async sendNotification(title: string, options: NotificationOptions = {}) {
    if (!this.config.enablePushNotifications) return;

    const permission = await this.requestNotificationPermission();
    if (!permission) return;

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      ...options,
    };

    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.showNotification) {
      await this.serviceWorkerRegistration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Camera Integration
  public async capturePhoto(): Promise<string | null> {
    if (!this.config.enableCameraIntegration) {
      throw new Error('Camera integration not enabled');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        video.addEventListener('loadedmetadata', () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          context?.drawImage(video, 0, 0);
          const photoData = canvas.toDataURL('image/jpeg', 0.8);
          
          stream.getTracks().forEach(track => track.stop());
          resolve(photoData);
        });

        video.addEventListener('error', reject);
      });
    } catch (error) {
      console.error('Camera capture failed:', error);
      throw error;
    }
  }

  // Location Services
  public async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    if (!this.config.enableLocationServices) {
      throw new Error('Location services not enabled');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Utility Methods
  public getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  public isOffline(): boolean {
    return !navigator.onLine;
  }

  public getOfflineData(): OfflineData[] {
    return [...this.offlineData];
  }

  public updateConfig(newConfig: Partial<MobileConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  private showUpdateNotification() {
    // Show update notification to user
    this.sendNotification('RachaAI Atualizado', {
      body: 'Uma nova versão está disponível. Recarregue a página para atualizar.',
      actions: [
        {
          action: 'reload',
          title: 'Recarregar',
        },
        {
          action: 'close',
          title: 'Fechar',
        },
      ],
    });
  }
}

export default MobileService; 