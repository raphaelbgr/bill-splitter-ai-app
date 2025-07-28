import React, { useState } from 'react';
import { LGPDComplianceUI } from '../components/LGPDComplianceUI';

export default function LGPDTestPage() {
  const [userId, setUserId] = useState('test-user-123');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ LGPD Compliance Test
          </h1>
          <p className="text-gray-600">
            Teste das funcionalidades de conformidade LGPD - Story 9
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Configuração de Teste
            </h2>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                User ID:
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                placeholder="Enter user ID for testing"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✅ Story 9: LGPD Compliance Implementation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Funcionalidades Implementadas</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Consentimento granular</li>
                  <li>✅ Exportação de dados</li>
                  <li>✅ Deletar dados</li>
                  <li>✅ Transparência de IA</li>
                  <li>✅ Retenção automática (90 dias)</li>
                  <li>✅ Gerenciamento de direitos</li>
                  <li>✅ Rastreamento de processamento</li>
                  <li>✅ Minimização de dados</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">APIs Criadas</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ /api/memory/consent</li>
                  <li>✅ /api/memory/transparency</li>
                  <li>✅ /api/memory/retention</li>
                  <li>✅ /api/memory/export</li>
                  <li>✅ /api/memory/delete</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Requisitos LGPD Atendidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Art. 8º - Consentimento</h4>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Consentimento livre e informado</li>
                    <li>• Consentimento específico</li>
                    <li>• Facilidade de revogação</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Art. 18º - Direitos</h4>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Confirmação e acesso</li>
                    <li>• Correção de dados</li>
                    <li>• Portabilidade</li>
                    <li>• Eliminação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <LGPDComplianceUI userId={userId} />
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Checklist de Conformidade LGPD
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Consentimento</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Consentimento granular implementado
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Revogação fácil de consentimento
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Histórico de consentimentos
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Base legal clara
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Direitos dos Usuários</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Direito de acesso implementado
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Direito de correção
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Direito à portabilidade
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Direito ao esquecimento
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Transparência</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Transparência de IA implementada
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Explicação de decisões automatizadas
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Rastreamento de processamento
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Informações sobre modelos de IA
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Retenção e Segurança</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Política de retenção de 90 dias
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Limpeza automática de dados
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Minimização de dados
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Propósito limitado
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 