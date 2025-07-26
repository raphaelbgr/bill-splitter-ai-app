import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, CheckCircle, AlertCircle, Clock, Wifi, WifiOff, Save, Trash2, X } from 'lucide-react';
import { useOfflineData, useNetworkStatus } from '../lib/pwa-hooks';

interface OfflineExpenseForm {
  title: string;
  amount: number;
  participants: string[];
  description: string;
  category: string;
  location: string;
}

interface OfflineExpenseTrackerProps {
  userId: string;
  onExpenseAdded?: (expense: any) => void;
  onSyncComplete?: (syncedCount: number) => void;
}

export default function OfflineExpenseTracker({
  userId,
  onExpenseAdded,
  onSyncComplete,
}: OfflineExpenseTrackerProps) {
  const { offlineData, addOfflineExpense, syncOfflineData, isLoading } = useOfflineData();
  const networkStatus = useNetworkStatus();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<OfflineExpenseForm>({
    title: '',
    amount: 0,
    participants: [],
    description: '',
    category: '',
    location: '',
  });

  const [newParticipant, setNewParticipant] = useState('');

  // Brazilian expense categories
  const categories = [
    'Restaurante',
    'Bar/Happy Hour',
    'Transporte',
    'Entretenimento',
    'Compras',
    'Viagem',
    'Churrasco',
    'Festa',
    'Outros',
  ];

  const handleAddExpense = async () => {
    if (!formData.title || formData.amount <= 0 || formData.participants.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await addOfflineExpense({
        title: formData.title,
        amount: formData.amount,
        participants: formData.participants,
        description: formData.description,
        category: formData.category,
        location: formData.location,
      });

      // Reset form
      setFormData({
        title: '',
        amount: 0,
        participants: [],
        description: '',
        category: '',
        location: '',
      });
      setShowForm(false);
      onExpenseAdded?.(formData);
    } catch (error) {
      console.error('Error adding offline expense:', error);
      alert('Erro ao adicionar despesa offline.');
    }
  };

  const handleSync = async () => {
    if (!networkStatus.isOnline) {
      alert('Sem conexão com a internet. Tente novamente quando estiver online.');
      return;
    }

    try {
      await syncOfflineData();
      const syncedCount = offlineData.pendingSync.length;
      onSyncComplete?.(syncedCount);
    } catch (error) {
      console.error('Error syncing offline data:', error);
      alert('Erro ao sincronizar dados offline.');
    }
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !formData.participants.includes(newParticipant.trim())) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()],
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (participant: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participant),
    }));
  };

  const pendingCount = offlineData.pendingSync.length;
  const totalExpenses = offlineData.expenses.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {networkStatus.isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Rastreamento Offline
              </h3>
              <p className="text-sm text-gray-500">
                {networkStatus.isOnline ? 'Online' : 'Offline'} - {totalExpenses} despesas salvas
              </p>
            </div>
          </div>
          
          {pendingCount > 0 && (
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {pendingCount} aguardando
              </div>
              <button
                onClick={handleSync}
                disabled={!networkStatus.isOnline || isLoading}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sincronizar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Button */}
      <div className="p-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Despesa Offline</span>
        </button>
      </div>

      {/* Offline Expenses List */}
      {offlineData.expenses.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Despesas Salvas ({offlineData.expenses.length})
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {offlineData.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-medium text-gray-900">
                        {expense.title}
                      </h5>
                      {expense.synced ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      R$ {expense.amount.toFixed(2)} • {expense.participants.length} participantes
                    </p>
                    {expense.category && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mt-1">
                        {expense.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(expense.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nova Despesa Offline
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título da Despesa *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Jantar no restaurante"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participantes *
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nome do participante"
                    />
                    <button
                      onClick={addParticipant}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.participants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.participants.map((participant) => (
                        <span
                          key={participant}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                        >
                          <span>{participant}</span>
                          <button
                            onClick={() => removeParticipant(participant)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Detalhes da despesa..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Local da despesa"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExpense}
                  disabled={!formData.title || formData.amount <= 0 || formData.participants.length === 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Salvar Offline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 