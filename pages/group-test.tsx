import React from 'react'
import GroupManagement from '../components/GroupManagement'
import MemberManagement from '../components/MemberManagement'
import { GroupWithContext, GroupMember } from '../lib/group-service'

export default function GroupTest() {
  const handleGroupCreated = (group: GroupWithContext) => {
    console.log('Group created:', group)
  }

  const handleGroupUpdated = (group: GroupWithContext) => {
    console.log('Group updated:', group)
  }

  const handleMemberAdded = (member: GroupMember) => {
    console.log('Member added:', member)
  }

  const handleMemberRemoved = (memberId: string) => {
    console.log('Member removed:', memberId)
  }

  const handlePreferencesUpdated = (memberId: string, preferences: any) => {
    console.log('Preferences updated:', memberId, preferences)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Teste de Gerenciamento de Grupos
          </h1>
          <p className="text-gray-600">
            Demonstração do sistema de gerenciamento de grupos com padrões sociais brasileiros
          </p>
        </div>

        <div className="space-y-8">
          {/* Group Management */}
          <GroupManagement 
            onGroupCreated={handleGroupCreated}
            onGroupUpdated={handleGroupUpdated}
          />

          {/* Member Management Demo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Demonstração de Gerenciamento de Membros
            </h2>
            <p className="text-gray-600 mb-6">
              Este é um exemplo de como o gerenciamento de membros funciona com preferências de pagamento brasileiras.
            </p>
            
            <MemberManagement
              groupId="demo-group-id"
              members={[
                {
                  id: 'member-1',
                  group_id: 'demo-group-id',
                  user_id: 'user-1',
                  role: 'admin',
                  status: 'active',
                  preferred_payment_method: 'PIX',
                  pix_key: 'joao@email.com',
                  joined_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                {
                  id: 'member-2',
                  group_id: 'demo-group-id',
                  user_id: 'user-2',
                  role: 'member',
                  status: 'active',
                  preferred_payment_method: 'TRANSFER',
                  pix_key: '',
                  joined_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]}
              onMemberAdded={handleMemberAdded}
              onMemberRemoved={handleMemberRemoved}
              onPreferencesUpdated={handlePreferencesUpdated}
            />
          </div>

          {/* Brazilian Cultural Patterns Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Padrões Culturais Brasileiros
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Churrasco</h3>
                <p className="text-blue-800 text-sm">
                  Contexto familiar, anfitrião paga pela carne. Divisão igual ou por família.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Happy Hour</h3>
                <p className="text-green-800 text-sm">
                  Divisão igual ou por consumo. Contexto de trabalho ou amigos.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Aniversário</h3>
                <p className="text-purple-800 text-sm">
                  Anfitrião paga ou vaquinha para presente. Contexto familiar e amigos.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Viagem</h3>
                <p className="text-yellow-800 text-sm">
                  Divisão igual para hospedagem e transporte. Contexto de amigos ou família.
                </p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Vaquinha</h3>
                <p className="text-red-800 text-sm">
                  Contribuição igual para presente ou causa. Contexto variado.
                </p>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">Rodízio</h3>
                <p className="text-indigo-800 text-sm">
                  Todos pagam igual. Contexto de amigos, trabalho ou faculdade.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Métodos de Pagamento Brasileiros
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">PIX</h3>
                <p className="text-green-800 text-sm">
                  Método preferido para a maioria das transações. Rápido e prático.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Transferência</h3>
                <p className="text-blue-800 text-sm">
                  Para valores maiores. Transferência bancária tradicional.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Dinheiro</h3>
                <p className="text-yellow-800 text-sm">
                  Para pequenos valores e situações informais.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">"Depois acerto"</h3>
                <p className="text-purple-800 text-sm">
                  Acompanhamento informal de dívidas. Muito comum no Brasil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 