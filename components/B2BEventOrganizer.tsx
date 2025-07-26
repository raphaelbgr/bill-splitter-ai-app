import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface EventData {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  organizer_name: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participant_count: number;
  total_budget: number;
  expenses_count: number;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'declined';
  expenses_paid: number;
  expenses_owed: number;
}

interface EventExpense {
  id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_among: string[];
  date: string;
  category: string;
  status: 'pending' | 'settled' | 'disputed';
}

const B2BEventOrganizer: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<EventExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'participants' | 'expenses' | 'analytics'>('events');

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading event data
      const mockEvents: EventData[] = [
        {
          id: 'event_001',
          name: 'Festa de Formatura 2024',
          description: 'Festa de formatura da turma de Engenharia',
          date: '2024-12-20',
          location: 'Espaço de Eventos São Paulo',
          organizer_name: 'Comissão de Formatura',
          status: 'upcoming',
          participant_count: 150,
          total_budget: 25000.00,
          expenses_count: 12
        },
        {
          id: 'event_002',
          name: 'Conferência Tech Brasil',
          description: 'Conferência anual de tecnologia',
          date: '2024-11-15',
          location: 'Centro de Convenções',
          organizer_name: 'Tech Events Brasil',
          status: 'completed',
          participant_count: 300,
          total_budget: 45000.00,
          expenses_count: 25
        }
      ];

      const mockParticipants: Participant[] = [
        { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '+55 11 99999-9999', status: 'confirmed', expenses_paid: 150.00, expenses_owed: 0 },
        { id: '2', name: 'Maria Santos', email: 'maria@email.com', phone: '+55 11 88888-8888', status: 'confirmed', expenses_paid: 200.00, expenses_owed: 50.00 },
        { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', phone: '+55 11 77777-7777', status: 'pending', expenses_paid: 0, expenses_owed: 100.00 }
      ];

      const mockExpenses: EventExpense[] = [
        { id: '1', description: 'Decoração do salão', amount: 5000.00, paid_by: 'Comissão de Formatura', split_among: ['João Silva', 'Maria Santos', 'Pedro Costa'], date: '2024-12-10', category: 'Decoração', status: 'settled' },
        { id: '2', description: 'Buffet para 150 pessoas', amount: 15000.00, paid_by: 'Comissão de Formatura', split_among: ['João Silva', 'Maria Santos', 'Pedro Costa'], date: '2024-12-15', category: 'Alimentação', status: 'pending' },
        { id: '3', description: 'Fotógrafo profissional', amount: 3000.00, paid_by: 'João Silva', split_among: ['João Silva', 'Maria Santos', 'Pedro Costa'], date: '2024-12-12', category: 'Serviços', status: 'settled' }
      ];

      setEvents(mockEvents);
      setSelectedEvent(mockEvents[0]);
      setParticipants(mockParticipants);
      setExpenses(mockExpenses);
    } catch (error) {
      console.error('Erro ao carregar dados do evento:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Organizador de Eventos
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus eventos e despesas com RachaAI
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Novo Evento
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
              { id: 'events', label: 'Eventos' },
              { id: 'participants', label: 'Participantes' },
              { id: 'expenses', label: 'Despesas' },
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
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Meus Eventos</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Filtrar
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Exportar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event.participant_count} participantes
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Orçamento</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(event.total_budget)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Despesas</p>
                        <p className="font-semibold text-gray-900">{event.expenses_count}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Gerenciar
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                      Editar
                    </button>
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
                <p className="text-gray-600 mt-1">{selectedEvent.name}</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Adicionar Participante
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Exportar Lista
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deve
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">{participant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          participant.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : participant.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {participant.status === 'confirmed' ? 'Confirmado' : 
                           participant.status === 'pending' ? 'Pendente' : 'Recusou'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(participant.expenses_paid)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(participant.expenses_owed)}</div>
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

        {activeTab === 'expenses' && selectedEvent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Despesas do Evento</h2>
                <p className="text-gray-600 mt-1">{selectedEvent.name}</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Nova Despesa
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Relatório
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      Pago por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
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
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                        <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{expense.paid_by}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          expense.status === 'settled' 
                            ? 'bg-green-100 text-green-800' 
                            : expense.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.status === 'settled' ? 'Liquidado' : 
                           expense.status === 'pending' ? 'Pendente' : 'Disputado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button className="text-green-600 hover:text-green-900">Liquidar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && selectedEvent && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics do Evento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Financeiro</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Orçamento Total</span>
                    <span className="font-medium">{formatCurrency(selectedEvent.total_budget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Despesas Registradas</span>
                    <span className="font-medium">{formatCurrency(23000.00)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Saldo</span>
                    <span className="text-green-600 font-medium">{formatCurrency(2000.00)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status dos Participantes</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confirmados</span>
                    <span className="font-medium text-green-600">120</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pendentes</span>
                    <span className="font-medium text-yellow-600">25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recusaram</span>
                    <span className="font-medium text-red-600">5</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas por Categoria</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Alimentação</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Decoração</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Serviços</span>
                    <span className="font-medium">20%</span>
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

export default B2BEventOrganizer; 