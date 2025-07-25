import React from 'react';
import PaymentInterface from '../components/PaymentInterface';

export default function PaymentTest() {
  // Mock user ID for testing
  const testUserId = 'test-user-123';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Teste do Sistema de Pagamento Brasileiro
          </h1>
          <p className="text-gray-600">
            Demonstração completa do sistema de pagamento com PIX, preferências brasileiras e LGPD.
          </p>
        </div>

        <PaymentInterface userId={testUserId} />
      </div>
    </div>
  );
} 