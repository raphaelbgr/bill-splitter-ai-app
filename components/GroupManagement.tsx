'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { GroupService, GroupWithContext, CreateGroupData } from '../lib/group-service'
import { BrazilianCulturalContext, BrazilianScenario, BrazilianGroupType } from '../lib/cultural-context'

interface GroupManagementProps {
  onGroupCreated?: (group: GroupWithContext) => void
  onGroupUpdated?: (group: GroupWithContext) => void
}

interface GroupActivity {
  id: string
  type: 'created' | 'member_added' | 'member_removed' | 'payment_added' | 'expense_added' | 'group_updated'
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

export default function GroupManagement({ onGroupCreated, onGroupUpdated }: GroupManagementProps) {
  const [groups, setGroups] = useState<GroupWithContext[]>([])
  const [currentGroup, setCurrentGroup] = useState<GroupWithContext | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realTimeUpdates, setRealTimeUpdates] = useState<{[key: string]: boolean}>({})
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [groupActivities, setGroupActivities] = useState<{[key: string]: GroupActivity[]}>({})
  
  // Form states
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupType, setGroupType] = useState<'casual' | 'recurring' | 'event' | 'travel'>('casual')
  const [scenario, setScenario] = useState<BrazilianScenario>('restaurante')
  const [splitMethod, setSplitMethod] = useState<'equal' | 'weighted' | 'custom'>('equal')
  const [paymentPreference, setPaymentPreference] = useState<'pix' | 'boleto' | 'cartao' | 'dinheiro'>('pix')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const groupService = useMemo(() => new GroupService(), [])

  // Helper function to map group types to cultural context
  const mapGroupTypeToCultural = (groupType: 'casual' | 'recurring' | 'event' | 'travel'): BrazilianGroupType => {
    switch (groupType) {
      case 'casual': return 'amigos'
      case 'recurring': return 'trabalho'
      case 'event': return 'familia'
      case 'travel': return 'amigos'
      default: return 'amigos'
    }
  }

  const loadGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const userGroups = await groupService.getUserGroups()
      setGroups(userGroups)
      
      // Initialize activities for each group
      const activities: {[key: string]: GroupActivity[]} = {}
      userGroups.forEach(group => {
        activities[group.id] = [
          {
            id: '1',
            type: 'created',
            description: `Grupo "${group.name}" foi criado`,
            timestamp: group.created_at,
            userId: group.created_by,
            userName: 'Você'
          }
        ]
      })
      setGroupActivities(activities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos')
    } finally {
      setIsLoading(false)
    }
  }, [groupService])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdates(prev => {
        const updates = { ...prev }
        groups.forEach(group => {
          if (Math.random() > 0.8) { // 20% chance of update
            updates[group.id] = true
            setTimeout(() => {
              setRealTimeUpdates(current => ({ ...current, [group.id]: false }))
            }, 3000)
          }
        })
        return updates
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [groups])

  useEffect(() => {
    if (groupName || groupDescription) {
      const context = `${groupName} ${groupDescription}`.trim()
      if (context) {
        setSuggestions(groupService.getGroupSuggestions(context))
      }
    }
  }, [groupName, groupDescription, groupService])

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
          description: groupDescription.trim(),
          group_type: groupType,
          default_split_method: splitMethod,
          cultural_context: {
            scenario,
            groupType: mapGroupTypeToCultural(groupType),
            region: 'sao_paulo',
            timeOfDay: 'jantar',
            formalityLevel: 'informal',
            paymentMethod: paymentPreference,
            socialDynamics: 'igual',
            confidence: 0.9
          }
        }

        const newGroup = await groupService.createGroup(groupData)
        if (newGroup) {
          setGroups(prev => [newGroup, ...prev])
          
          // Add activity
          setGroupActivities(prev => ({
            ...prev,
            [newGroup.id]: [
              {
                id: Date.now().toString(),
                type: 'created',
                description: `Grupo "${newGroup.name}" foi criado`,
                timestamp: new Date().toISOString(),
                userId: 'user1',
                userName: 'Você'
              }
            ]
          }))

          onGroupCreated?.(newGroup)
        }
      resetForm()
      setIsCreating(false)
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
        // Reload groups to get updated data
        await loadGroups()
        
        // Add activity
        setGroupActivities(prev => ({
          ...prev,
          [groupId]: [
            ...(prev[groupId] || []),
            {
              id: Date.now().toString(),
              type: 'group_updated',
              description: 'Grupo foi atualizado',
              timestamp: new Date().toISOString(),
              userId: 'user1',
              userName: 'Você'
            }
          ]
        }))

        // Find the updated group
        const updatedGroup = groups.find(g => g.id === groupId)
        if (updatedGroup) {
          onGroupUpdated?.(updatedGroup)
        }
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
      await groupService.archiveGroup(groupId)
      setGroups(prev => prev.filter(group => group.id !== groupId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao arquivar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (groupId: string, email: string) => {
    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate invite
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add activity
      setGroupActivities(prev => ({
        ...prev,
        [groupId]: [
          ...(prev[groupId] || []),
          {
            id: Date.now().toString(),
            type: 'member_added',
            description: `Convite enviado para ${email}`,
            timestamp: new Date().toISOString(),
            userId: 'user1',
            userName: 'Você'
          }
        ]
      }))

      setInviteEmail('')
      setShowInviteModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return

    try {
      const shareData = {
        title: `Grupo: ${group.name}`,
        text: `Junte-se ao grupo "${group.name}" no RachaAI!`,
        url: `${window.location.origin}/group/${groupId}`
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url)
        alert('Link do grupo copiado para a área de transferência!')
      }
    } catch (err) {
      console.error('Erro ao compartilhar grupo:', err)
    }
  }

  const resetForm = () => {
    setGroupName('')
    setGroupDescription('')
    setGroupType('casual')
    setScenario('restaurante')
    setSplitMethod('equal')
    setPaymentPreference('pix')
    setSuggestions([])
    setError(null)
  }

  const getCulturalContextLabel = (context?: BrazilianCulturalContext) => {
    if (!context) return 'Sem contexto'
    return getScenarioLabel(context.scenario)
  }

  const getGroupTypeLabel = (type: string) => {
    const labels: {[key: string]: string} = {
      casual: 'Casual',
      recurring: 'Recorrente',
      event: 'Evento',
      travel: 'Viagem'
    }
    return labels[type] || type
  }

  const getSplitMethodLabel = (method: string) => {
    const labels: {[key: string]: string} = {
      equal: 'Igual',
      weighted: 'Ponderado',
      custom: 'Personalizado'
    }
    return labels[method] || method
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: {[key: string]: string} = {
      pix: 'PIX',
      boleto: 'Boleto',
      cartao: 'Cartão',
      dinheiro: 'Dinheiro'
    }
    return labels[method] || method
  }

  const getScenarioLabel = (scenario: BrazilianScenario) => {
    const labels: {[key: string]: string} = {
      restaurante: 'Restaurante',
      churrasco: 'Churrasco',
      happy_hour: 'Happy Hour',
      viagem: 'Viagem',
      festa: 'Festa',
      trabalho: 'Trabalho'
    }
    return labels[scenario] || scenario
  }

  const getCulturalGroupTypeLabel = (groupType: BrazilianGroupType) => {
    const labels: {[key: string]: string} = {
      amigos: 'Amigos',
      familia: 'Família',
      trabalho: 'Trabalho',
      conhecidos: 'Conhecidos'
    }
    return labels[groupType] || groupType
  }

  const getSocialDynamicsLabel = (socialDynamics: string) => {
    const labels: {[key: string]: string} = {
      igual: 'Igual',
      hierarquico: 'Hierárquico',
      flexivel: 'Flexível'
    }
    return labels[socialDynamics] || socialDynamics
  }

  const getActivityIcon = (type: string) => {
    const icons: {[key: string]: string} = {
      created: '🎉',
      member_added: '👤',
      member_removed: '🚪',
      payment_added: '💰',
      expense_added: '📊',
      group_updated: '✏️'
    }
    return icons[type] || '📝'
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" role="main" aria-label="Gerenciamento de Grupos">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciamento de Grupos
        </h1>
        <p className="text-gray-600 text-lg">
          Crie e gerencie grupos com contexto cultural brasileiro
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Criar Novo Grupo
          </h2>
        </div>

        {!isCreating ? (
          <div className="p-6">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Criar novo grupo"
            >
              + Criar Grupo
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Grupo *
                </label>
                <input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Churrasco da Galera"
                  aria-describedby="groupNameHelp"
                  aria-required="true"
                />
                <p id="groupNameHelp" className="mt-1 text-sm text-gray-500">
                  Escolha um nome que reflita o contexto do grupo
                </p>
              </div>

              <div>
                <label htmlFor="groupType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Grupo
                </label>
                <select
                  id="groupType"
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="groupTypeHelp"
                >
                  <option value="casual">Casual</option>
                  <option value="recurring">Recorrente</option>
                  <option value="event">Evento</option>
                  <option value="travel">Viagem</option>
                </select>
                <p id="groupTypeHelp" className="mt-1 text-sm text-gray-500">
                  Define o padrão de interação do grupo
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="groupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o propósito do grupo..."
                aria-describedby="groupDescriptionHelp"
              />
              <p id="groupDescriptionHelp" className="mt-1 text-sm text-gray-500">
                Ajude outros membros a entender o contexto
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-1">
                  Cenário Cultural
                </label>
                <select
                  id="scenario"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="scenarioHelp"
                >
                  <option value="restaurante">Restaurante</option>
                  <option value="churrasco">Churrasco</option>
                  <option value="happy_hour">Happy Hour</option>
                  <option value="viagem">Viagem</option>
                  <option value="festa">Festa</option>
                  <option value="trabalho">Trabalho</option>
                </select>
                <p id="scenarioHelp" className="mt-1 text-sm text-gray-500">
                  Contexto social brasileiro
                </p>
              </div>

              <div>
                <label htmlFor="splitMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Divisão
                </label>
                <select
                  id="splitMethod"
                  value={splitMethod}
                  onChange={(e) => setSplitMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="splitMethodHelp"
                >
                  <option value="equal">Igual</option>
                  <option value="weighted">Ponderado</option>
                  <option value="custom">Personalizado</option>
                </select>
                <p id="splitMethodHelp" className="mt-1 text-sm text-gray-500">
                  Como as despesas serão divididas
                </p>
              </div>

              <div>
                <label htmlFor="paymentPreference" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferência de Pagamento
                </label>
                <select
                  id="paymentPreference"
                  value={paymentPreference}
                  onChange={(e) => setPaymentPreference(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="paymentPreferenceHelp"
                >
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
                <p id="paymentPreferenceHelp" className="mt-1 text-sm text-gray-500">
                  Método preferido do grupo
                </p>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Sugestões de Nomes</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setGroupName(suggestion)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Usar sugestão: ${suggestion}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreating(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Cancelar criação de grupo"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isLoading || !groupName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={isLoading ? 'Criando grupo...' : 'Criar grupo'}
                aria-describedby={!groupName.trim() ? 'groupNameRequired' : undefined}
              >
                {isLoading ? 'Criando...' : 'Criar Grupo'}
              </button>
              {!groupName.trim() && (
                <div id="groupNameRequired" className="sr-only">
                  Nome do grupo é obrigatório
                </div>
              )}
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
          <div className="p-6 text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
            <p className="mt-2 text-gray-600">Carregando grupos...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Nenhum grupo encontrado</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Criar primeiro grupo"
            >
              Criar Primeiro Grupo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200" role="list" aria-label="Lista de grupos">
            {groups.map((group) => (
              <div key={group.id} className="p-4 md:p-6 relative" role="listitem">
                {/* Real-time update indicator */}
                {realTimeUpdates[group.id] && (
                  <div className="absolute top-2 right-2 flex items-center space-x-1" role="status" aria-live="polite">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                    <span className="text-xs text-green-600">Atualizando...</span>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-3 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {getCulturalContextLabel(group.cultural_context)}
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {getGroupTypeLabel(group.group_type)}
                        </span>
                      </div>
                    </div>
                    
                    {group.description && (
                      <p className="text-gray-600 mb-3 text-sm md:text-base">{group.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:flex md:items-center md:space-x-4 text-xs md:text-sm text-gray-500">
                      <span>Divisão: {getSplitMethodLabel(group.default_split_method)}</span>
                      <span>Membros: {group.members?.length || 0}</span>
                      <span className="col-span-2 md:col-span-1">Criado: {new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
                      {group.cultural_context?.paymentMethod && (
                        <span className="col-span-2 md:col-span-1">Pagamento: {getPaymentMethodLabel(group.cultural_context.paymentMethod)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => setCurrentGroup(group)}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Ver detalhes do grupo ${group.name}`}
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label={`Convidar membro para o grupo ${group.name}`}
                    >
                      Convidar
                    </button>
                    <button
                      onClick={() => handleShareGroup(group.id)}
                      className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label={`Compartilhar grupo ${group.name}`}
                    >
                      Compartilhar
                    </button>
                    <button
                      onClick={() => handleArchiveGroup(group.id)}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Arquivar grupo ${group.name}`}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 id="modal-title" className="text-lg md:text-xl font-semibold text-gray-900">
                  Detalhes do Grupo
                </h2>
                <button
                  onClick={() => setCurrentGroup(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Fechar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {currentGroup.name}
                  </h3>
                  {currentGroup.description && (
                    <p className="text-gray-600 text-sm md:text-base">{currentGroup.description}</p>
                  )}
                </div>
                
                {/* Enhanced Cultural Context Section */}
                {currentGroup.cultural_context && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <span className="mr-2">🇧🇷</span>
                      Contexto Cultural Brasileiro
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <span className="font-medium text-blue-800">Cenário:</span>
                        <span className="ml-2 text-blue-700">{getScenarioLabel(currentGroup.cultural_context.scenario)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <span className="font-medium text-blue-800">Tipo de Grupo:</span>
                        <span className="ml-2 text-blue-700">{getCulturalGroupTypeLabel(currentGroup.cultural_context.groupType)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <span className="font-medium text-blue-800">Método de Pagamento:</span>
                        <span className="ml-2 text-blue-700">{getPaymentMethodLabel(currentGroup.cultural_context.paymentMethod)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <span className="font-medium text-blue-800">Dinâmica Social:</span>
                        <span className="ml-2 text-blue-700">{getSocialDynamicsLabel(currentGroup.cultural_context.socialDynamics)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Status
                    </label>
                    <p className="text-gray-900 capitalize">{currentGroup.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membros
                    </label>
                    <p className="text-gray-900">{currentGroup.members?.length || 0}</p>
                  </div>
                </div>
                
                {/* Group Activity History */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Histórico de Atividades
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {groupActivities[currentGroup.id]?.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg" aria-hidden="true">
                          {getActivityIcon(activity.type)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">Nenhuma atividade registrada</p>
                    )}
                  </div>
                </div>
                
                {currentGroup.members && currentGroup.members.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">👥</span>
                      Membros do Grupo
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {currentGroup.members.map((member) => (
                        <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.user_id.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">ID: {member.user_id.substring(0, 8)}...</span>
                              <span className="block text-xs text-gray-500 capitalize">{member.role}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' :
                            member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 id="invite-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                Convidar Membro
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Convidado
                  </label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="exemplo@email.com"
                    aria-describedby="inviteEmailHelp"
                  />
                  <p id="inviteEmailHelp" className="mt-1 text-sm text-gray-500">
                    O convite será enviado por email
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowInviteModal(false)
                      setInviteEmail('')
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Cancelar convite"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleInviteMember(currentGroup?.id || '', inviteEmail)}
                    disabled={isLoading || !inviteEmail.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={isLoading ? 'Enviando convite...' : 'Enviar convite'}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Convite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 