import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus,
  Menu,
  Receipt,
  BarChart3,
  Calendar,
  CreditCard,
  QrCode,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface RestaurantPartner {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  partnershipDate: string;
  revenueShare: number;
  totalRevenue: number;
  monthlyRevenue: number;
  customerCount: number;
  averageBill: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

interface BillTransaction {
  id: string;
  customerName: string;
  amount: number;
  participants: number;
  splitMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

interface RestaurantDashboardProps {
  partnerId?: string;
}

export default function B2BRestaurantDashboard({ partnerId }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState<RestaurantPartner | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [recentBills, setRecentBills] = useState<BillTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockRestaurant: RestaurantPartner = {
      id: 'rest-001',
      name: 'Restaurante Brasileiro',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123, São Paulo - SP',
      phone: '(11) 3000-0000',
      email: 'contato@restaurante.com',
      status: 'active',
      partnershipDate: '2024-01-15',
      revenueShare: 0.05, // 5%
      totalRevenue: 15420.50,
      monthlyRevenue: 3850.25,
      customerCount: 156,
      averageBill: 98.85
    };

    const mockMenuItems: MenuItem[] = [
      {
        id: 'menu-001',
        name: 'Feijoada Completa',
        description: 'Feijoada tradicional com todos os acompanhamentos',
        price: 45.90,
        category: 'Prato Principal',
        available: true
      },
      {
        id: 'menu-002',
        name: 'Picanha na Brasa',
        description: 'Picanha grelhada na brasa com farofa e vinagrete',
        price: 68.50,
        category: 'Prato Principal',
        available: true
      },
      {
        id: 'menu-003',
        name: 'Caipirinha',
        description: 'Caipirinha tradicional com limão e cachaça',
        price: 18.90,
        category: 'Bebidas',
        available: true
      }
    ];

    const mockBills: BillTransaction[] = [
      {
        id: 'bill-001',
        customerName: 'João Silva',
        amount: 156.80,
        participants: 4,
        splitMethod: 'equal',
        status: 'completed',
        createdAt: '2024-01-15T19:30:00Z',
        completedAt: '2024-01-15T20:15:00Z'
      },
      {
        id: 'bill-002',
        customerName: 'Maria Santos',
        amount: 89.50,
        participants: 2,
        splitMethod: 'proportional',
        status: 'pending',
        createdAt: '2024-01-15T20:45:00Z'
      }
    ];

    setRestaurant(mockRestaurant);
    setMenuItems(mockMenuItems);
    setRecentBills(mockBills);
    setLoading(false);
  }, [partnerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard do restaurante...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurante não encontrado</h2>
          <p className="text-gray-600">O restaurante solicitado não foi encontrado ou não está ativo.</p>
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
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-sm text-gray-500">Parceiro RachaAI</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                restaurant.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : restaurant.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {restaurant.status === 'active' ? 'Ativo' : 
                 restaurant.status === 'pending' ? 'Pendente' : 'Suspenso'}
              </span>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
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
              { id: 'menu', label: 'Cardápio', icon: Menu },
              { id: 'bills', label: 'Contas', icon: Receipt },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'customers', label: 'Clientes', icon: Users }
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
                    <p className="text-sm font-medium text-gray-500">Receita Mensal</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      R$ {restaurant.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Clientes</p>
                    <p className="text-2xl font-semibold text-gray-900">{restaurant.customerCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Receipt className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      R$ {restaurant.averageBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Comissão</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(restaurant.revenueShare * 100).toFixed(1)}%
                    </p>
                  </div>
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
                  {recentBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Receipt className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bill.customerName}</p>
                          <p className="text-sm text-gray-500">
                            R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • {bill.participants} pessoas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : bill.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.status === 'completed' ? 'Concluído' : 
                           bill.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Cardápio</h2>
              <button
                onClick={() => setShowMenuModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Itens do Cardápio</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Menu className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">
                        R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Disponível' : 'Indisponível'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Contas Recentes</h2>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <Upload className="h-4 w-4" />
                  Importar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transações</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participantes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
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
                    {recentBills.map((bill) => (
                      <tr key={bill.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bill.participants}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {bill.splitMethod === 'equal' ? 'Igual' : 'Proporcional'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bill.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : bill.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bill.status === 'completed' ? 'Concluído' : 
                             bill.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics do Negócio</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Receita por Período</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Este mês</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {restaurant.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mês anterior</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {(restaurant.monthlyRevenue * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Crescimento</span>
                    <span className="text-sm font-medium text-green-600">+5.3%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Clientes</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total de clientes</span>
                    <span className="text-sm font-medium text-gray-900">{restaurant.customerCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Novos este mês</span>
                    <span className="text-sm font-medium text-gray-900">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Taxa de retenção</span>
                    <span className="text-sm font-medium text-green-600">87%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Clientes</h2>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Clientes Frequentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">JS</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">João Silva</p>
                        <p className="text-sm text-gray-500">5 visitas este mês</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R$ 450,00</p>
                      <p className="text-sm text-gray-500">Total gasto</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">MS</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Maria Santos</p>
                        <p className="text-sm text-gray-500">3 visitas este mês</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R$ 280,00</p>
                      <p className="text-sm text-gray-500">Total gasto</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Item ao Cardápio</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Item</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Feijoada Completa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrição detalhada do item..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option>Prato Principal</option>
                      <option>Entrada</option>
                      <option>Sobremesa</option>
                      <option>Bebidas</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                    Disponível
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMenuModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Restaurante</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Restaurante</label>
                  <input
                    type="text"
                    defaultValue={restaurant.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                  <input
                    type="text"
                    defaultValue={restaurant.cnpj}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <input
                    type="text"
                    defaultValue={restaurant.address}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input
                    type="text"
                    defaultValue={restaurant.phone}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={restaurant.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Salvar
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