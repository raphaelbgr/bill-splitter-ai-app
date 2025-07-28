import React, { useState, useEffect } from 'react';
import { i18n, SupportedLanguage, SupportedRegion } from '../lib/internationalization';

interface InternationalizationDashboardProps {
  userId?: string;
  onLanguageChange?: (language: SupportedLanguage) => void;
  onRegionChange?: (region: SupportedRegion) => void;
}

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

interface RegionOption {
  code: SupportedRegion;
  name: string;
  currency: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', flag: '🇪🇸' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', flag: '🇫🇷' }
];

const regionOptions: RegionOption[] = [
  { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷' },
  { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', currency: 'COP', flag: '🇨🇴' }
];

export default function InternationalizationDashboard({
  userId,
  onLanguageChange,
  onRegionChange
}: InternationalizationDashboardProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('pt-BR');
  const [currentRegion, setCurrentRegion] = useState<SupportedRegion>('BR');
  const [culturalContext, setCulturalContext] = useState<any>(null);
  const [regionalPayments, setRegionalPayments] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadCulturalContext();
    loadRegionalPayments();
  }, [currentRegion]);

  const loadCulturalContext = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/internationalization/cultural-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: currentRegion })
      });

      if (response.ok) {
        const data = await response.json();
        setCulturalContext(data);
      } else {
        setError('Failed to load cultural context');
      }
    } catch (err) {
      setError('Error loading cultural context');
    } finally {
      setLoading(false);
    }
  };

  const loadRegionalPayments = async () => {
    try {
      const response = await fetch('/api/internationalization/regional-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: currentRegion })
      });

      if (response.ok) {
        const data = await response.json();
        setRegionalPayments(data);
      }
    } catch (err) {
      console.error('Error loading regional payments:', err);
    }
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      setLoading(true);
      const response = await fetch('/api/internationalization/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          language, 
          region: currentRegion,
          userId 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLanguage(language);
        i18n.setLanguage(language);
        onLanguageChange?.(language);
      } else {
        setError('Failed to change language');
      }
    } catch (err) {
      setError('Error changing language');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = async (region: SupportedRegion) => {
    setCurrentRegion(region);
    i18n.setRegion(region);
    onRegionChange?.(region);
  };

  const formatCurrency = (amount: number) => {
    return i18n.formatCurrency(amount);
  };

  const formatDate = (date: Date) => {
    return i18n.formatDate(date);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {i18n.t('nav.internationalization') || 'Internationalization'}
        </h1>
        <p className="text-blue-100">
          {i18n.t('message.internationalization_description') || 
           'Configure language, region, and cultural preferences for your expense splitting experience.'}
        </p>
      </div>

      {/* Language and Region Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🌐 {i18n.t('settings.language') || 'Language'}
          </h2>
          <div className="space-y-3">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={loading}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  currentLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-sm text-gray-600">{lang.nativeName}</div>
                    </div>
                  </div>
                  {currentLanguage === lang.code && (
                    <div className="text-blue-500">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Region Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🌍 {i18n.t('settings.region') || 'Region'}
          </h2>
          <div className="space-y-3">
            {regionOptions.map((region) => (
              <button
                key={region.code}
                onClick={() => handleRegionChange(region.code)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  currentRegion === region.code
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{region.name}</div>
                      <div className="text-sm text-gray-600">Currency: {region.currency}</div>
                    </div>
                  </div>
                  {currentRegion === region.code && (
                    <div className="text-green-500">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cultural Context */}
      {culturalContext && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🎭 {i18n.t('cultural.context') || 'Cultural Context'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">{i18n.t('cultural.expressions') || 'Cultural Expressions'}</h3>
              <div className="space-y-2">
                {Object.entries(culturalContext.culturalContext.culturalExpressions).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">{i18n.t('cultural.social_dynamics') || 'Social Dynamics'}</h3>
              <div className="space-y-2">
                {Object.entries(culturalContext.culturalContext.socialDynamics).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regional Payment Methods */}
      {regionalPayments && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            💳 {i18n.t('payment.regional_methods') || 'Regional Payment Methods'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">{i18n.t('payment.primary') || 'Primary Methods'}</h3>
              <div className="space-y-2">
                {regionalPayments.recommendedPaymentMethods.primary.map((method: string) => (
                  <div key={method} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-800">{method}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">{i18n.t('payment.digital') || 'Digital Methods'}</h3>
              <div className="space-y-2">
                {regionalPayments.recommendedPaymentMethods.digital.map((method: string) => (
                  <div key={method} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formatting Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📊 {i18n.t('formatting.examples') || 'Formatting Examples'}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-3">{i18n.t('formatting.currency') || 'Currency'}</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{formatCurrency(1234.56)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{formatCurrency(50.00)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">{i18n.t('formatting.date') || 'Date'}</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{formatDate(new Date())}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{formatDate(new Date('2024-12-25'))}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">{i18n.t('formatting.timezone') || 'Timezone'}</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">{culturalContext?.culturalContext.timezone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{i18n.t('loading.updating') || 'Updating...'}</span>
        </div>
      )}
    </div>
  );
} 