import React, { useState, useEffect, useCallback } from 'react';
import { PIXKey, PaymentPreference, PaymentSuggestion, DebtTracking } from '../lib/payment-system';

interface PaymentInterfaceProps {
  userId: string;
  onPaymentComplete?: (payment: any) => void;
}

export default function PaymentInterface({ userId, onPaymentComplete }: PaymentInterfaceProps) {
  // State management
  const [preferences, setPreferences] = useState<PaymentPreference | null>(null);
  const [pixKeys, setPixKeys] = useState<PIXKey[]>([]);
  const [debts, setDebts] = useState<DebtTracking[]>([]);
  const [suggestions, setSuggestions] = useState<PaymentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preferences' | 'pix' | 'debts' | 'suggestions'>('preferences');

  // Form states
  const [newPixKey, setNewPixKey] = useState({ keyType: 'email' as const, keyValue: '' });
  const [suggestionForm, setSuggestionForm] = useState({
    amount: 0,
    participants: 1,
    occasion: '',
    socialContext: 'friends',
    region: '',
    recipient: ''
  });

  // Load initial data
  useEffect(() => {
    loadPaymentData();
  }, [userId]);

  const loadPaymentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [prefsRes, pixRes, debtsRes] = await Promise.all([
        fetch(`/api/payment/preferences?userId=${userId}`),
        fetch(`/api/payment/pix-keys?userId=${userId}`),
        fetch(`/api/payment/debts?userId=${userId}`)
      ]);

      if (!prefsRes.ok || !pixRes.ok || !debtsRes.ok) {
        throw new Error('Failed to load payment data');
      }

      const [prefs, pix, debts] = await Promise.all([
        prefsRes.json(),
        pixRes.json(),
        debtsRes.json()
      ]);

      setPreferences(prefs);
      setPixKeys(pix);
      setDebts(debts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // PIX Key management
  const addPixKey = async () => {
    if (!newPixKey.keyValue.trim()) {
      setError('PIX key value is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/pix-keys?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPixKey)
      });

      if (!response.ok) {
        throw new Error('Failed to add PIX key');
      }

      const newKey = await response.json();
      setPixKeys(prev => [...prev, newKey]);
      setNewPixKey({ keyType: 'email', keyValue: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add PIX key');
    } finally {
      setLoading(false);
    }
  };

  const updatePixKey = async (keyId: string, updates: Partial<PIXKey>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/pix-keys?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update PIX key');
      }

      const updatedKey = await response.json();
      setPixKeys(prev => prev.map(key => key.id === keyId ? updatedKey : key));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PIX key');
    } finally {
      setLoading(false);
    }
  };

  const deletePixKey = async (keyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/pix-keys?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete PIX key');
      }

      setPixKeys(prev => prev.filter(key => key.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete PIX key');
    } finally {
      setLoading(false);
    }
  };

  // Payment preferences
  const updatePreferences = async (updates: Partial<PaymentPreference>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/preferences?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const updatedPrefs = await response.json();
      setPreferences(updatedPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  // Payment suggestions
  const generateSuggestions = async () => {
    if (!suggestionForm.amount || !suggestionForm.occasion) {
      setError('Amount and occasion are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: suggestionForm.amount,
          context: {
            participants: suggestionForm.participants,
            occasion: suggestionForm.occasion,
            region: suggestionForm.region,
            socialContext: suggestionForm.socialContext,
            recipient: suggestionForm.recipient
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Debt tracking
  const createDebt = async (debtData: {
    amount: number;
    description: string;
    method: DebtTracking['method'];
    socialContext: string;
    groupId?: string;
    dueDate?: Date;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/debts?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debtData)
      });

      if (!response.ok) {
        throw new Error('Failed to create debt');
      }

      const newDebt = await response.json();
      setDebts(prev => [...prev, newDebt]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create debt');
    } finally {
      setLoading(false);
    }
  };

  const updateDebtStatus = async (debtId: string, status: DebtTracking['status']) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/debts?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debtId, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update debt status');
      }

      const updatedDebt = await response.json();
      setDebts(prev => prev.map(debt => debt.id === debtId ? updatedDebt : debt));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update debt status');
    } finally {
      setLoading(false);
    }
  };

  // Export and delete data (LGPD compliance)
  const exportPaymentData = async () => {
    try {
      const response = await fetch(`/api/payment/export?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    }
  };

  const deletePaymentData = async () => {
    if (!confirm('Are you sure you want to delete all payment data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/delete?userId=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      setPreferences(null);
      setPixKeys([]);
      setDebts([]);
      setSuggestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Sistema de Pagamento Brasileiro
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'preferences', label: 'Preferências', icon: '⚙️' },
            { id: 'pix', label: 'PIX Keys', icon: '💰' },
            { id: 'debts', label: 'Dívidas', icon: '📊' },
            { id: 'suggestions', label: 'Sugestões', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && preferences && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferências de Pagamento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método Preferido
                </label>
                <select
                  value={preferences.preferredMethod}
                  onChange={(e) => updatePreferences({ preferredMethod: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pix">PIX</option>
                  <option value="transfer">Transferência</option>
                  <option value="cash">Dinheiro</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite de Dívida Confortável (R$)
                </label>
                <input
                  type="number"
                  value={preferences.comfortableDebtLimit}
                  onChange={(e) => updatePreferences({ comfortableDebtLimit: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência de Lembretes
                </label>
                <select
                  value={preferences.reminderFrequency}
                  onChange={(e) => updatePreferences({ reminderFrequency: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.autoReminderEnabled}
                  onChange={(e) => updatePreferences({ autoReminderEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Lembretes Automáticos
                </label>
              </div>
            </div>
          </div>

          {/* LGPD Compliance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">LGPD - Proteção de Dados</h3>
            <div className="flex space-x-4">
              <button
                onClick={exportPaymentData}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                📥 Exportar Dados
              </button>
              <button
                onClick={deletePaymentData}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                🗑️ Deletar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIX Keys Tab */}
      {activeTab === 'pix' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gerenciar PIX Keys</h2>
            
            {/* Add new PIX key */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova PIX Key</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newPixKey.keyType}
                  onChange={(e) => setNewPixKey(prev => ({ ...prev, keyType: e.target.value as any }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Telefone</option>
                  <option value="cpf">CPF</option>
                  <option value="random">Chave Aleatória</option>
                  <option value="cnpj">CNPJ</option>
                </select>
                <input
                  type="text"
                  placeholder="Valor da chave"
                  value={newPixKey.keyValue}
                  onChange={(e) => setNewPixKey(prev => ({ ...prev, keyValue: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addPixKey}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Existing PIX keys */}
            <div className="space-y-4">
              {pixKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {key.keyType.toUpperCase()}: {key.keyValue}
                    </div>
                    <div className="text-sm text-gray-500">
                      Status: {key.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updatePixKey(key.id, { isActive: !key.isActive })}
                      className={`px-3 py-1 rounded text-sm ${
                        key.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {key.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => deletePixKey(key.id)}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rastreamento de Dívidas</h2>
            
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{debt.description}</div>
                    <div className="text-sm text-gray-500">
                      R$ {debt.amount.toFixed(2)} • {debt.method} • {debt.socialContext}
                    </div>
                    <div className="text-xs text-gray-400">
                      Criado em: {new Date(debt.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      debt.status === 'paid' ? 'bg-green-100 text-green-800' :
                      debt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      debt.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {debt.status === 'paid' ? 'Pago' :
                       debt.status === 'pending' ? 'Pendente' :
                       debt.status === 'overdue' ? 'Vencido' :
                       'Lembrado'}
                    </span>
                    {debt.status === 'pending' && (
                      <button
                        onClick={() => updateDebtStatus(debt.id, 'paid')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Marcar Pago
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sugestões Inteligentes</h2>
            
            {/* Suggestion form */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gerar Sugestões</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={suggestionForm.amount}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Número de participantes"
                  value={suggestionForm.participants}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, participants: parseInt(e.target.value) || 1 }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Ocasião (rodizio, happy hour, etc.)"
                  value={suggestionForm.occasion}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, occasion: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={suggestionForm.socialContext}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, socialContext: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="friends">Amigos</option>
                  <option value="family">Família</option>
                  <option value="business">Trabalho</option>
                  <option value="informal">Informal</option>
                </select>
                <select
                  value={suggestionForm.region}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, region: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as regiões</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="NE">Nordeste</option>
                  <option value="RS">Rio Grande do Sul</option>
                </select>
                <input
                  type="text"
                  placeholder="Destinatário"
                  value={suggestionForm.recipient}
                  onChange={(e) => setSuggestionForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={generateSuggestions}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Gerar Sugestões
              </button>
            </div>

            {/* Suggestions results */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Sugestões Geradas</h3>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {suggestion.method.toUpperCase()} - R$ {suggestion.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Confiança: {(suggestion.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</div>
                    <div className="text-xs text-gray-500">
                      Contexto: {suggestion.socialContext} • Fatores regionais: {suggestion.regionalFactors.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 