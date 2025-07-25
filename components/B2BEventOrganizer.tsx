import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus,
  MapPin,
  Clock,
  UserPlus,
  FileText,
  BarChart3,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Share2,
  QrCode,
  MessageSquare,
  Bell
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participantCount: number;
  maxParticipants: number;
  totalBudget: number;
  collectedAmount: number;
  expenses: EventExpense[];
  participants: EventParticipant[];
}

interface EventExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

interface EventParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amountOwed: number;
  amountPaid: number;
  joinDate: string;
}

interface EventOrganizerProps {
  organizerId?: string;
}

export default function B2BEventOrganizer({ organizerId }: EventOrganizerProps) {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: 'event-001',
        title: 'Aniversário João - 30 anos',
        description: 'Festa de aniversário do João com churrasco e música ao vivo',
        date: '2024-02-15',
        time: '19:00',
        location: 'Espaço Eventos São Paulo - Rua Augusta, 500',
        organizer: 'Maria Santos',
        status: 'upcoming',
        participantCount: 45,
        maxParticipants: 60,
        totalBudget: 2500.00,
        collectedAmount: 1800.00,
        expenses: [
          {
            id: 'exp-001',
            description: 'Churrasco completo',
            amount: 1200.00,
            paidBy: 'Maria Santos',
            splitBetween: ['João Silva', 'Maria Santos', 'Ana Costa'],
            status: 'paid',
            createdAt: '2024-01-10T10:00:00Z'
          },
          {
            id: 'exp-002',
            description: 'Decoração e flores',
            amount: 350.00,
            paidBy: 'Ana Costa',
            splitBetween: ['Maria Santos', 'Ana Costa'],
            status: 'pending',
            createdAt: '2024-01-12T14:30:00Z'
          }
        ],
        participants: [
          {
            id: 'part-001',
            name: 'João Silva',
            email: 'joao.silva@email.com',
            phone: '(11) 99999-9999',
            status: 'confirmed',
            amountOwed: 150.00,
            amountPaid: 150.00,
            joinDate: '2024-01-05T09:00:00Z'
          },
          {
            id: 'part-002',
            name: 'Ana Costa',
            email: 'ana.costa@email.com',
            phone: '(11) 88888-8888',
            status: 'confirmed',
            amountOwed: 150.00,
            amountPaid: 100.00,
            joinDate: '2024-01-06T11:00:00Z'
          }
        ]
      },
      {
        id: 'event-002',
        title: 'Happy Hour Empresarial',
        description: 'Networking e happy hour para profissionais de TI',
        date: '2024-01-25',
        time: '18:30',
        location: 'Bar Tech - Av. Paulista, 1000',
        organizer: 'Carlos Tech',
        status: 'active',
        participantCount: 28,
        maxParticipants: 40,
        totalBudget: 800.00,
        collectedAmount: 600.00,
        expenses: [],
        participants: []
      }
    ];

    setEvents(mockEvents);
    setLoading(false);
  }, [organizerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando eventos...</p>
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
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizador de Eventos</h1>
                <p className="text-sm text-gray-500">RachaAI para Eventos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Criar Evento</span>
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
              { id: 'events', label: 'Meus Eventos', icon: Calendar },
              { id: 'participants', label: 'Participantes', icon: Users },
              { id: 'expenses', label: 'Despesas', icon: DollarSign },
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
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Meus Eventos</h2>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' 
                          ? 'bg-blue-100 text-blue-800' 
                          : event.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {event.status === 'upcoming' ? 'Próximo' : 
                         event.status === 'active' ? 'Ativo' : 
                         event.status === 'completed' ? 'Concluído' : 'Cancelado'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{event.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Participantes</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {event.participantCount}/{event.maxParticipants}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Orçamento</p>
                        <p className="text-lg font-semibold text-gray-900">
                          R$ {event.totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Arrecadado</p>
                        <p className="text-lg font-semibold text-green-600">
                          R$ {event.collectedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver detalhes
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'participants' && selectedEvent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Participantes</h2>
                <p className="text-sm text-gray-500">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => setShowParticipantModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Adicionar Participante</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Participantes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Devido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedEvent.participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{participant.email}</div>
                          <div className="text-sm text-gray-500">{participant.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            participant.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : participant.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {participant.status === 'confirmed' ? 'Confirmado' : 
                             participant.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            R$ {participant.amountOwed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600">
                            R$ {participant.amountPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
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

        {activeTab === 'expenses' && selectedEvent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Despesas do Evento</h2>
                <p className="text-sm text-gray-500">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Despesa</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Despesas</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedEvent.expenses.map((expense) => (
                  <div key={expense.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <DollarSign className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-500">Pago por: {expense.paidBy}</p>
                          <p className="text-xs text-gray-400">
                            Dividido entre: {expense.splitBetween.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">
                          R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : expense.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.status === 'paid' ? 'Pago' : 
                           expense.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics de Eventos</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Geral</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total de eventos</span>
                    <span className="text-sm font-medium text-gray-900">{events.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Eventos ativos</span>
                    <span className="text-sm font-medium text-gray-900">
                      {events.filter(e => e.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total de participantes</span>
                    <span className="text-sm font-medium text-gray-900">
                      {events.reduce((sum, e) => sum + e.participantCount, 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Receita</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total arrecadado</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {events.reduce((sum, e) => sum + e.collectedAmount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Orçamento total</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {events.reduce((sum, e) => sum + e.totalBudget, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Taxa de sucesso</span>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Participação</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Média por evento</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(events.reduce((sum, e) => sum + e.participantCount, 0) / events.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Taxa de confirmação</span>
                    <span className="text-sm font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Participantes recorrentes</span>
                    <span className="text-sm font-medium text-gray-900">15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Evento</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Evento</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Aniversário João"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrição do evento..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Horário</label>
                    <input
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Local</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Endereço do evento"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Orçamento</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Máx. Participantes</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Participant Modal */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Participante</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
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
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor da Contribuição</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0,00"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowParticipantModal(false)}
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

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Despesa</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Decoração e flores"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pago por</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da pessoa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dividir entre</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Nomes separados por vírgula"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
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
    </div>
  );
} 