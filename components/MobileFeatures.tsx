import React, { useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, Wifi, WifiOff, Upload, Download } from 'lucide-react';

interface MobileFeaturesProps {
  onPhotoCapture?: (photoData: string) => void;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  onOfflineStatusChange?: (isOffline: boolean) => void;
}

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
}

export const MobileFeatures: React.FC<MobileFeaturesProps> = ({
  onPhotoCapture,
  onLocationUpdate,
  onOfflineStatusChange,
}) => {
  const [isCameraSupported, setIsCameraSupported] = useState(false);
  const [isLocationSupported, setIsLocationSupported] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
  });
  const [isOffline, setIsOffline] = useState(false);
  const [offlineData, setOfflineData] = useState<any[]>([]);

  // Check for mobile device features
  useEffect(() => {
    // Check camera support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(true);
    }

    // Check location support
    if (navigator.geolocation) {
      setIsLocationSupported(true);
    }

    // Monitor network status
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      setNetworkStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Handle offline mode
  useEffect(() => {
    const handleOfflineMode = () => {
      const shouldUseOffline = !networkStatus.isOnline || 
        networkStatus.effectiveType === 'slow-2g' || 
        networkStatus.effectiveType === '2g';
      
      setIsOffline(shouldUseOffline);
      onOfflineStatusChange?.(shouldUseOffline);
    };

    handleOfflineMode();
  }, [networkStatus, onOfflineStatusChange]);

  // Camera integration for receipt capture
  const capturePhoto = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context?.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        
        stream.getTracks().forEach(track => track.stop());
        onPhotoCapture?.(photoData);
      });
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Erro ao acessar câmera. Verifique as permissões.');
    }
  }, [onPhotoCapture]);

  // Location services for expense tracking
  const getCurrentLocation = useCallback(() => {
    if (!isLocationSupported) {
      alert('Localização não suportada neste dispositivo.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationUpdate?.(location);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Erro ao obter localização. Verifique as permissões.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [isLocationSupported, onLocationUpdate]);

  // Offline data management
  const saveOfflineData = useCallback((data: any) => {
    const offlineKey = `offline_data_${Date.now()}`;
    localStorage.setItem(offlineKey, JSON.stringify(data));
    setOfflineData(prev => [...prev, { key: offlineKey, data, timestamp: Date.now() }]);
  }, []);

  const syncOfflineData = useCallback(async () => {
    if (!networkStatus.isOnline) return;

    const offlineKeys = Object.keys(localStorage).filter(key => key.startsWith('offline_data_'));
    
    for (const key of offlineKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        // Here you would sync with your API
        console.log('Syncing offline data:', data);
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error syncing offline data:', error);
      }
    }
  }, [networkStatus.isOnline]);

  // Brazilian network optimization
  const getNetworkOptimization = () => {
    if (networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g') {
      return {
        reduceImageQuality: true,
        reduceContextLength: true,
        useFasterModel: true,
        enableOfflineMode: true,
      };
    }
    return {
      reduceImageQuality: false,
      reduceContextLength: false,
      useFasterModel: false,
      enableOfflineMode: false,
    };
  };

  const optimization = getNetworkOptimization();

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📱 Recursos Mobile
      </h3>

      {/* Network Status */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        {networkStatus.isOnline ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-600" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {networkStatus.isOnline ? 'Online' : 'Offline'}
          </p>
          <p className="text-xs text-gray-500">
            {networkStatus.connectionType} - {networkStatus.effectiveType}
          </p>
        </div>
        {isOffline && (
          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Modo Offline
          </div>
        )}
      </div>

      {/* Mobile Features */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera Feature */}
        <button
          onClick={capturePhoto}
          disabled={!isCameraSupported}
          className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Camera className="w-6 h-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">Foto do Recibo</span>
          <span className="text-xs text-gray-500">Capturar recibo</span>
        </button>

        {/* Location Feature */}
        <button
          onClick={getCurrentLocation}
          disabled={!isLocationSupported}
          className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <MapPin className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-gray-900">Localização</span>
          <span className="text-xs text-gray-500">Adicionar local</span>
        </button>
      </div>

      {/* Offline Data Management */}
      {isOffline && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Dados Salvos Offline
            </span>
          </div>
          <p className="text-xs text-yellow-700 mb-2">
            {offlineData.length} itens aguardando sincronização
          </p>
          <button
            onClick={syncOfflineData}
            disabled={!networkStatus.isOnline}
            className="text-xs bg-yellow-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Sincronizar quando online
          </button>
        </div>
      )}

      {/* Network Optimization Info */}
      {optimization.enableOfflineMode && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Otimização para Rede Lenta
            </span>
          </div>
          <ul className="text-xs text-orange-700 mt-1 space-y-1">
            {optimization.reduceImageQuality && (
              <li>• Qualidade de imagem reduzida</li>
            )}
            {optimization.reduceContextLength && (
              <li>• Contexto reduzido para IA</li>
            )}
            {optimization.useFasterModel && (
              <li>• Modelo mais rápido ativado</li>
            )}
          </ul>
        </div>
      )}

      {/* Feature Support Status */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Câmera:</span>
          <span className={isCameraSupported ? 'text-green-600' : 'text-red-600'}>
            {isCameraSupported ? 'Suportado' : 'Não suportado'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Localização:</span>
          <span className={isLocationSupported ? 'text-green-600' : 'text-red-600'}>
            {isLocationSupported ? 'Suportado' : 'Não suportado'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>PWA:</span>
          <span className="text-green-600">Ativo</span>
        </div>
      </div>
    </div>
  );
};

export default MobileFeatures; 