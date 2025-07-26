import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, CheckCircle, AlertCircle, CreditCard, Users, Calendar } from 'lucide-react';
import { usePushNotifications } from '../lib/pwa-hooks';

interface NotificationSettings {
  paymentReminders: boolean;
  groupUpdates: boolean;
  culturalEvents: boolean;
  brazilianHolidays: boolean;
  expenseConfirmations: boolean;
}

interface PushNotificationManagerProps {
  userId: string;
  onNotificationSent?: (notification: any) => void;
}

export default function PushNotificationManager({
  userId,
  onNotificationSent,
}: PushNotificationManagerProps) {
  const { isSupported, permission, subscription, requestPermission, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    paymentReminders: true,
    groupUpdates: true,
    culturalEvents: true,
    brazilianHolidays: true,
    expenseConfirmations: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('rachaai_notification_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: NotificationSettings) => {
    localStorage.setItem('rachaai_notification_settings', JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const sendTestNotification = async () => {
    if (!subscription) return;

    try {
      const response = await fetch('/api/push/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          settings,
        }),
      });

      if (response.ok) {
        onNotificationSent?.({ type: 'test', success: true });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Notificações Não Suportadas
            </h3>
            <p className="text-xs text-yellow-700">
              Seu navegador não suporta notificações push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {permission === 'granted' ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações Push
              </h3>
              <p className="text-sm text-gray-500">
                {permission === 'granted' ? 'Ativadas' : 'Desativadas'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Permission Status */}
      <div className="p-4">
        {permission === 'default' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">
                  Ativar Notificações
                </h4>
                <p className="text-xs text-blue-700">
                  Receba lembretes de pagamentos e atualizações de grupos
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Ativando...' : 'Ativar'}
              </button>
            </div>
          </div>
        )}

        {permission === 'granted' && subscription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">
                  Notificações Ativas
                </h4>
                <p className="text-xs text-green-700">
                  Você receberá notificações sobre pagamentos e grupos
                </p>
              </div>
              <button
                onClick={sendTestNotification}
                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                Testar
              </button>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Notificações Bloqueadas
                </h4>
                <p className="text-xs text-red-700">
                  Ative as notificações nas configurações do navegador
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && permission === 'granted' && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Configurações de Notificação
          </h4>
          
          <div className="space-y-3">
            {/* Payment Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Lembretes de Pagamento
                  </p>
                  <p className="text-xs text-gray-500">
                    PIX, boleto e transferências
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentReminders}
                  onChange={(e) => handleSettingChange('paymentReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Group Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Atualizações de Grupo
                  </p>
                  <p className="text-xs text-gray-500">
                    Novas despesas e pagamentos
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.groupUpdates}
                  onChange={(e) => handleSettingChange('groupUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Cultural Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Eventos Culturais
                  </p>
                  <p className="text-xs text-gray-500">
                    Carnaval, festas juninas, etc.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.culturalEvents}
                  onChange={(e) => handleSettingChange('culturalEvents', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Brazilian Holidays */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Feriados Brasileiros
                  </p>
                  <p className="text-xs text-gray-500">
                    Lembretes de feriados nacionais
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.brazilianHolidays}
                  onChange={(e) => handleSettingChange('brazilianHolidays', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Expense Confirmations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Confirmações de Despesa
                  </p>
                  <p className="text-xs text-gray-500">
                    Quando despesas são confirmadas
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.expenseConfirmations}
                  onChange={(e) => handleSettingChange('expenseConfirmations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Unsubscribe Button */}
          {subscription && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Desativando...' : 'Desativar Notificações'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 