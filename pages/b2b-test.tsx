import React, { useState } from 'react';
import B2BRestaurantDashboard from '../components/B2BRestaurantDashboard';
import B2BEventOrganizer from '../components/B2BEventOrganizer';
import B2BBulkExpenseManagement from '../components/B2BBulkExpenseManagement';
import B2BPartnershipDashboard from '../components/B2BPartnershipDashboard';

export default function B2BTestPage() {
  const [activeFeature, setActiveFeature] = useState('restaurant');

  const features = [
    { id: 'restaurant', name: 'Restaurant Dashboard', component: B2BRestaurantDashboard },
    { id: 'events', name: 'Event Organizer', component: B2BEventOrganizer },
    { id: 'bulk', name: 'Bulk Management', component: B2BBulkExpenseManagement },
    { id: 'partnerships', name: 'Partnership Dashboard', component: B2BPartnershipDashboard }
  ];

  const ActiveComponent = features.find(f => f.id === activeFeature)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B2B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">B2B Features Test</h1>
                <p className="text-sm text-gray-500">Demonstração das funcionalidades B2B</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Story 15 - B2B Features
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeFeature === feature.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {feature.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Feature Description */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-blue-800">
            <strong>Funcionalidade Ativa:</strong> {features.find(f => f.id === activeFeature)?.name}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {activeFeature === 'restaurant' && 'Dashboard para restaurantes com gerenciamento de cardápio, contas e analytics'}
            {activeFeature === 'events' && 'Ferramentas para organizadores de eventos com gestão de participantes e despesas'}
            {activeFeature === 'bulk' && 'Gerenciamento em lote de despesas com operações automatizadas e analytics'}
            {activeFeature === 'partnerships' && 'Dashboard de parcerias com métricas de performance e analytics'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {features.find(f => f.id === activeFeature)?.name}
          </h2>
          <p className="text-gray-600">
            Esta é uma demonstração das funcionalidades B2B implementadas para Story 15. 
            Os dados são simulados para fins de demonstração.
          </p>
        </div>

        {/* Feature Component */}
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Restaurant Dashboard</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Gerenciamento de cardápio</li>
                <li>• Processamento de contas</li>
                <li>• Analytics de negócio</li>
                <li>• Gestão de clientes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Event Organizer</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Criação de eventos</li>
                <li>• Gestão de participantes</li>
                <li>• Controle de despesas</li>
                <li>• Analytics de eventos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Bulk Management</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Importação em lote</li>
                <li>• Operações automatizadas</li>
                <li>• Processamento de dados</li>
                <li>• Analytics de eficiência</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Partnership Dashboard</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Gestão de parcerias</li>
                <li>• Métricas de performance</li>
                <li>• Analytics de receita</li>
                <li>• Tracking de crescimento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 