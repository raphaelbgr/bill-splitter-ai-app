import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface BulkExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'processed' | 'error';
  participants: string[];
  split_method: 'equal' | 'proportional' | 'custom';
  notes?: string;
}

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  processed_items: number;
  created_at: string;
  completed_at?: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  group_id: string;
}

const B2BBulkExpenseManagement: React.FC = () => {
  const [bulkExpenses, setBulkExpenses] = useState<BulkExpense[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'process' | 'history'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadBulkData();
  }, []);

  const loadBulkData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading bulk data
      const mockBulkExpenses: BulkExpense[] = [
        {
          id: '1',
          description: 'Almoço corporativo - Equipe Marketing',
          amount: 450.00,
          category: 'Alimentação',
          date: '2024-12-15',
          status: 'processed',
          participants: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'],
          split_method: 'equal',
          notes: 'Almoço de equipe mensal'
        },
        {
          id: '2',
          description: 'Transporte - Conferência Tech',
          amount: 1200.00,
          category: 'Transporte',
          date: '2024-12-14',
          status: 'pending',
          participants: ['João Silva', 'Maria Santos', 'Pedro Costa'],
          split_method: 'proportional',
          notes: 'Uber para conferência'
        },
        {
          id: '3',
          description: 'Material de escritório',
          amount: 180.00,
          category: 'Suprimentos',
          date: '2024-12-13',
          status: 'processed',
          participants: ['João Silva', 'Maria Santos'],
          split_method: 'equal'
        }
      ];

      const mockBulkOperations: BulkOperation[] = [
        {
          id: '1',
          name: 'Importação Despesas Dezembro',
          description: 'Importação de 25 despesas do mês de dezembro',
          status: 'completed',
          progress: 100,
          total_items: 25,
          processed_items: 25,
          created_at: '2024-12-15T10:00:00Z',
          completed_at: '2024-12-15T10:05:00Z'
        },
        {
          id: '2',
          name: 'Processamento Despesas Viagem',
          description: 'Processamento de despesas da viagem corporativa',
          status: 'running',
          progress: 60,
          total_items: 15,
          processed_items: 9,
          created_at: '2024-12-15T14:30:00Z'
        }
      ];

      const mockParticipants: Participant[] = [
        { id: '1', name: 'João Silva', email: 'joao@empresa.com', phone: '+55 11 99999-9999', group_id: 'marketing' },
        { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', phone: '+55 11 88888-8888', group_id: 'marketing' },
        { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', phone: '+55 11 77777-7777', group_id: 'tech' },
        { id: '4', name: 'Ana Oliveira', email: 'ana@empresa.com', phone: '+55 11 66666-6666', group_id: 'marketing' }
      ];

      setBulkExpenses(mockBulkExpenses);
      setBulkOperations(mockBulkOperations);
      setParticipants(mockParticipants);
    } catch (error) {
      console.error('Erro ao carregar dados de bulk:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  const processBulkExpenses = async () => {
    // Simulate bulk processing
    console.log('Processando despesas em lote...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando gerenciamento de despesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Despesas em Lote
              </h1>
              <p className="text-gray-600 mt-1">
                Processe múltiplas despesas de forma eficiente
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Nova Operação
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'review', label: 'Revisar' },
              { id: 'process', label: 'Processar' },
              { id: 'history', label: 'Histórico' }
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
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload de Arquivo</h2>
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Arraste e solte seu arquivo aqui</p>
                      <p className="text-gray-500">ou clique para selecionar</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Selecionar Arquivo
                    </label>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    </div>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Upload em progresso...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {uploadProgress === 100 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-800 text-sm">
                          ✅ Arquivo carregado com sucesso! Clique em "Revisar" para continuar.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Formatos Suportados</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• CSV (.csv) - Separado por vírgulas</li>
                    <li>• Excel (.xlsx, .xls) - Planilhas do Microsoft Excel</li>
                    <li>• Colunas obrigatórias: Descrição, Valor, Data, Participantes</li>
                    <li>• Tamanho máximo: 10MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Revisar Despesas</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Exportar
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Processar Tudo
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                          <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {expense.participants.length} pessoas
                        </div>
                        <div className="text-xs text-gray-500">
                          {expense.split_method === 'equal' ? 'Divisão igual' : 'Proporcional'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          expense.status === 'processed' 
                            ? 'bg-green-100 text-green-800' 
                            : expense.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.status === 'processed' ? 'Processado' : 
                           expense.status === 'pending' ? 'Pendente' : 'Erro'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button className="text-red-600 hover:text-red-900">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Processamento em Lote</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Operações Ativas</h3>
                <div className="space-y-4">
                  {bulkOperations.filter(op => op.status === 'running').map((operation) => (
                    <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{operation.name}</h4>
                          <p className="text-sm text-gray-600">{operation.description}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Em execução
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progresso</span>
                          <span>{operation.processed_items}/{operation.total_items}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${operation.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Iniciado em {formatDate(operation.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Processamento</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Divisão Padrão
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="equal">Divisão Igual</option>
                      <option value="proportional">Divisão Proporcional</option>
                      <option value="custom">Divisão Personalizada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria Padrão
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="alimentacao">Alimentação</option>
                      <option value="transporte">Transporte</option>
                      <option value="hospedagem">Hospedagem</option>
                      <option value="entretenimento">Entretenimento</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo de Participantes
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="marketing">Equipe Marketing</option>
                      <option value="tech">Equipe Tech</option>
                      <option value="vendas">Equipe Vendas</option>
                      <option value="todos">Todos os Funcionários</option>
                    </select>
                  </div>

                  <button
                    onClick={processBulkExpenses}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Iniciar Processamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Operações</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Itens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Criação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conclusão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkOperations.map((operation) => (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{operation.name}</div>
                          <div className="text-sm text-gray-500">{operation.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          operation.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : operation.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {operation.status === 'completed' ? 'Concluído' : 
                           operation.status === 'running' ? 'Em execução' : 'Falhou'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {operation.processed_items}/{operation.total_items}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((operation.processed_items / operation.total_items) * 100)}% completo
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(operation.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {operation.completed_at ? formatDate(operation.completed_at) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Ver Detalhes</button>
                        <button className="text-green-600 hover:text-green-900">Exportar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default B2BBulkExpenseManagement; 