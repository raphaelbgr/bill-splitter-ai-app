'use client'

import React, { useState, useEffect } from 'react'
import { GroupService, GroupMember } from '../lib/group-service'

interface MemberManagementProps {
  groupId: string
  members: GroupMember[]
  onMemberAdded?: (member: GroupMember) => void
  onMemberRemoved?: (memberId: string) => void
  onPreferencesUpdated?: (memberId: string, preferences: any) => void
}

export default function MemberManagement({ 
  groupId, 
  members, 
  onMemberAdded, 
  onMemberRemoved, 
  onPreferencesUpdated 
}: MemberManagementProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'guest'>('member')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingPreferences, setEditingPreferences] = useState<string | null>(null)
  const [preferences, setPreferences] = useState({
    preferred_payment_method: 'PIX',
    pix_key: ''
  })

  const groupService = new GroupService()

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      setError('Email é obrigatório')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you'd look up the user by email first
      // For now, we'll use a placeholder user ID
      const userId = `user-${Date.now()}` // Placeholder
      
      const success = await groupService.addMember(groupId, userId, newMemberRole)
      
      if (success) {
        const newMember: GroupMember = {
          id: `member-${Date.now()}`,
          group_id: groupId,
          user_id: userId,
          role: newMemberRole,
          status: 'active',
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        onMemberAdded?.(newMember)
        setIsAddingMember(false)
        setNewMemberEmail('')
        setNewMemberRole('member')
      } else {
        setError('Erro ao adicionar membro')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await groupService.removeMember(groupId, memberId)
      
      if (success) {
        onMemberRemoved?.(memberId)
      } else {
        setError('Erro ao remover membro')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover membro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePreferences = async (memberId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await groupService.updateMemberPreferences(groupId, memberId, preferences)
      
      if (success) {
        onPreferencesUpdated?.(memberId, preferences)
        setEditingPreferences(null)
        setPreferences({ preferred_payment_method: 'PIX', pix_key: '' })
      } else {
        setError('Erro ao atualizar preferências')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar preferências')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      member: 'Membro',
      guest: 'Convidado'
    }
    return labels[role] || role
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      TRANSFER: 'Transferência',
      CASH: 'Dinheiro',
      CREDIT_CARD: 'Cartão de Crédito',
      LATER: 'Depois acerto'
    }
    return labels[method] || method
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      blocked: 'Bloqueado'
    }
    return labels[status] || status
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Gerenciar Membros ({members.length})
          </h2>
          <button
            onClick={() => setIsAddingMember(!isAddingMember)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isAddingMember ? 'Cancelar' : 'Adicionar Membro'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Add Member Form */}
      {isAddingMember && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email do Membro *
              </label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="membro@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="member">Membro</option>
                <option value="admin">Administrador</option>
                <option value="guest">Convidado</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingMember(false)
                  setNewMemberEmail('')
                  setNewMemberRole('member')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMember}
                disabled={isLoading || !newMemberEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Adicionando...' : 'Adicionar Membro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Nenhum membro encontrado</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      ID: {member.user_id}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : member.role === 'member'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getRoleLabel(member.role)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : member.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(member.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Entrou: {new Date(member.joined_at).toLocaleDateString('pt-BR')}</span>
                    {member.preferred_payment_method && (
                      <span>Pagamento: {getPaymentMethodLabel(member.preferred_payment_method)}</span>
                    )}
                    {member.pix_key && (
                      <span>PIX: {member.pix_key}</span>
                    )}
                  </div>

                  {/* Payment Preferences */}
                  {editingPreferences === member.id ? (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Método de Pagamento Preferido
                        </label>
                        <select
                          value={preferences.preferred_payment_method}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            preferred_payment_method: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="PIX">PIX (Recomendado)</option>
                          <option value="TRANSFER">Transferência Bancária</option>
                          <option value="CASH">Dinheiro</option>
                          <option value="CREDIT_CARD">Cartão de Crédito</option>
                          <option value="LATER">Depois acerto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chave PIX (Opcional)
                        </label>
                        <input
                          type="text"
                          value={preferences.pix_key}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            pix_key: e.target.value
                          }))}
                          placeholder="Sua chave PIX"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingPreferences(null)
                            setPreferences({ preferred_payment_method: 'PIX', pix_key: '' })
                          }}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleUpdatePreferences(member.id)}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPreferences(member.id)
                          setPreferences({
                            preferred_payment_method: member.preferred_payment_method || 'PIX',
                            pix_key: member.pix_key || ''
                          })
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Editar Preferências
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 