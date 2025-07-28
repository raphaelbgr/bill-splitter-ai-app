import React from 'react';
import Head from 'next/head';
import IntelligentAutomationDashboard from '../components/IntelligentAutomationDashboard';

export default function AutomationTestPage() {
  const testUserId = 'test-user-123';

  const handleSuggestionAccepted = (suggestion: any) => {
    console.log('Suggestion accepted:', suggestion);
    // In a real app, this would save the suggestion to the database
    alert('Sugestão aceita! Verifique o console para mais detalhes.');
  };

  const handleReminderCreated = (reminder: any) => {
    console.log('Reminder created:', reminder);
    // In a real app, this would schedule the reminder
    alert('Lembrete criado! Verifique o console para mais detalhes.');
  };

  return (
    <>
      <Head>
        <title>Teste de Automação Inteligente - RachaAI</title>
        <meta name="description" content="Teste dos recursos de automação inteligente do RachaAI" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teste de Automação Inteligente
            </h1>
            <p className="text-gray-600">
              Demonstração dos recursos de IA que aprendem e sugerem baseado no contexto brasileiro
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Como Testar
            </h2>
            <ul className="text-blue-800 space-y-1">
              <li>• Preencha a descrição da despesa em português brasileiro</li>
              <li>• Adicione o valor e os participantes</li>
              <li>• Teste os diferentes recursos de automação</li>
              <li>• Observe como a IA considera o contexto cultural brasileiro</li>
            </ul>
          </div>

          <IntelligentAutomationDashboard
            userId={testUserId}
            onSuggestionAccepted={handleSuggestionAccepted}
            onReminderCreated={handleReminderCreated}
          />

          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recursos Implementados
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Categorização Inteligente</h3>
                    <p className="text-sm text-gray-600">
                      Categoriza automaticamente despesas baseado em contexto brasileiro
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Divisão Preditiva</h3>
                    <p className="text-sm text-gray-600">
                      Sugere métodos de divisão baseados em padrões culturais
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Recomendações de Grupo</h3>
                    <p className="text-sm text-gray-600">
                      Sugere grupos baseados em cenários brasileiros
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Lembretes Automatizados</h3>
                    <p className="text-sm text-gray-600">
                      Cria lembretes culturalmente apropriados
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">5</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics de Automação</h3>
                    <p className="text-sm text-gray-600">
                      Monitora performance e satisfação do usuário
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-semibold">6</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Contexto Cultural</h3>
                    <p className="text-sm text-gray-600">
                      Considera padrões sociais brasileiros
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Exemplos de Teste
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Churrasco</h3>
                <p className="text-sm text-gray-600">
                  "Churrasco no domingo com a galera, R$ 150,00"
                </p>
                <p className="text-xs text-gray-500">
                  Deve sugerir: divisão igual, grupo "Churrasco da Galera"
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Happy Hour</h3>
                <p className="text-sm text-gray-600">
                  "Happy hour do trabalho, R$ 80,00"
                </p>
                <p className="text-xs text-gray-500">
                  Deve sugerir: divisão por consumo, grupo "Happy Hour do Trabalho"
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Aniversário</h3>
                <p className="text-sm text-gray-600">
                  "Festa de aniversário da Maria, R$ 200,00"
                </p>
                <p className="text-xs text-gray-500">
                  Deve sugerir: anfitrião paga, grupo "Festa de Aniversário"
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Viagem</h3>
                <p className="text-sm text-gray-600">
                  "Viagem para a praia, R$ 500,00"
                </p>
                <p className="text-xs text-gray-500">
                  Deve sugerir: divisão igual, grupo "Viagem dos Amigos"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 