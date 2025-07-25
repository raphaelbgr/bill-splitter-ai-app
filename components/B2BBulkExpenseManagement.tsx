import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Database,
  Calendar,
  Tag
} from 'lucide-react';

interface BulkExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  participants: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  batchId: string;
  createdAt: string;
  processedAt?: string;
}

interface BatchOperation {
  id: string;
  name: string;
  type: 'import' | 'export' | 'categorization' | 'splitting';
  status: 'running' | 'completed' | 'failed' | 'pending';
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
  completedAt?: string;
}

interface BulkExpenseManagementProps {
  businessId?: string;
}

export default function B2BBulkExpenseManagement({ businessId }: BulkExpenseManagementProps) {
  const [activeTab, setActiveTab] = useState('bulk');
  const [expenses, setExpenses] = useState<BulkExpense[]>([]);
  const [batches, setBatches] = useState<BatchOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchOperation | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dateRange: 'all'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockExpenses: BulkExpense[] = [
      {
        id: 'exp-001',
        description: 'Almoço equipe marketing',
        amount: 450.00,
        category: 'Alimentação',
        date: '2024-01-15',
        participants: ['João Silva', 'Maria Santos', 'Ana Costa', 'Carlos Lima'],
        status: 'completed',
        batchId: 'batch-001',
        createdAt: '2024-01-15T12:00:00Z',
        processedAt: '2024-01-15T12:05:00Z'
      },
      {
        id: 'exp-002',
        description: 'Transporte cliente',
        amount: 120.00,
        category: 'Transporte',
        date: '2024-01-14',
        participants: ['João Silva', 'Cliente ABC'],
        status: 'completed',
        batchId: 'batch-001',
        createdAt: '2024-01-14T15:30:00Z',
        processedAt: '2024-01-14T15:35:00Z'
      },
      {
        id: 'exp-003',
        description: 'Material escritório',
        amount: 89.50,
        category: 'Suprimentos',
        date: '2024-01-13',
        participants: ['Departamento TI'],
        status: 'processing',
        batchId: 'batch-002',
        createdAt: '2024-01-13T09:00:00Z'
      }
    ];

    const mockBatches: BatchOperation[] = [
      {
        id: 'batch-001',
        name: 'Importação Janeiro 2024',
        type: 'import',
        status: 'completed',
        totalItems: 25,
        processedItems: 25,
        successCount: 23,
        errorCount: 2,
        createdAt: '2024-01-15T10:00:00Z',
        completedAt: '2024-01-15T10:15:00Z'
      },
      {
        id: 'batch-002',
        name: 'Categorização Automática',
        type: 'categorization',
        status: 'running',
        totalItems: 15,
        processedItems: 8,
        successCount: 7,
        errorCount: 1,
        createdAt: '2024-01-15T14:00:00Z'
      },
      {
        id: 'batch-003',
        name: 'Divisão de Contas',
        type: 'splitting',
        status: 'pending',
        totalItems: 10,
        processedItems: 0,
        successCount: 0,
        errorCount: 0,
        createdAt: '2024-01-15T16:00:00Z'
      }
    ];

    setExpenses(mockExpenses);
    setBatches(mockBatches);
    setLoading(false);
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando gerenciamento em lote...</p>
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
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento em Lote</h1>
                <p className="text-sm text-gray-500">Processamento em massa de despesas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Importar</span>
              </button>
              <button
                onClick={() => setShowBatchModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Nova Operação</span>
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
              { id: 'bulk', label: 'Processamento em Lote', icon: Database },
              { id: 'batches', label: 'Operações', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Itens</p>
                    <p className="text-2xl font-semibold text-gray-900">{expenses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Processados</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {expenses.filter(e => e.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Em Processamento</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {expenses.filter(e => e.status === 'processing').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Valor Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      R$ {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendente</option>
                    <option value="processing">Processando</option>
                    <option value="completed">Concluído</option>
                    <option value="failed">Falhou</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todas</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Suprimentos">Suprimentos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Itens Processados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{expense.participants.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            expense.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : expense.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : expense.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {expense.status === 'completed' ? 'Concluído' : 
                             expense.status === 'processing' ? 'Processando' : 
                             expense.status === 'failed' ? 'Falhou' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Operações em Lote</h2>
              <button
                onClick={() => setShowBatchModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Operação</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {batches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{batch.name}</h3>
                        <p className="text-sm text-gray-500">
                          {batch.type === 'import' ? 'Importação' : 
                           batch.type === 'export' ? 'Exportação' : 
                           batch.type === 'categorization' ? 'Categorização' : 'Divisão'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : batch.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : batch.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {batch.status === 'completed' ? 'Concluído' : 
                         batch.status === 'running' ? 'Executando' : 
                         batch.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Progresso</p>
                        <div className="mt-1">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(batch.processedItems / batch.totalItems) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {batch.processedItems} de {batch.totalItems} itens
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Resultado</p>
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Sucesso: {batch.successCount}</span>
                            <span className="text-red-600">Erro: {batch.errorCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Criado: {new Date(batch.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center space-x-2">
                        {batch.status === 'running' && (
                          <button className="p-1 text-gray-400 hover:text-yellow-600">
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedBatch(batch)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver detalhes
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics de Processamento</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Eficiência</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Taxa de sucesso</span>
                    <span className="text-sm font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tempo médio</span>
                    <span className="text-sm font-medium text-gray-900">2.3s/item</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Itens/hora</span>
                    <span className="text-sm font-medium text-gray-900">1,560</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categorização</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Automática</span>
                    <span className="text-sm font-medium text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Manual</span>
                    <span className="text-sm font-medium text-gray-900">13%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Precisão</span>
                    <span className="text-sm font-medium text-green-600">96%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Economia</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tempo economizado</span>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Erros reduzidos</span>
                    <span className="text-sm font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ROI</span>
                    <span className="text-sm font-medium text-green-600">340%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Importar Despesas</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Arquivo CSV/Excel</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Fazer upload</span>
                          <input type="file" className="sr-only" accept=".csv,.xlsx,.xls" />
                        </label>
                        <p className="pl-1">ou arrastar e soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">CSV, Excel até 10MB</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Importação</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>Importação Padrão</option>
                    <option>Importação com Categorização</option>
                    <option>Importação com Divisão</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Importar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Operação em Lote</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Operação</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Categorização Automática"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="categorization">Categorização Automática</option>
                    <option value="splitting">Divisão de Contas</option>
                    <option value="export">Exportação</option>
                    <option value="cleanup">Limpeza de Dados</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Critérios</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Critérios para a operação..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Criar Operação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 