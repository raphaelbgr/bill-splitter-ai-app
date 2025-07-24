'use client'

import React, { useState, useEffect } from 'react'
import { GroupService, GroupWithContext, CreateGroupData } from '../lib/group-service'
import { BrazilianCulturalContext } from '../lib/cultural-context'

interface GroupManagementProps {
  onGroupCreated?: (group: GroupWithContext) => void
  onGroupUpdated?: (group: GroupWithContext) => void
}

export default function GroupManagement({ onGroupCreated, onGroupUpdated }: GroupManagementProps) {
  const [groups, setGroups] = useState<GroupWithContext[]>([])
  const [currentGroup, setCurrentGroup] = useState<GroupWithContext | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupType, setGroupType] = useState<'casual' | 'recurring' | 'event' | 'travel'>('casual')
  const [splitMethod, setSplitMethod] = useState<'equal' | 'weighted' | 'custom'>('equal')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const groupService = new GroupService()

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    if (groupName || groupDescription) {
      const context = `${groupName} ${groupDescription}`.trim()
      if (context) {
        setSuggestions(groupService.getGroupSuggestions(context))
      }
    }
  }, [groupName, groupDescription])

  const loadGroups = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const userGroups = await groupService.getUserGroups()
      setGroups(userGroups)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Nome do grupo é obrigatório')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const groupData: CreateGroupData = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        group_type: groupType,
        default_split_method: splitMethod
      }

      const newGroup = await groupService.createGroup(groupData)
      
      if (newGroup) {
        setGroups(prev => [newGroup, ...prev])
        setCurrentGroup(newGroup)
        setIsCreating(false)
        resetForm()
        onGroupCreated?.(newGroup)
      } else {
        setError('Erro ao criar grupo')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateGroup = async (groupId: string, updateData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await groupService.updateGroup(groupId, updateData)
      
      if (success) {
        await loadGroups() // Reload to get updated data
        const updatedGroup = groups.find(g => g.id === groupId)
        if (updatedGroup) {
          onGroupUpdated?.(updatedGroup)
        }
      } else {
        setError('Erro ao atualizar grupo')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchiveGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja arquivar este grupo?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await groupService.archiveGroup(groupId)
      
      if (success) {
        setGroups(prev => prev.filter(g => g.id !== groupId))
        if (currentGroup?.id === groupId) {
          setCurrentGroup(null)
        }
      } else {
        setError('Erro ao arquivar grupo')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao arquivar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setGroupName('')
    setGroupDescription('')
    setGroupType('casual')
    setSplitMethod('equal')
    setSuggestions([])
  }

  const getCulturalContextLabel = (context?: BrazilianCulturalContext) => {
    if (!context) return 'Geral'
    
    const scenarioLabels: Record<string, string> = {
      churrasco: 'Churrasco',
      happy_hour: 'Happy Hour',
      aniversario: 'Aniversário',
      viagem: 'Viagem',
      vaquinha: 'Vaquinha',
      rodizio: 'Rodízio'
    }
    
    return scenarioLabels[context.scenario] || 'Geral'
  }

  const getGroupTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      casual: 'Casual',
      recurring: 'Recorrente',
      event: 'Evento',
      travel: 'Viagem'
    }
    return labels[type] || type
  }

  const getSplitMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      equal: 'Igual',
      weighted: 'Ponderado',
      custom: 'Personalizado'
    }
    return labels[method] || method
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciamento de Grupos
        </h1>
        <p className="text-gray-600">
          Crie e gerencie grupos com contexto cultural brasileiro
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Group Section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isCreating ? 'Criar Novo Grupo' : 'Criar Grupo'}
          </h2>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isCreating ? 'Cancelar' : 'Novo Grupo'}
          </button>
        </div>

        {isCreating && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Grupo *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Churrasco da Galera"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setGroupName(suggestion)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Descreva o grupo..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Grupo
                </label>
                <select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="casual">Casual</option>
                  <option value="recurring">Recorrente</option>
                  <option value="event">Evento</option>
                  <option value="travel">Viagem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Divisão Padrão
                </label>
                <select
                  value={splitMethod}
                  onChange={(e) => setSplitMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="equal">Igual</option>
                  <option value="weighted">Ponderado</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreating(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isLoading || !groupName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Criando...' : 'Criar Grupo'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Meus Grupos ({groups.length})
          </h2>
        </div>

        {isLoading && groups.length === 0 ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando grupos...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Nenhum grupo encontrado</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeiro Grupo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groups.map((group) => (
              <div key={group.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.name}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {getCulturalContextLabel(group.cultural_context)}
                      </span>
                    </div>
                    
                    {group.description && (
                      <p className="text-gray-600 mb-3">{group.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Tipo: {getGroupTypeLabel(group.group_type)}</span>
                      <span>Divisão: {getSplitMethodLabel(group.default_split_method)}</span>
                      <span>Membros: {group.members?.length || 0}</span>
                      <span>Criado: {new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentGroup(group)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleArchiveGroup(group.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Arquivar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Details Modal */}
      {currentGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes do Grupo
                </h2>
                <button
                  onClick={() => setCurrentGroup(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {currentGroup.name}
                  </h3>
                  {currentGroup.description && (
                    <p className="text-gray-600">{currentGroup.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <p className="text-gray-900">{getGroupTypeLabel(currentGroup.group_type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Divisão Padrão
                    </label>
                    <p className="text-gray-900">{getSplitMethodLabel(currentGroup.default_split_method)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contexto Cultural
                    </label>
                    <p className="text-gray-900">{getCulturalContextLabel(currentGroup.cultural_context)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membros
                    </label>
                    <p className="text-gray-900">{currentGroup.members?.length || 0}</p>
                  </div>
                </div>
                
                {currentGroup.members && currentGroup.members.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Membros</h4>
                    <div className="space-y-2">
                      {currentGroup.members.map((member) => (
                        <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-gray-900">ID: {member.user_id}</span>
                          <span className="text-sm text-gray-500 capitalize">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 