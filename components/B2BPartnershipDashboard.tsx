import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Partnership {
  id: string;
  name: string;
  type: 'restaurant' | 'event_organizer' | 'corporate';
  status: 'active' | 'pending' | 'inactive';
  revenue_share: number;
  total_revenue: number;
  monthly_revenue: number;
  customer_count: number;
  partnership_date: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

interface PartnershipRevenue {
  id: string;
  partnership_id: string;
  month: string;
  revenue: number;
  transactions: number;
  customers: number;
  growth_rate: number;
}

interface PartnershipAnalytics {
  total_partnerships: number;
  active_partnerships: number;
  total_revenue: number;
  monthly_growth: number;
  average_revenue_per_partnership: number;
  top_performing_partnership: string;
}

const B2BPartnershipDashboard: React.FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [revenueData, setRevenueData] = useState<PartnershipRevenue[]>([]);
  const [analytics, setAnalytics] = useState<PartnershipAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'partnerships' | 'revenue' | 'analytics'>('overview');

  useEffect(() => {
    loadPartnershipData();
  }, []);

  const loadPartnershipData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading partnership data
      const mockPartnerships: Partnership[] = [
        {
          id: '1',
          name: 'Restaurante Brasileiro',
          type: 'restaurant',
          status: 'active',
          revenue_share: 0.05,
          total_revenue: 15420.50,
          monthly_revenue: 3850.25,
          customer_count: 892,
          partnership_date: '2024-01-15',
          contact_person: 'João Silva',
          contact_email: 'joao@restaurante.com',
          contact_phone: '+55 11 99999-9999'
        },
        {
          id: '2',
          name: 'Tech Events Brasil',
          type: 'event_organizer',
          status: 'active',
          revenue_share: 0.08,
          total_revenue: 28450.75,
          monthly_revenue: 7120.50,
          customer_count: 1247,
          partnership_date: '2024-02-01',
          contact_person: 'Maria Santos',
          contact_email: 'maria@techevents.com',
          contact_phone: '+55 11 88888-8888'
        },
        {
          id: '3',
          name: 'Empresa ABC',
          type: 'corporate',
          status: 'pending',
          revenue_share: 0.06,
          total_revenue: 0,
          monthly_revenue: 0,
          customer_count: 0,
          partnership_date: '2024-12-10',
          contact_person: 'Pedro Costa',
          contact_email: 'pedro@empresaabc.com',
          contact_phone: '+55 11 77777-7777'
        }
      ];

      const mockRevenueData: PartnershipRevenue[] = [
        {
          id: '1',
          partnership_id: '1',
          month: '2024-12',
          revenue: 3850.25,
          transactions: 124,
          customers: 89,
          growth_rate: 12.5
        },
        {
          id: '2',
          partnership_id: '1',
          month: '2024-11',
          revenue: 3420.00,
          transactions: 110,
          customers: 78,
          growth_rate: 8.3
        },
        {
          id: '3',
          partnership_id: '2',
          month: '2024-12',
          revenue: 7120.50,
          transactions: 245,
          customers: 156,
          growth_rate: 15.2
        }
      ];

      const mockAnalytics: PartnershipAnalytics = {
        total_partnerships: 3,
        active_partnerships: 2,
        total_revenue: 43871.25,
        monthly_growth: 13.8,
        average_revenue_per_partnership: 14623.75,
        top_performing_partnership: 'Tech Events Brasil'
      };

      setPartnerships(mockPartnerships);
      setRevenueData(mockRevenueData);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Erro ao carregar dados de parcerias:', error);
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

  const getPartnershipTypeText = (type: string) => {
    switch (type) {
      case 'restaurant': return 'Restaurante';
      case 'event_organizer': return 'Organizador de Eventos';
      case 'corporate': return 'Empresa';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard de Parcerias B2B
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie parcerias e acompanhe performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Nova Parceria
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
              { id: 'overview', label: 'Visão Geral' },
              { id: 'partnerships', label: 'Parcerias' },
              { id: 'revenue', label: 'Receita' },
              { id: 'analytics', label: 'Analytics' }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Parcerias</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics?.total_partnerships}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics?.total_revenue || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Crescimento Mensal</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      +{analytics?.monthly_growth}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Receita Média</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics?.average_revenue_per_partnership || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Partnership */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parceria de Melhor Performance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-gray-900">{analytics?.top_performing_partnership}</p>
                  <p className="text-gray-600">Maior receita gerada este mês</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">+15.2%</p>
                  <p className="text-sm text-gray-500">vs mês anterior</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {partnerships.slice(0, 3).map((partnership) => (
                    <div key={partnership.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{partnership.name}</p>
                          <p className="text-sm text-gray-500">
                            {getPartnershipTypeText(partnership.type)} • {partnership.contact_person}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(partnership.monthly_revenue)}</p>
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(partnership.status)}`}>
                          {partnership.status === 'active' ? 'Ativo' : 
                           partnership.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </span>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Parcerias</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Exportar
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Filtrar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parceiro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receita Mensal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partnerships.map((partnership) => (
                    <tr key={partnership.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{partnership.name}</div>
                          <div className="text-sm text-gray-500">Desde {formatDate(partnership.partnership_date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getPartnershipTypeText(partnership.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(partnership.status)}`}>
                          {partnership.status === 'active' ? 'Ativo' : 
                           partnership.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(partnership.monthly_revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {partnership.customer_count} clientes
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {(partnership.revenue_share * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{partnership.contact_person}</div>
                          <div className="text-sm text-gray-500">{partnership.contact_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Ver Detalhes</button>
                        <button className="text-red-600 hover:text-red-900">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Análise de Receita</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Receita por Parceiro</h3>
                <div className="space-y-4">
                  {partnerships.map((partnership) => (
                    <div key={partnership.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{partnership.name}</p>
                        <p className="text-sm text-gray-500">{getPartnershipTypeText(partnership.type)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(partnership.monthly_revenue)}</p>
                        <p className="text-sm text-gray-500">este mês</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Crescimento Mensal</h3>
                <div className="space-y-4">
                  {revenueData.map((revenue) => {
                    const partnership = partnerships.find(p => p.id === revenue.partnership_id);
                    return (
                      <div key={revenue.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{partnership?.name}</p>
                          <p className="text-sm text-gray-500">{revenue.transactions} transações</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(revenue.revenue)}</p>
                          <p className={`text-sm ${revenue.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenue.growth_rate > 0 ? '+' : ''}{revenue.growth_rate}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics Avançados</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance por Tipo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Restaurantes</span>
                    <span className="font-medium">45% da receita</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eventos</span>
                    <span className="font-medium">35% da receita</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Empresas</span>
                    <span className="font-medium">20% da receita</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Taxa de Conversão</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Parcerias Ativas</span>
                    <span className="font-medium text-green-600">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Retenção Mensal</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Crescimento</span>
                    <span className="font-medium text-green-600">+13.8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Projeções</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Próximo mês</span>
                    <span className="font-medium">{formatCurrency(50000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">3 meses</span>
                    <span className="font-medium">{formatCurrency(75000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">6 meses</span>
                    <span className="font-medium">{formatCurrency(120000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default B2BPartnershipDashboard; 