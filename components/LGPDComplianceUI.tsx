import React, { useState, useEffect } from 'react';

interface LGPDComplianceUIProps {
  userId: string;
}

interface ConsentRecord {
  id: string;
  consent_type: string;
  granted: boolean;
  purpose: string;
  legal_basis: string;
  created_at: string;
  revoked_at?: string;
}

interface TransparencyInfo {
  aiModels: string[];
  totalProcessingRecords: number;
  totalTokensUsed: number;
  totalCostBRL: number;
  dataCategories: string[];
  retentionPeriod: string;
  legalBasis: string;
  purposes: string[];
  dataProcessingActivities: string[];
  automatedDecisions: string[];
  userRights: string[];
}

export const LGPDComplianceUI: React.FC<LGPDComplianceUIProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'consent' | 'transparency' | 'rights' | 'retention'>('consent');
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [transparency, setTransparency] = useState<TransparencyInfo | null>(null);
  const [retentionStats, setRetentionStats] = useState<any>(null);

  useEffect(() => {
    loadConsentData();
    loadTransparencyData();
    loadRetentionStats();
  }, [userId]);

  const loadConsentData = async () => {
    try {
      const response = await fetch(`/api/memory/consent?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConsents(data.consents || []);
      }
    } catch (error) {
      console.error('Error loading consent data:', error);
    }
  };

  const loadTransparencyData = async () => {
    try {
      const response = await fetch(`/api/memory/transparency?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTransparency(data.transparency);
      }
    } catch (error) {
      console.error('Error loading transparency data:', error);
    }
  };

  const loadRetentionStats = async () => {
    try {
      const response = await fetch('/api/memory/retention');
      if (response.ok) {
        const data = await response.json();
        setRetentionStats(data.retentionStats);
      }
    } catch (error) {
      console.error('Error loading retention stats:', error);
    }
  };

  const grantConsent = async (consentType: string, purpose: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/memory/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          consentType,
          purpose,
          dataCategories: ['conversations', 'preferences', 'cultural_context'],
          legalBasis: 'consent'
        })
      });

      if (response.ok) {
        await loadConsentData();
      }
    } catch (error) {
      console.error('Error granting consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeConsent = async (consentType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/memory/consent', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, consentType })
      });

      if (response.ok) {
        await loadConsentData();
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/memory/export?userId=${userId}`);
      if (response.ok) {
        const exportData = await response.json();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rachaai-lgpd-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const deleteData = async () => {
    if (window.confirm('Tem certeza que deseja deletar todos os seus dados? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/memory/delete?userId=${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Todos os dados foram deletados com sucesso.');
          await loadConsentData();
        }
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
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'consent', label: 'Consentimento', icon: '📋' },
            { id: 'transparency', label: 'Transparência', icon: '🔍' },
            { id: 'rights', label: 'Seus Direitos', icon: '⚖️' },
            { id: 'retention', label: 'Retenção', icon: '⏰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'consent' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Gerenciamento de Consentimento</h3>
              <p className="text-sm text-blue-700 mb-4">
                Controle seus consentimentos para processamento de dados conforme a LGPD.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                {
                  type: 'ai_processing',
                  title: 'Processamento de IA',
                  description: 'Permitir que a IA processe suas mensagens para melhorar sugestões',
                  purpose: 'Processamento de IA para divisão de contas'
                },
                {
                  type: 'memory_retention',
                  title: 'Memória de Conversas',
                  description: 'Lembrar suas preferências e grupos para próximas divisões',
                  purpose: 'Memória contextual para melhorar experiência'
                },
                {
                  type: 'cultural_analysis',
                  title: 'Análise Cultural',
                  description: 'Analisar contexto cultural para sugestões mais precisas',
                  purpose: 'Análise cultural para personalização'
                }
              ].map((consent) => {
                const isGranted = consents.some(c => c.consent_type === consent.type && c.granted && !c.revoked_at);
                
                return (
                  <div key={consent.type} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{consent.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{consent.description}</p>
                        <p className="text-xs text-gray-500 mt-2">Propósito: {consent.purpose}</p>
                      </div>
                      <div className="flex space-x-2">
                        {isGranted ? (
                          <button
                            onClick={() => revokeConsent(consent.type)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Revogar
                          </button>
                        ) : (
                          <button
                            onClick={() => grantConsent(consent.type, consent.purpose)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Conceder
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isGranted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isGranted ? 'Concedido' : 'Não concedido'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'transparency' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Transparência de IA</h3>
              <p className="text-sm text-green-700 mb-4">
                Informações sobre como seus dados são processados pela IA.
              </p>
            </div>

            {transparency && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Modelos de IA</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {transparency.aiModels.join(', ') || 'Nenhum modelo usado ainda'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900">Registros de Processamento</h4>
                    <p className="text-sm text-green-700 mt-1">
                      {transparency.totalProcessingRecords} registros
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Custo Total</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      R$ {transparency.totalCostBRL.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Atividades de Processamento</h4>
                    <ul className="space-y-2">
                      {transparency.dataProcessingActivities.map((activity, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Decisões Automatizadas</h4>
                    <ul className="space-y-2">
                      {transparency.automatedDecisions.map((decision, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rights' && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Seus Direitos LGPD</h3>
              <p className="text-sm text-purple-700 mb-4">
                Exercite seus direitos de proteção de dados conforme a LGPD.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📥 Direito à Portabilidade</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Baixe todos os seus dados pessoais em formato estruturado.
                </p>
                <button
                  onClick={exportData}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Exportar Dados
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🗑️ Direito ao Esquecimento</h4>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Atenção:</strong> Esta ação deletará permanentemente todos os seus dados.
                </p>
                <button
                  onClick={deleteData}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Deletar Todos os Dados
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🔍 Direito de Acesso</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Visualize todas as informações que temos sobre você.
                </p>
                <button
                  onClick={() => setActiveTab('transparency')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver Transparência
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">✏️ Direito de Correção</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Corrija informações imprecisas sobre você.
                </p>
                <button
                  onClick={() => setActiveTab('consent')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Gerenciar Consentimentos
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retention' && (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Política de Retenção</h3>
              <p className="text-sm text-orange-700 mb-4">
                Informações sobre como seus dados são armazenados e quando são automaticamente deletados.
              </p>
            </div>

            {retentionStats && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Período de Retenção</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {retentionStats.retentionPeriod}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900">Data de Corte</h4>
                    <p className="text-sm text-green-700 mt-1">
                      {new Date(retentionStats.cutoffDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dados Expirados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-900">Conversas</p>
                      <p className="text-lg font-bold text-red-700">{retentionStats.expiredData.conversations}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900">Mensagens</p>
                      <p className="text-lg font-bold text-yellow-700">{retentionStats.expiredData.messages}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">Processamento</p>
                      <p className="text-lg font-bold text-orange-700">{retentionStats.expiredData.processingRecords}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Políticas de Retenção</h4>
                  <div className="space-y-2">
                    {Object.entries(retentionStats.policy).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 