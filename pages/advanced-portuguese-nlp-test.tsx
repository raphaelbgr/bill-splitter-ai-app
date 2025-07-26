import React, { useState } from 'react';
import { AdvancedPortugueseNLPResult } from '../lib/advanced-portuguese-nlp';

export default function AdvancedPortugueseNLPTest() {
  const [text, setText] = useState('');
  const [userRegion, setUserRegion] = useState<string>('sao_paulo');
  const [result, setResult] = useState<AdvancedPortugueseNLPResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regions = [
    { value: 'sao_paulo', label: 'São Paulo' },
    { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
    { value: 'minas_gerais', label: 'Minas Gerais' },
    { value: 'bahia', label: 'Bahia' },
    { value: 'pernambuco', label: 'Pernambuco' },
    { value: 'parana', label: 'Paraná' },
    { value: 'rio_grande_sul', label: 'Rio Grande do Sul' },
    { value: 'outros', label: 'Outras regiões' }
  ];

  const exampleTexts = [
    {
      name: 'São Paulo - Informal',
      text: 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!',
      region: 'sao_paulo'
    },
    {
      name: 'Rio de Janeiro - Casual',
      text: 'Molecada, beleza? Aquele churrasco foi da hora!',
      region: 'rio_de_janeiro'
    },
    {
      name: 'Minas Gerais - Família',
      text: 'Rapaziada, vamos fazer uma vaquinha para o aniversário da família?',
      region: 'minas_gerais'
    },
    {
      name: 'Bahia - Regional',
      text: 'Meninada, vamos curtir aquele acarajé? Beleza!',
      region: 'bahia'
    },
    {
      name: 'Rio Grande do Sul - Gaúcho',
      text: 'Bah, tchê! Aquele churrasco foi show de bola!',
      region: 'rio_grande_sul'
    },
    {
      name: 'Multi-dialect',
      text: 'Cara, tipo, aquele rodízio foi massa! Bah, tchê, foi demais!',
      region: 'outros'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/advanced-portuguese-nlp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          userRegion: userRegion as any
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process text');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: typeof exampleTexts[0]) => {
    setText(example.text);
    setUserRegion(example.region);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Advanced Portuguese NLP Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the advanced Portuguese NLP features including regional dialect recognition, 
            slang processing, context understanding, and multi-dialect support.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Region
              </label>
              <select
                value={userRegion}
                onChange={(e) => setUserRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portuguese Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite um texto em português brasileiro..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Process Text'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Example Texts */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Example Texts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
              >
                <h3 className="font-medium text-gray-800 mb-2">{example.name}</h3>
                <p className="text-sm text-gray-600">{example.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Processing Results
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Basic Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Original Text:</strong> {result.originalText}</p>
                    <p><strong>Normalized Text:</strong> {result.normalizedText}</p>
                    <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Processing Time:</strong> {result.processingTime}ms</p>
                  </div>
                </div>

                {/* Detected Dialects */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Detected Dialects</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {result.detectedDialects.length > 0 ? (
                      result.detectedDialects.map((dialect, index) => (
                        <div key={index} className="mb-3">
                          <p><strong>Region:</strong> {dialect.region}</p>
                          <p><strong>Confidence:</strong> {(dialect.confidence * 100).toFixed(1)}%</p>
                          <p><strong>Authenticity:</strong> {(dialect.authenticity * 100).toFixed(1)}%</p>
                          {dialect.dialectFeatures.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Features:</p>
                              <ul className="list-disc list-inside text-sm">
                                {dialect.dialectFeatures.map((feature, fIndex) => (
                                  <li key={fIndex}>
                                    {feature.original} → {feature.standard} ({(feature.confidence * 100).toFixed(1)}%)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No dialects detected</p>
                    )}
                  </div>
                </div>

                {/* Slang Expressions */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Slang Expressions</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {result.slangExpressions.length > 0 ? (
                      result.slangExpressions.map((slang, index) => (
                        <div key={index} className="mb-3">
                          <p><strong>Expression:</strong> {slang.original}</p>
                          <p><strong>Meaning:</strong> {slang.meaning}</p>
                          <p><strong>Region:</strong> {slang.region}</p>
                          <p><strong>Formality:</strong> {slang.formality}</p>
                          <p><strong>Confidence:</strong> {(slang.confidence * 100).toFixed(1)}%</p>
                          <p><strong>Evolution:</strong> {slang.evolution}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No slang expressions detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div className="space-y-4">
                {/* Context Understanding */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Context Understanding</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Overall Confidence:</strong> {(result.contextUnderstanding.confidence * 100).toFixed(1)}%</p>
                    
                    <div className="mt-3">
                      <p><strong>Cultural Context:</strong></p>
                      <ul className="list-disc list-inside text-sm">
                        <li>References: {result.contextUnderstanding.culturalContext.references.join(', ') || 'None'}</li>
                        <li>Traditions: {result.contextUnderstanding.culturalContext.traditions.join(', ') || 'None'}</li>
                        <li>Confidence: {(result.contextUnderstanding.culturalContext.confidence * 100).toFixed(1)}%</li>
                      </ul>
                    </div>

                    <div className="mt-3">
                      <p><strong>Social Context:</strong></p>
                      <ul className="list-disc list-inside text-sm">
                        <li>Relationships: {result.contextUnderstanding.socialContext.relationships.join(', ') || 'None'}</li>
                        <li>Confidence: {(result.contextUnderstanding.socialContext.confidence * 100).toFixed(1)}%</li>
                      </ul>
                    </div>

                    <div className="mt-3">
                      <p><strong>Regional Context:</strong></p>
                      <ul className="list-disc list-inside text-sm">
                        <li>Region: {result.contextUnderstanding.regionalContext.region}</li>
                        <li>Local Expressions: {result.contextUnderstanding.regionalContext.localExpressions.join(', ') || 'None'}</li>
                        <li>Confidence: {(result.contextUnderstanding.regionalContext.confidence * 100).toFixed(1)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Multi-Dialect Support */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Multi-Dialect Support</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Cross-Dialect Understanding:</strong> {result.multiDialectSupport.crossDialectUnderstanding ? 'Yes' : 'No'}</p>
                    <p><strong>Confidence:</strong> {(result.multiDialectSupport.confidence * 100).toFixed(1)}%</p>
                    
                    {result.multiDialectSupport.dialectSwitching.length > 0 && (
                      <div className="mt-3">
                        <p><strong>Dialect Switching:</strong></p>
                        <ul className="list-disc list-inside text-sm">
                          {result.multiDialectSupport.dialectSwitching.map((switching, index) => (
                            <li key={index}>
                              {switching.fromDialect} → {switching.toDialect} ({(switching.confidence * 100).toFixed(1)}%)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Regional Authenticity */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Regional Authenticity</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Regional Accuracy:</strong> {(result.regionalAuthenticity.regionalAccuracy * 100).toFixed(1)}%</p>
                    <p><strong>Cultural Sensitivity:</strong> {(result.regionalAuthenticity.culturalSensitivity * 100).toFixed(1)}%</p>
                    <p><strong>Natural Language:</strong> {(result.regionalAuthenticity.naturalLanguage * 100).toFixed(1)}%</p>
                    <p><strong>Regional Respect:</strong> {(result.regionalAuthenticity.regionalRespect * 100).toFixed(1)}%</p>
                    <p><strong>Overall Authenticity:</strong> {(result.regionalAuthenticity.overallAuthenticity * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Suggestions</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {result.suggestions.length > 0 ? (
                      <ul className="list-disc list-inside text-sm">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No suggestions</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 