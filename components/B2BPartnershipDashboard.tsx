import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Plus,
  Building2,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  Bell,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Target,
  Award,
  Share2,
  Link,
  Activity,
  PieChart,
  Filter
} from 'lucide-react';

interface Partnership {
  id: string;
  name: string;
  type: 'restaurant' | 'event_organizer' | 'corporate' | 'other';
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  startDate: string;
  revenueShare: number;
  monthlyRevenue: number;
  totalRevenue: number;
  customerCount: number;
  rating: number;
  location: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  lastActivity: string;
  performance: PartnershipPerformance;
}

interface PartnershipPerformance {
  revenueGrowth: number;
  customerGrowth: number;
  satisfactionScore: number;
  responseTime: number;
  completionRate: number;
  monthlyTransactions: number;
}

interface PartnershipDashboardProps {
  businessId?: string;
}

export default function B2BPartnershipDashboard({ businessId }: PartnershipDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    performance: 'all'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockPartnerships: Partnership[] = [
      {
        id: 'part-001',
        name: 'Restaurante Brasileiro',
        type: 'restaurant',
        status: 'active',
        startDate: '2024-01-15',
        revenueShare: 0.05,
        monthlyRevenue: 3850.25,
        totalRevenue: 15420.50,
        customerCount: 156,
        rating: 4.8,
        location: 'São Paulo, SP',
        contactPerson: 'João Silva',
        contactEmail: 'joao@restaurante.com',
        contactPhone: '(11) 3000-0000',
        lastActivity: '2024-01-15T19:30:00Z',
        performance: {
          revenueGrowth: 15.3,
          customerGrowth: 8.7,
          satisfactionScore: 4.8,
          responseTime: 2.5,
          completionRate: 94.2,
          monthlyTransactions: 45
        }
      },
      {
        id: 'part-002',
        name: 'Eventos TechCorp',
        type: 'event_organizer',
        status: 'active',
        startDate: '2024-01-10',
        revenueShare: 0.08,
        monthlyRevenue: 2200.00,
        totalRevenue: 8800.00,
        customerCount: 89,
        rating: 4.6,
        location: 'Rio de Janeiro, RJ',
        contactPerson: 'Maria Santos',
        contactEmail: 'maria@eventostech.com',
        contactPhone: '(21) 4000-0000',
        lastActivity: '2024-01-14T16:45:00Z',
        performance: {
          revenueGrowth: 12.1,
          customerGrowth: 15.2,
          satisfactionScore: 4.6,
          responseTime: 3.2,
          completionRate: 91.8,
          monthlyTransactions: 28
        }
      },
      {
        id: 'part-003',
        name: 'Corporação ABC',
        type: 'corporate',
        status: 'pending',
        startDate: '2024-01-20',
        revenueShare: 0.06,
        monthlyRevenue: 0,
        totalRevenue: 0,
        customerCount: 0,
        rating: 0,
        location: 'Brasília, DF',
        contactPerson: 'Carlos Lima',
        contactEmail: 'carlos@abc.com',
        contactPhone: '(61) 5000-0000',
        lastActivity: '2024-01-20T10:00:00Z',
        performance: {
          revenueGrowth: 0,
          customerGrowth: 0,
          satisfactionScore: 0,
          responseTime: 0,
          completionRate: 0,
          monthlyTransactions: 0
        }
      }
    ];

    setPartnerships(mockPartnerships);
    setLoading(false);
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard de parcerias...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = partnerships.reduce((sum, p) => sum + p.totalRevenue, 0);
  const activePartnerships = partnerships.filter(p => p.status === 'active').length;
  const averageRating = partnerships.length > 0 
    ? partnerships.reduce((sum, p) => sum + p.rating, 0) / partnerships.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Parcerias</h1>
                <p className="text-sm text-gray-500">Gerenciamento de parcerias B2B</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPartnershipModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Parceria</span>
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
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'partnerships', label: 'Parcerias', icon: Building2 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'performance', label: 'Performance', icon: Target }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Parcerias Ativas</p>
                    <p className="text-2xl font-semibold text-gray-900">{activePartnerships}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {partnerships.reduce((sum, p) => sum + p.customerCount, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avaliação Média</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Crescimento de Receita</h3>
                <div className="space-y-4">
                  {partnerships.filter(p => p.status === 'active').map((partnership) => (
                    <div key={partnership.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{partnership.name}</p>
                          <p className="text-xs text-gray-500">{partnership.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          +{partnership.performance.revenueGrowth}%
                        </p>
                        <p className="text-xs text-gray-500">
                          R$ {partnership.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Satisfação dos Clientes</h3>
                <div className="space-y-4">
                  {partnerships.filter(p => p.status === 'active').map((partnership) => (
                    <div key={partnership.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{partnership.name}</p>
                          <p className="text-xs text-gray-500">{partnership.customerCount} clientes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {partnership.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {partnership.performance.satisfactionScore.toFixed(1)}/5.0
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partnerships' && (
          <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="restaurant">Restaurantes</option>
                    <option value="event_organizer">Organizadores de Eventos</option>
                    <option value="corporate">Corporativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Performance</label>
                  <select
                    value={filters.performance}
                    onChange={(e) => setFilters({ ...filters, performance: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partnerships List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {partnerships.map((partnership) => (
                <div key={partnership.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{partnership.name}</h3>
                        <p className="text-sm text-gray-500">{partnership.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partnership.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : partnership.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : partnership.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {partnership.status === 'active' ? 'Ativo' : 
                           partnership.status === 'pending' ? 'Pendente' : 
                           partnership.status === 'suspended' ? 'Suspenso' : 'Terminado'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {partnership.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Receita Mensal</p>
                        <p className="text-lg font-semibold text-gray-900">
                          R$ {partnership.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Clientes</p>
                        <p className="text-lg font-semibold text-gray-900">{partnership.customerCount}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Crescimento de Receita</span>
                        <span className={`font-medium ${
                          partnership.performance.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {partnership.performance.revenueGrowth > 0 ? '+' : ''}{partnership.performance.revenueGrowth}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Taxa de Conclusão</span>
                        <span className="font-medium text-gray-900">
                          {partnership.performance.completionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tempo de Resposta</span>
                        <span className="font-medium text-gray-900">
                          {partnership.performance.responseTime}h
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Contato: {partnership.contactPerson}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Ver detalhes
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
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
            <h2 className="text-xl font-semibold text-gray-900">Analytics de Parcerias</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Crescimento</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Receita total</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Crescimento médio</span>
                    <span className="text-sm font-medium text-green-600">+13.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Novas parcerias</span>
                    <span className="text-sm font-medium text-gray-900">3 este mês</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Satisfação</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Avaliação média</span>
                    <span className="text-sm font-medium text-gray-900">{averageRating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Taxa de retenção</span>
                    <span className="text-sm font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tempo de resposta</span>
                    <span className="text-sm font-medium text-gray-900">2.8h</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Taxa de conclusão</span>
                    <span className="text-sm font-medium text-green-600">93%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Eficiência operacional</span>
                    <span className="text-sm font-medium text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ROI médio</span>
                    <span className="text-sm font-medium text-green-600">320%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Métricas de Performance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {partnerships
                    .filter(p => p.status === 'active')
                    .sort((a, b) => b.performance.revenueGrowth - a.performance.revenueGrowth)
                    .slice(0, 3)
                    .map((partnership, index) => (
                      <div key={partnership.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100' : 
                            index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              index === 0 ? 'text-yellow-600' : 
                              index === 1 ? 'text-gray-600' : 'text-orange-600'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{partnership.name}</p>
                            <p className="text-xs text-gray-500">{partnership.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            +{partnership.performance.revenueGrowth}%
                          </p>
                          <p className="text-xs text-gray-500">
                            R$ {partnership.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Melhores Avaliações</h3>
                <div className="space-y-4">
                  {partnerships
                    .filter(p => p.status === 'active')
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 3)
                    .map((partnership, index) => (
                      <div key={partnership.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100' : 
                            index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                          }`}>
                            <Star className={`h-4 w-4 ${
                              index === 0 ? 'text-yellow-600' : 
                              index === 1 ? 'text-gray-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{partnership.name}</p>
                            <p className="text-xs text-gray-500">{partnership.customerCount} clientes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {partnership.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {partnership.performance.satisfactionScore.toFixed(1)}/5.0
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Partnership Modal */}
      {showPartnershipModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Parceria</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Parceria</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="restaurant">Restaurante</option>
                    <option value="event_organizer">Organizador de Eventos</option>
                    <option value="corporate">Corporativo</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Localização</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cidade, Estado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pessoa de Contato</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPartnershipModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Criar Parceria
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