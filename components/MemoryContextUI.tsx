import React, { useState, useEffect } from 'react';
import { MemorySystem } from '../lib/memory-system';
import { UserPreferenceLearner } from '../lib/user-preferences';
import { ContextAwareProcessor } from '../lib/context-aware';

interface MemoryContextUIProps {
  userId: string;
  onConsentChange?: (consentType: string, consentGiven: boolean) => void;
  onPreferencesUpdate?: (preferences: any) => void;
}

interface ConsentSettings {
  memoryRetention: boolean;
  preferenceLearning: boolean;
  analytics: boolean;
}

interface PrivacySettings {
  allowMemoryRetention: boolean;
  allowPreferenceLearning: boolean;
  allowAnalytics: boolean;
  dataRetentionPeriod: number;
  allowDataExport: boolean;
  allowDataDeletion: boolean;
}

export const MemoryContextUI: React.FC<MemoryContextUIProps> = ({
  userId,
  onConsentChange,
  onPreferencesUpdate
}) => {
  const [memorySystem] = useState(() => new MemorySystem());
  const [preferenceLearner] = useState(() => new UserPreferenceLearner());
  const [contextProcessor] = useState(() => new ContextAwareProcessor());

  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    memoryRetention: false,
    preferenceLearning: false,
    analytics: false
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    allowMemoryRetention: true,
    allowPreferenceLearning: true,
    allowAnalytics: false,
    dataRetentionPeriod: 90,
    allowDataExport: true,
    allowDataDeletion: true
  });

  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [preferenceSummary, setPreferenceSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'privacy' | 'analytics' | 'export'>('preferences');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user preferences
      const preferences = await memorySystem.getUserPreferences(userId);
      setUserPreferences(preferences);

      // Load preference summary
      const summary = await preferenceLearner.getUserPreferenceSummary(userId);
      setPreferenceSummary(summary);

      // Load analytics (if consent given)
      if (consentSettings.analytics) {
        const analyticsData = await contextProcessor.getContextAwareAnalytics(userId);
        setAnalytics(analyticsData);
      }

      // Load consent settings
      const memoryConsent = await memorySystem.getUserConsent(userId, 'memory_retention');
      const preferenceConsent = await memorySystem.getUserConsent(userId, 'preference_learning');
      const analyticsConsent = await memorySystem.getUserConsent(userId, 'analytics');

      setConsentSettings({
        memoryRetention: memoryConsent.consentGiven,
        preferenceLearning: preferenceConsent.consentGiven,
        analytics: analyticsConsent.consentGiven
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (consentType: string, consentGiven: boolean) => {
    try {
      const consent = {
        userId,
        consentType: consentType as any,
        consentGiven,
        consentDate: new Date(),
        retentionPeriod: consentGiven ? 90 : 0,
        purpose: consentGiven ? 'Improve user experience' : 'No consent given',
        dataCategories: consentGiven ? ['conversations', 'preferences', 'cultural_context'] : []
      };

      await memorySystem.createConsent(consent);
      setConsentSettings(prev => ({ ...prev, [consentType]: consentGiven }));
      onConsentChange?.(consentType, consentGiven);
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const handlePrivacySettingsChange = async (settings: Partial<PrivacySettings>) => {
    const updatedSettings = { ...privacySettings, ...settings };
    setPrivacySettings(updatedSettings);

    if (userPreferences) {
      const updatedPreferences = {
        ...userPreferences,
        privacySettings: updatedSettings
      };
      await memorySystem.updateUserPreferences(userId, updatedPreferences);
      setUserPreferences(updatedPreferences);
      onPreferencesUpdate?.(updatedPreferences);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await memorySystem.exportUserData(userId);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rachaai-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDeleteData = async () => {
    if (window.confirm('Tem certeza que deseja deletar todos os seus dados? Esta ação não pode ser desfeita.')) {
      try {
        await memorySystem.deleteAllUserData(userId);
        setUserPreferences(null);
        setPreferenceSummary(null);
        setAnalytics(null);
        alert('Todos os dados foram deletados com sucesso.');
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações de Memória e Privacidade</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'preferences'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preferências
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'privacy'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Privacidade
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'export'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Exportar/Deletar
        </button>
      </div>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Preferências Aprendidas</h3>
            {preferenceSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-700">Métodos Mais Usados</h4>
                  <ul className="text-sm text-blue-600 mt-1">
                    <li>Divisão: {preferenceSummary.mostUsedMethods?.splittingMethod || 'Não definido'}</li>
                    <li>Pagamento: {preferenceSummary.mostUsedMethods?.paymentMethod || 'Não definido'}</li>
                    <li>Contexto: {preferenceSummary.mostUsedMethods?.culturalContext || 'Não definido'}</li>
                    <li>Região: {preferenceSummary.mostUsedMethods?.region || 'Não definido'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700">Interações Totais</h4>
                  <p className="text-2xl font-bold text-blue-600">{preferenceSummary.totalInteractions || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-blue-600">Nenhuma preferência aprendida ainda.</p>
            )}
          </div>

          {userPreferences && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Preferências Atuais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-700">Configurações</h4>
                  <ul className="text-sm text-green-600 mt-1">
                    <li>Método preferido: {userPreferences.preferredSplittingMethod || 'Não definido'}</li>
                    <li>Contexto cultural: {userPreferences.culturalContext || 'Não definido'}</li>
                    <li>Idioma: {userPreferences.languagePreference || 'pt-BR'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-700">Métodos de Pagamento</h4>
                  <ul className="text-sm text-green-600 mt-1">
                    {userPreferences.paymentMethods?.map((method: string, index: number) => (
                      <li key={index}>{method}</li>
                    )) || <li>Não definidos</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Configurações de Consentimento (LGPD)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-700">Retenção de Memória</h4>
                  <p className="text-sm text-yellow-600">Permitir que o sistema lembre suas conversas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSettings.memoryRetention}
                    onChange={(e) => handleConsentChange('memory_retention', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-700">Aprendizado de Preferências</h4>
                  <p className="text-sm text-yellow-600">Permitir que o sistema aprenda suas preferências</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSettings.preferenceLearning}
                    onChange={(e) => handleConsentChange('preference_learning', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-700">Analytics</h4>
                  <p className="text-sm text-yellow-600">Permitir análise de uso para melhorias</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSettings.analytics}
                    onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Privacidade</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período de Retenção de Dados (dias)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={privacySettings.dataRetentionPeriod}
                  onChange={(e) => handlePrivacySettingsChange({ dataRetentionPeriod: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Permitir Exportação de Dados</h4>
                  <p className="text-sm text-gray-600">Direito à portabilidade (LGPD)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowDataExport}
                    onChange={(e) => handlePrivacySettingsChange({ allowDataExport: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Permitir Deletar Dados</h4>
                  <p className="text-sm text-gray-600">Direito ao esquecimento (LGPD)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowDataDeletion}
                    onChange={(e) => handlePrivacySettingsChange({ allowDataDeletion: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Estatísticas de Uso</h3>
                <div className="space-y-2 text-sm text-purple-700">
                  <p>Total de conversas: {analytics.contextAwareFeatures?.totalSuggestions || 0}</p>
                  <p>Confiança média: {((analytics.contextAwareFeatures?.averageConfidence || 0) * 100).toFixed(1)}%</p>
                  <p>Relevância cultural: {((analytics.contextAwareFeatures?.culturalRelevance || 0) * 100).toFixed(1)}%</p>
                  <p>Precisão das preferências: {((analytics.contextAwareFeatures?.preferenceAccuracy || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">Perfil Cultural</h3>
                {analytics.culturalProfile && (
                  <div className="space-y-2 text-sm text-indigo-700">
                    <p>Nível de formalidade: {analytics.culturalProfile.preferredFormalityLevel}</p>
                    <p>Regiões preferidas: {analytics.culturalProfile.regionalPreferences?.map((r: any) => r.region).join(', ') || 'Não definidas'}</p>
                    <p>Padrões culturais: {analytics.culturalProfile.culturalPatterns?.map((c: any) => c.context).join(', ') || 'Não definidos'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600">Analytics não disponível. Ative o consentimento para analytics para ver estatísticas.</p>
            </div>
          )}
        </div>
      )}

      {/* Export/Delete Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Exportar Dados (LGPD - Direito à Portabilidade)</h3>
            <p className="text-sm text-green-700 mb-4">
              Baixe todos os seus dados pessoais em formato JSON. Isso inclui conversas, preferências e contexto cultural.
            </p>
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Exportar Dados
            </button>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Deletar Dados (LGPD - Direito ao Esquecimento)</h3>
            <p className="text-sm text-red-700 mb-4">
              <strong>Atenção:</strong> Esta ação deletará permanentemente todos os seus dados, incluindo conversas, preferências e contexto cultural. Esta ação não pode ser desfeita.
            </p>
            <button
              onClick={handleDeleteData}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Deletar Todos os Dados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 