import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface MemoryItem {
  id: string;
  type: 'conversation' | 'preference' | 'context' | 'payment';
  title: string;
  description: string;
  createdAt: string;
  expiresAt?: string;
  dataSize: string;
  category: string;
  isActive: boolean;
}

interface PrivacySettings {
  dataRetention: '7days' | '30days' | '90days' | '1year' | 'indefinite';
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowThirdParty: boolean;
  dataExport: boolean;
  autoDelete: boolean;
}

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  isGranted: boolean;
  required: boolean;
  lastUpdated: string;
}

const MemoryContextUI: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memory' | 'privacy' | 'consent' | 'export'>('memory');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from API
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([
    {
      id: '1',
      type: 'conversation',
      title: 'Conversa sobre Churrasco',
      description: 'Discussão sobre divisão de despesas do churrasco da galera',
      createdAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-04-15T10:30:00Z',
      dataSize: '2.3 KB',
      category: 'Social',
      isActive: true
    },
    {
      id: '2',
      type: 'preference',
      title: 'Preferências de Pagamento',
      description: 'Pix como método preferido de pagamento',
      createdAt: '2024-01-10T14:20:00Z',
      dataSize: '0.8 KB',
      category: 'Pagamento',
      isActive: true
    },
    {
      id: '3',
      type: 'context',
      title: 'Contexto Cultural Brasileiro',
      description: 'Preferências regionais e culturais do usuário',
      createdAt: '2024-01-05T09:15:00Z',
      dataSize: '1.5 KB',
      category: 'Cultural',
      isActive: true
    }
  ]);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataRetention: '90days',
    allowAnalytics: true,
    allowPersonalization: true,
    allowThirdParty: false,
    dataExport: true,
    autoDelete: true
  });

  const [consentItems, setConsentItems] = useState<ConsentItem[]>([
    {
      id: '1',
      title: 'Coleta de Dados Pessoais',
      description: 'Autorizo a coleta e processamento dos meus dados pessoais conforme LGPD',
      isGranted: true,
      required: true,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Análise de Uso',
      description: 'Permito o uso de dados para melhorar a experiência do usuário',
      isGranted: true,
      required: false,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '3',
      title: 'Personalização',
      description: 'Aceito receber sugestões personalizadas baseadas no meu uso',
      isGranted: true,
      required: false,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '4',
      title: 'Compartilhamento com Terceiros',
      description: 'Permito o compartilhamento de dados com parceiros confiáveis',
      isGranted: false,
      required: false,
      lastUpdated: '2024-01-15T10:30:00Z'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return '💬';
      case 'preference':
        return '⚙️';
      case 'context':
        return '🌍';
      case 'payment':
        return '💳';
      default:
        return '📄';
    }
  };

  const getMemoryTypeLabel = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'Conversa';
      case 'preference':
        return 'Preferência';
      case 'context':
        return 'Contexto';
      case 'payment':
        return 'Pagamento';
      default:
        return 'Dados';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Social':
        return 'bg-blue-100 text-blue-800';
      case 'Pagamento':
        return 'bg-green-100 text-green-800';
      case 'Cultural':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMemoryItems(prev => prev.filter(item => item.id !== id));
      setShowDeleteConfirm(false);
      setSelectedMemoryId(null);
    } catch (error) {
      console.error('Erro ao deletar memória:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real implementation, this would trigger a download
      alert('Dados exportados com sucesso! Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentToggle = async (id: string) => {
    setConsentItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isGranted: !item.isGranted, lastUpdated: new Date().toISOString() }
        : item
    ));
  };

  const handlePrivacySettingChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Memória e Contexto
        </h1>
        <p className="text-gray-600">
          Gerencie seus dados e preferências de forma transparente e em conformidade com a LGPD
        </p>
      </div>

      {/* LGPD Compliance Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Conformidade LGPD
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Seus dados são processados em conformidade com a Lei Geral de Proteção de Dados (LGPD). 
              Você tem controle total sobre suas informações.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'memory', label: 'Memória', icon: '🧠' },
            { id: 'privacy', label: 'Privacidade', icon: '🔒' },
            { id: 'consent', label: 'Consentimento', icon: '✅' },
            { id: 'export', label: 'Exportar', icon: '📤' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Memory Tab */}
        {activeTab === 'memory' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Dados Armazenados
              </h2>
              <div className="text-sm text-gray-500">
                Total: {memoryItems.length} itens • {memoryItems.reduce((acc, item) => acc + parseFloat(item.dataSize), 0).toFixed(1)} KB
              </div>
            </div>

            <div className="space-y-4">
              {memoryItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getMemoryTypeIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getMemoryTypeLabel(item.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Criado: {formatDate(item.createdAt)}</span>
                          {item.expiresAt && (
                            <span>Expira: {formatDate(item.expiresAt)}</span>
                          )}
                          <span>Tamanho: {item.dataSize}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedMemoryId(item.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Configurações de Privacidade
            </h2>

            <div className="space-y-6">
              {/* Data Retention */}
              <div>
                <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 mb-2">
                  Retenção de Dados
                </label>
                <select
                  id="dataRetention"
                  value={privacySettings.dataRetention}
                  onChange={(e) => handlePrivacySettingChange('dataRetention', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7days">7 dias</option>
                  <option value="30days">30 dias</option>
                  <option value="90days">90 dias</option>
                  <option value="1year">1 ano</option>
                  <option value="indefinite">Indefinido</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seus dados serão automaticamente excluídos após este período
                </p>
              </div>

              {/* Privacy Options */}
              <div className="space-y-4">
                {[
                  { key: 'allowAnalytics', label: 'Análise de Uso', description: 'Permitir coleta de dados para melhorar o serviço' },
                  { key: 'allowPersonalization', label: 'Personalização', description: 'Receber sugestões personalizadas' },
                  { key: 'allowThirdParty', label: 'Compartilhamento', description: 'Compartilhar dados com parceiros confiáveis' },
                  { key: 'dataExport', label: 'Exportação', description: 'Permitir exportação dos seus dados' },
                  { key: 'autoDelete', label: 'Exclusão Automática', description: 'Excluir dados automaticamente após o período de retenção' }
                ].map((option) => (
                  <div key={option.key} className="flex items-start">
                    <input
                      type="checkbox"
                      id={option.key}
                      checked={privacySettings[option.key as keyof PrivacySettings] as boolean}
                      onChange={(e) => handlePrivacySettingChange(option.key as keyof PrivacySettings, e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={option.key} className="ml-3 text-sm">
                      <span className="font-medium text-gray-700">{option.label}</span>
                      <p className="text-gray-500">{option.description}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Consent Tab */}
        {activeTab === 'consent' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Gerenciamento de Consentimento
            </h2>

            <div className="space-y-4">
              {consentItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        {item.required && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Obrigatório
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        Última atualização: {formatDate(item.lastUpdated)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <label htmlFor={`consent-${item.id}`} className="flex items-center">
                        <input
                          id={`consent-${item.id}`}
                          type="checkbox"
                          checked={item.isGranted}
                          onChange={() => handleConsentToggle(item.id)}
                          disabled={item.required}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {item.isGranted ? 'Concedido' : 'Negado'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Exportar Dados
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Direito de Portabilidade
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Conforme a LGPD, você tem o direito de solicitar uma cópia de todos os seus dados pessoais 
                    em formato estruturado e legível por máquina.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Dados Disponíveis para Exportação</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Conversas e histórico de mensagens</li>
                  <li>• Preferências e configurações</li>
                  <li>• Dados de contexto cultural</li>
                  <li>• Informações de pagamento</li>
                  <li>• Configurações de privacidade</li>
                  <li>• Histórico de consentimentos</li>
                </ul>
              </div>

              <button
                onClick={handleExportData}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Exportar Todos os Dados</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este item da memória? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedMemoryId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => selectedMemoryId && handleDeleteMemory(selectedMemoryId)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryContextUI; 