import React, { useState, useEffect, useCallback } from 'react';
import { MobilePaymentRequest, MobilePaymentResponse, MobileWalletIntegration } from '../lib/mobile-payment-service';
import { PIXKey } from '../lib/payment-system';

interface MobilePaymentInterfaceProps {
  userId: string;
  onPaymentComplete?: (payment: MobilePaymentResponse) => void;
}

export default function MobilePaymentInterface({ userId, onPaymentComplete }: MobilePaymentInterfaceProps) {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixKeys, setPixKeys] = useState<PIXKey[]>([]);
  const [wallets, setWallets] = useState<MobileWalletIntegration[]>([]);
  const [paymentResponse, setPaymentResponse] = useState<MobilePaymentResponse | null>(null);
  const [suggestions, setSuggestions] = useState<any>(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    recipient: '',
    description: '',
    pixKey: '',
    mobileWallet: '' as 'mercado_pago' | 'picpay' | 'apple_pay' | 'google_pay' | '',
    installments: 1,
    region: 'BR',
    socialContext: 'friends'
  });

  // Device and network detection
  const [deviceInfo, setDeviceInfo] = useState({
    deviceType: 'mobile' as 'mobile' | 'tablet' | 'desktop',
    networkType: 'wifi' as 'wifi' | '4g' | '3g' | '2g'
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
    detectDeviceAndNetwork();
  }, [userId]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [pixRes, walletsRes] = await Promise.all([
        fetch(`/api/payment/pix-keys?userId=${userId}`),
        fetch(`/api/payment/mobile-wallets?userId=${userId}&region=BR`)
      ]);

      if (!pixRes.ok || !walletsRes.ok) {
        throw new Error('Failed to load payment data');
      }

      const [pix, walletsData] = await Promise.all([
        pixRes.json(),
        walletsRes.json()
      ]);

      setPixKeys(pix);
      setWallets(walletsData.wallets);

      // Set default PIX key if available
      if (pix.length > 0) {
        const activeKey = pix.find((key: PIXKey) => key.isActive);
        if (activeKey) {
          setPaymentForm(prev => ({ ...prev, pixKey: activeKey.keyValue }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const detectDeviceAndNetwork = useCallback(() => {
    // Detect device type
    const userAgent = navigator.userAgent;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|Android.*Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detect network type (simplified)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    let networkType: 'wifi' | '4g' | '3g' | '2g' = 'wifi';
    
    if (connection) {
      const effectiveType = connection.effectiveType || '4g';
      networkType = effectiveType as any;
    }

    setDeviceInfo({ deviceType, networkType });
  }, []);

  // Generate payment suggestions
  const generateSuggestions = useCallback(async () => {
    if (!paymentForm.amount || !paymentForm.recipient) {
      setError('Valor e destinatário são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/mobile-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: paymentForm.amount,
          region: paymentForm.region,
          socialContext: paymentForm.socialContext,
          deviceType: deviceInfo.deviceType,
          networkType: deviceInfo.networkType
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
  }, [userId, paymentForm, deviceInfo]);

  // Process mobile payment
  const processPayment = useCallback(async () => {
    if (!paymentForm.amount || !paymentForm.recipient || !paymentForm.description || !paymentForm.pixKey) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentRequest: MobilePaymentRequest = {
        amount: paymentForm.amount,
        recipient: paymentForm.recipient,
        description: paymentForm.description,
        pixKey: paymentForm.pixKey,
        mobileWallet: paymentForm.mobileWallet || undefined,
        installments: paymentForm.installments,
        region: paymentForm.region,
        socialContext: paymentForm.socialContext
      };

      const response = await fetch('/api/payment/mobile-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentRequest,
          userId,
          deviceType: deviceInfo.deviceType,
          networkType: deviceInfo.networkType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const paymentResponse: MobilePaymentResponse = await response.json();
      setPaymentResponse(paymentResponse);

      if (paymentResponse.success && onPaymentComplete) {
        onPaymentComplete(paymentResponse);
      }

      // Announce to screen reader
      if (paymentResponse.accessibility?.announcement) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.textContent = paymentResponse.accessibility.announcement;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  }, [userId, paymentForm, deviceInfo, onPaymentComplete]);

  // Share payment
  const sharePayment = useCallback((method: 'whatsapp' | 'email' | 'copy' | 'sms') => {
    if (!paymentResponse) return;

    const { amount, recipient } = paymentForm;
    const message = `PIX para ${recipient}: R$ ${amount.toFixed(2)}`;

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=PIX&body=${encodeURIComponent(message)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(paymentResponse.pixCode || message);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`);
        break;
    }
  }, [paymentResponse, paymentForm]);

  // Copy PIX code
  const copyPIXCode = useCallback(() => {
    if (paymentResponse?.pixCode) {
      navigator.clipboard.writeText(paymentResponse.pixCode);
    }
  }, [paymentResponse]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Processando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        💰 Pagamento Móvel Brasileiro
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

      {/* Payment Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="20000"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0,00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destinatário
          </label>
          <input
            type="text"
            value={paymentForm.recipient}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, recipient: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do destinatário"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <input
            type="text"
            value={paymentForm.description}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Rodízio japonês"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chave PIX
          </label>
          <select
            value={paymentForm.pixKey}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, pixKey: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma chave PIX</option>
            {pixKeys.map((key) => (
              <option key={key.id} value={key.keyValue}>
                {key.keyType.toUpperCase()}: {key.keyValue}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carteira Móvel (Opcional)
          </label>
          <select
            value={paymentForm.mobileWallet}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, mobileWallet: e.target.value as any }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Apenas PIX</option>
            {wallets.map((wallet) => (
              <option key={wallet.provider} value={wallet.provider}>
                {wallet.provider === 'mercado_pago' ? 'Mercado Pago' :
                 wallet.provider === 'picpay' ? 'PicPay' :
                 wallet.provider === 'apple_pay' ? 'Apple Pay' :
                 wallet.provider === 'google_pay' ? 'Google Pay' : wallet.provider}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contexto Social
          </label>
          <select
            value={paymentForm.socialContext}
            onChange={(e) => setPaymentForm(prev => ({ ...prev, socialContext: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="friends">Amigos</option>
            <option value="family">Família</option>
            <option value="business">Trabalho</option>
            <option value="informal">Informal</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={generateSuggestions}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          💡 Gerar Sugestões
        </button>

        <button
          onClick={processPayment}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          💰 Processar Pagamento
        </button>
      </div>

      {/* Suggestions */}
      {suggestions && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Sugestão Inteligente</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Método:</strong> {suggestions.primaryMethod}</p>
            <p><strong>Confiança:</strong> {(suggestions.confidence * 100).toFixed(0)}%</p>
            <p><strong>Motivo:</strong> {suggestions.reasoning}</p>
          </div>
        </div>
      )}

      {/* Payment Result */}
      {paymentResponse && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-900 mb-2">✅ Pagamento Processado</h3>
          
          {paymentResponse.qrCode && (
            <div className="mb-4">
              <img 
                src={paymentResponse.qrCode} 
                alt="QR Code PIX" 
                className="mx-auto w-48 h-48 border rounded-lg"
              />
              <p className="text-sm text-green-800 text-center mt-2">
                Escaneie o QR code com seu app bancário
              </p>
            </div>
          )}

          {paymentResponse.pixCode && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-green-900 mb-2">
                Código PIX:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={paymentResponse.pixCode}
                  readOnly
                  className="flex-1 border border-green-300 rounded-l-md px-3 py-2 bg-green-50"
                />
                <button
                  onClick={copyPIXCode}
                  className="bg-green-600 text-white px-3 py-2 rounded-r-md hover:bg-green-700"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {/* Sharing Options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sharePayment('whatsapp')}
              className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
            >
              📱 WhatsApp
            </button>
            <button
              onClick={() => sharePayment('copy')}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              📋 Copiar
            </button>
            <button
              onClick={() => sharePayment('email')}
              className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              📧 Email
            </button>
            <button
              onClick={() => sharePayment('sms')}
              className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 text-sm"
            >
              💬 SMS
            </button>
          </div>

          <p className="text-sm text-green-800 mt-4">
            {paymentResponse.message}
          </p>
        </div>
      )}

      {/* Device Info */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
        <p><strong>Dispositivo:</strong> {deviceInfo.deviceType}</p>
        <p><strong>Rede:</strong> {deviceInfo.networkType}</p>
        <p><strong>Carteiras disponíveis:</strong> {wallets.length}</p>
      </div>
    </div>
  );
} 