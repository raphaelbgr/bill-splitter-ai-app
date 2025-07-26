import React, { useState } from 'react';
import Head from 'next/head';
import InternationalizationDashboard from '../components/InternationalizationDashboard';
import { i18n, SupportedLanguage, SupportedRegion } from '../lib/internationalization';

export default function InternationalizationTest() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('pt-BR');
  const [currentRegion, setCurrentRegion] = useState<SupportedRegion>('BR');
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTests = async () => {
    const results = [];

    // Test 1: Language switching
    try {
      const languageResponse = await fetch('/api/internationalization/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'es-ES', region: 'ES' })
      });
      
      if (languageResponse.ok) {
        const data = await languageResponse.json();
        results.push({
          test: 'Language Switching',
          status: 'PASS',
          details: `Successfully switched to ${data.currentLanguage}`
        });
      } else {
        results.push({
          test: 'Language Switching',
          status: 'FAIL',
          details: 'Failed to switch language'
        });
      }
    } catch (error) {
      results.push({
        test: 'Language Switching',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Cultural context
    try {
      const culturalResponse = await fetch('/api/internationalization/cultural-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'BR', scenario: 'restaurant' })
      });
      
      if (culturalResponse.ok) {
        const data = await culturalResponse.json();
        results.push({
          test: 'Cultural Context',
          status: 'PASS',
          details: `Loaded cultural context for ${data.region}`
        });
      } else {
        results.push({
          test: 'Cultural Context',
          status: 'FAIL',
          details: 'Failed to load cultural context'
        });
      }
    } catch (error) {
      results.push({
        test: 'Cultural Context',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Regional payments
    try {
      const paymentsResponse = await fetch('/api/internationalization/regional-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'US', scenario: 'restaurant' })
      });
      
      if (paymentsResponse.ok) {
        const data = await paymentsResponse.json();
        results.push({
          test: 'Regional Payments',
          status: 'PASS',
          details: `Loaded payment methods for ${data.region}`
        });
      } else {
        results.push({
          test: 'Regional Payments',
          status: 'FAIL',
          details: 'Failed to load regional payments'
        });
      }
    } catch (error) {
      results.push({
        test: 'Regional Payments',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Translation functionality
    try {
      i18n.setLanguage('pt-BR');
      const translation = i18n.t('message.welcome');
      if (translation && translation !== 'message.welcome') {
        results.push({
          test: 'Translation System',
          status: 'PASS',
          details: 'Translation system working correctly'
        });
      } else {
        results.push({
          test: 'Translation System',
          status: 'FAIL',
          details: 'Translation system not working'
        });
      }
    } catch (error) {
      results.push({
        test: 'Translation System',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Currency formatting
    try {
      i18n.setRegion('BR');
      const formattedCurrency = i18n.formatCurrency(1234.56);
      if (formattedCurrency.includes('R$') || formattedCurrency.includes('BRL')) {
        results.push({
          test: 'Currency Formatting',
          status: 'PASS',
          details: `Formatted currency: ${formattedCurrency}`
        });
      } else {
        results.push({
          test: 'Currency Formatting',
          status: 'FAIL',
          details: 'Currency formatting not working'
        });
      }
    } catch (error) {
      results.push({
        test: 'Currency Formatting',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 6: Cultural expressions
    try {
      const expression = i18n.getCulturalExpression('expense_sharing');
      if (expression && expression !== 'expense_sharing') {
        results.push({
          test: 'Cultural Expressions',
          status: 'PASS',
          details: `Cultural expression: ${expression}`
        });
      } else {
        results.push({
          test: 'Cultural Expressions',
          status: 'FAIL',
          details: 'Cultural expressions not working'
        });
      }
    } catch (error) {
      results.push({
        test: 'Cultural Expressions',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-600 bg-green-50 border-green-200';
      case 'FAIL': return 'text-red-600 bg-red-50 border-red-200';
      case 'ERROR': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <Head>
        <title>RachaAI - Internationalization Test</title>
        <meta name="description" content="Test internationalization features for RachaAI" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🌍 Internationalization Test
                </h1>
                <p className="text-gray-600 mt-2">
                  Test multi-language support, cultural adaptation, and regional features
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Language: {currentLanguage}
                </span>
                <span className="text-sm text-gray-500">
                  Region: {currentRegion}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">🧪 Test Controls</h2>
            <div className="flex space-x-4">
              <button
                onClick={runTests}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Run All Tests
              </button>
              <button
                onClick={() => setTestResults([])}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.test}</h3>
                        <p className="text-sm mt-1">{result.details}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.status === 'PASS' ? 'bg-green-100 text-green-800' :
                        result.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-600">
                    Passed: {testResults.filter(r => r.status === 'PASS').length}
                  </span>
                  <span className="text-red-600">
                    Failed: {testResults.filter(r => r.status === 'FAIL').length}
                  </span>
                  <span className="text-orange-600">
                    Errors: {testResults.filter(r => r.status === 'ERROR').length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Internationalization Dashboard */}
          <InternationalizationDashboard
            userId="test-user-123"
            onLanguageChange={setCurrentLanguage}
            onRegionChange={setCurrentRegion}
          />
        </div>
      </div>
    </>
  );
} 