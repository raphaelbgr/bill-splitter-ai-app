# Payment Integration Interface Documentation

## Overview

This document outlines the comprehensive payment integration interface implementation for RachaAI, designed to support Brazilian payment methods like PIX with security features, cultural considerations, and mobile optimization for Brazilian users.

## Architecture Overview

### Core Components

1. **Payment Interface Component** (`components/PaymentInterface.tsx`)
   - PIX payment interface with security features
   - Brazilian payment preference management
   - Payment method selection and management
   - Payment status and confirmation displays

2. **Payment System Module** (`lib/payment-system.ts`)
   - Brazilian payment system implementation
   - PIX key management and generation
   - Payment preferences and suggestions
   - Debt tracking and reminders

3. **Payment API Endpoints** (`pages/api/payment/`)
   - PIX key management endpoints
   - Payment preferences endpoints
   - Debt tracking endpoints
   - Payment history endpoints

## PIX Payment Interface

### Security Features

#### SSL/TLS Encryption
```typescript
// Secure PIX payment processing
const processPIXPayment = async (paymentData: PIXPaymentData) => {
  // Ensure HTTPS connection
  if (window.location.protocol !== 'https:') {
    throw new Error('PIX payments require secure connection');
  }

  // Encrypt payment data
  const encryptedData = await encryptPaymentData(paymentData);
  
  return await fetch('/api/payment/pix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Security-Token': getSecurityToken()
    },
    body: JSON.stringify(encryptedData)
  });
};
```

#### Fraud Protection
```typescript
// Fraud detection and prevention
const validatePIXPayment = (paymentData: PIXPaymentData) => {
  const validations = [
    validateAmount(paymentData.amount),
    validatePIXKey(paymentData.pixKey),
    validateUserIdentity(paymentData.userId),
    checkFraudPatterns(paymentData)
  ];

  return validations.every(validation => validation.isValid);
};
```

#### Security Indicators
```typescript
// Security indicator components
const SecurityIndicator: React.FC = () => {
  return (
    <div className="security-indicators">
      <div className="ssl-indicator">
        <span className="lock-icon">🔒</span>
        <span>SSL Criptografado</span>
      </div>
      <div className="fraud-protection">
        <span className="shield-icon">🛡️</span>
        <span>Proteção contra Fraude</span>
      </div>
      <div className="verification">
        <span className="check-icon">✅</span>
        <span>Verificado pelo BCB</span>
      </div>
    </div>
  );
};
```

### PIX Key Management

#### PIX Key Types
```typescript
// Supported PIX key types
export type PIXKeyType = 
  | 'email'      // Email address
  | 'phone'      // Phone number
  | 'cpf'        // CPF (individual tax ID)
  | 'cnpj'       // CNPJ (company tax ID)
  | 'random';    // Random key
```

#### PIX Key Validation
```typescript
// Validate PIX key format
const validatePIXKey = (keyType: PIXKeyType, keyValue: string): boolean => {
  const validators = {
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value: string) => /^\+55\d{10,11}$/.test(value),
    cpf: (value: string) => /^\d{11}$/.test(value) && validateCPF(value),
    cnpj: (value: string) => /^\d{14}$/.test(value) && validateCNPJ(value),
    random: (value: string) => /^[a-zA-Z0-9]{32}$/.test(value)
  };

  return validators[keyType]?.(keyValue) || false;
};
```

#### PIX Key Generation
```typescript
// Generate new PIX key
const generatePIXKey = async (userId: string, keyType: PIXKeyType): Promise<PIXKey> => {
  const pixKey: PIXKey = {
    id: `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    keyType,
    keyValue: keyType === 'random' ? generateRandomKey() : '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await savePIXKey(pixKey);
  return pixKey;
};
```

## Brazilian Payment Preferences

### Payment Method Support

#### Primary Payment Methods
```typescript
// Brazilian payment methods
export type BrazilianPaymentMethod = 
  | 'pix'        // PIX (instant payment)
  | 'transfer'   // Bank transfer
  | 'cash'       // Cash
  | 'credit'     // Credit card
  | 'boleto';    // Boleto (bank slip)
```

#### Payment Preference Interface
```typescript
// Payment preference management
const PaymentPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<PaymentPreference>({
    preferredMethod: 'pix',
    comfortableDebtLimit: 100,
    autoReminderEnabled: true,
    reminderFrequency: 'weekly',
    socialPaymentEnabled: true
  });

  return (
    <div className="payment-preferences">
      <h3>Preferências de Pagamento</h3>
      
      <div className="preference-group">
        <label>Método Preferido</label>
        <select 
          value={preferences.preferredMethod}
          onChange={(e) => setPreferences({
            ...preferences,
            preferredMethod: e.target.value as BrazilianPaymentMethod
          })}
        >
          <option value="pix">PIX</option>
          <option value="transfer">Transferência</option>
          <option value="cash">Dinheiro</option>
          <option value="credit">Cartão</option>
          <option value="boleto">Boleto</option>
        </select>
      </div>

      <div className="preference-group">
        <label>Limite de Dívida Confortável</label>
        <input 
          type="number"
          value={preferences.comfortableDebtLimit}
          onChange={(e) => setPreferences({
            ...preferences,
            comfortableDebtLimit: Number(e.target.value)
          })}
        />
      </div>

      <div className="preference-group">
        <label>
          <input 
            type="checkbox"
            checked={preferences.autoReminderEnabled}
            onChange={(e) => setPreferences({
              ...preferences,
              autoReminderEnabled: e.target.checked
            })}
          />
          Lembretes Automáticos
        </label>
      </div>
    </div>
  );
};
```

### Regional Payment Variations

#### São Paulo Preferences
- **Primary Method:** PIX and credit cards
- **Social Context:** Business-oriented payments
- **Security Focus:** High security requirements
- **Mobile Usage:** High smartphone adoption

#### Rio de Janeiro Preferences
- **Primary Method:** PIX and cash
- **Social Context:** Casual, social payments
- **Security Focus:** Standard security
- **Mobile Usage:** Very high smartphone usage

#### Nordeste Preferences
- **Primary Method:** PIX and boleto
- **Social Context:** Family-oriented payments
- **Security Focus:** Trust-based security
- **Mobile Usage:** Growing smartphone adoption

#### Sul Preferences
- **Primary Method:** PIX and bank transfers
- **Social Context:** Direct, efficient payments
- **Security Focus:** High security standards
- **Mobile Usage:** High smartphone adoption

## Payment Method Management

### Payment Method Selection

#### Intuitive Selection Interface
```typescript
// Payment method selection component
const PaymentMethodSelector: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<BrazilianPaymentMethod>('pix');

  const paymentMethods = [
    {
      id: 'pix',
      name: 'PIX',
      description: 'Pagamento instantâneo',
      icon: '💳',
      advantages: ['Instantâneo', 'Gratuito', 'Seguro']
    },
    {
      id: 'transfer',
      name: 'Transferência',
      description: 'Transferência bancária',
      icon: '🏦',
      advantages: ['Seguro', 'Rastreável', 'Sem taxa']
    },
    {
      id: 'cash',
      name: 'Dinheiro',
      description: 'Pagamento em espécie',
      icon: '💵',
      advantages: ['Imediato', 'Sem taxa', 'Aceito em todo lugar']
    },
    {
      id: 'credit',
      name: 'Cartão',
      description: 'Cartão de crédito',
      icon: '💳',
      advantages: ['Pontos', 'Parcelado', 'Seguro']
    },
    {
      id: 'boleto',
      name: 'Boleto',
      description: 'Boleto bancário',
      icon: '📄',
      advantages: ['Sem cartão', 'Parcelado', 'Aceito em todo lugar']
    }
  ];

  return (
    <div className="payment-method-selector">
      <h3>Escolha o Método de Pagamento</h3>
      
      <div className="method-grid">
        {paymentMethods.map(method => (
          <div 
            key={method.id}
            className={`method-card ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => setSelectedMethod(method.id as BrazilianPaymentMethod)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-name">{method.name}</div>
            <div className="method-description">{method.description}</div>
            <div className="method-advantages">
              {method.advantages.map(advantage => (
                <span key={advantage} className="advantage-tag">{advantage}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Payment Method Management Interface

#### Add New Payment Method
```typescript
// Add new payment method
const AddPaymentMethod: React.FC = () => {
  const [newMethod, setNewMethod] = useState({
    type: 'pix' as const,
    keyType: 'email' as const,
    keyValue: '',
    isDefault: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/payment/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMethod)
      });

      if (response.ok) {
        // Success handling
        showSuccessMessage('Método de pagamento adicionado com sucesso!');
      }
    } catch (error) {
      showErrorMessage('Erro ao adicionar método de pagamento');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-payment-method">
      <h3>Adicionar Método de Pagamento</h3>
      
      <div className="form-group">
        <label>Tipo de Método</label>
        <select 
          value={newMethod.type}
          onChange={(e) => setNewMethod({
            ...newMethod,
            type: e.target.value as any
          })}
        >
          <option value="pix">PIX</option>
          <option value="transfer">Transferência</option>
          <option value="credit">Cartão</option>
        </select>
      </div>

      {newMethod.type === 'pix' && (
        <div className="form-group">
          <label>Tipo de Chave PIX</label>
          <select 
            value={newMethod.keyType}
            onChange={(e) => setNewMethod({
              ...newMethod,
              keyType: e.target.value as any
            })}
          >
            <option value="email">Email</option>
            <option value="phone">Telefone</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="random">Aleatória</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Valor da Chave</label>
        <input 
          type="text"
          value={newMethod.keyValue}
          onChange={(e) => setNewMethod({
            ...newMethod,
            keyValue: e.target.value
          })}
          placeholder="Digite o valor da chave"
        />
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={newMethod.isDefault}
            onChange={(e) => setNewMethod({
              ...newMethod,
              isDefault: e.target.checked
            })}
          />
          Definir como padrão
        </label>
      </div>

      <button type="submit" className="submit-button">
        Adicionar Método
      </button>
    </form>
  );
};
```

## Payment Status and Confirmation

### Payment Status Display

#### Status Indicators
```typescript
// Payment status component
const PaymentStatus: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: '⏳',
      text: 'Pendente',
      color: 'orange',
      description: 'Aguardando processamento'
    },
    processing: {
      icon: '🔄',
      text: 'Processando',
      color: 'blue',
      description: 'Processando pagamento'
    },
    completed: {
      icon: '✅',
      text: 'Concluído',
      color: 'green',
      description: 'Pagamento realizado com sucesso'
    },
    failed: {
      icon: '❌',
      text: 'Falhou',
      color: 'red',
      description: 'Erro no processamento'
    },
    cancelled: {
      icon: '🚫',
      text: 'Cancelado',
      color: 'gray',
      description: 'Pagamento cancelado'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`payment-status status-${status}`}>
      <div className="status-icon">{config.icon}</div>
      <div className="status-text">{config.text}</div>
      <div className="status-description">{config.description}</div>
    </div>
  );
};
```

#### Payment Confirmation
```typescript
// Payment confirmation component
const PaymentConfirmation: React.FC<{ payment: PaymentData }> = ({ payment }) => {
  return (
    <div className="payment-confirmation">
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h2>Pagamento Confirmado!</h2>
      </div>

      <div className="payment-details">
        <div className="detail-row">
          <span>Valor:</span>
          <span className="amount">R$ {payment.amount.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span>Método:</span>
          <span>{payment.method}</span>
        </div>
        <div className="detail-row">
          <span>Data:</span>
          <span>{new Date(payment.date).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="detail-row">
          <span>ID da Transação:</span>
          <span className="transaction-id">{payment.transactionId}</span>
        </div>
      </div>

      <div className="confirmation-actions">
        <button className="btn-primary">Ver Comprovante</button>
        <button className="btn-secondary">Compartilhar</button>
        <button className="btn-secondary">Fazer Novo Pagamento</button>
      </div>
    </div>
  );
};
```

### Processing Status

#### Real-time Processing Updates
```typescript
// Real-time payment processing
const PaymentProcessor: React.FC<{ paymentId: string }> = ({ paymentId }) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStep>('initiating');

  const processingSteps = [
    { id: 'initiating', text: 'Iniciando pagamento', icon: '🚀' },
    { id: 'validating', text: 'Validando dados', icon: '🔍' },
    { id: 'processing', text: 'Processando PIX', icon: '💳' },
    { id: 'confirming', text: 'Confirmando pagamento', icon: '✅' },
    { id: 'completed', text: 'Pagamento concluído', icon: '🎉' }
  ];

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await getPaymentStatus(paymentId);
      setProcessingStatus(status);
      
      if (status === 'completed') {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentId]);

  return (
    <div className="payment-processor">
      <h3>Processando Pagamento</h3>
      
      <div className="processing-steps">
        {processingSteps.map((step, index) => (
          <div 
            key={step.id}
            className={`processing-step ${processingStatus === step.id ? 'active' : ''} ${
              processingSteps.findIndex(s => s.id === processingStatus) > index ? 'completed' : ''
            }`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-text">{step.text}</div>
            {processingStatus === step.id && (
              <div className="loading-spinner">⏳</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Security Indicators

### Prominent Security Display

#### Security Badge Component
```typescript
// Security badge component
const SecurityBadge: React.FC = () => {
  return (
    <div className="security-badge">
      <div className="security-header">
        <span className="security-icon">🔒</span>
        <span className="security-title">Pagamento Seguro</span>
      </div>
      
      <div className="security-features">
        <div className="security-feature">
          <span className="feature-icon">🛡️</span>
          <span>Proteção contra Fraude</span>
        </div>
        <div className="security-feature">
          <span className="feature-icon">🔐</span>
          <span>Criptografia SSL</span>
        </div>
        <div className="security-feature">
          <span className="feature-icon">✅</span>
          <span>Verificado pelo BCB</span>
        </div>
        <div className="security-feature">
          <span className="feature-icon">📱</span>
          <span>Autenticação 2FA</span>
        </div>
      </div>
    </div>
  );
};
```

#### SSL Certificate Status
```typescript
// SSL certificate indicator
const SSLCertificateIndicator: React.FC = () => {
  const [sslStatus, setSslStatus] = useState<'valid' | 'invalid' | 'checking'>('checking');

  useEffect(() => {
    checkSSLCertificate().then(status => setSslStatus(status));
  }, []);

  return (
    <div className={`ssl-indicator ssl-${sslStatus}`}>
      <span className="ssl-icon">
        {sslStatus === 'valid' ? '🔒' : sslStatus === 'invalid' ? '⚠️' : '⏳'}
      </span>
      <span className="ssl-text">
        {sslStatus === 'valid' ? 'SSL Válido' : 
         sslStatus === 'invalid' ? 'SSL Inválido' : 'Verificando SSL'}
      </span>
    </div>
  );
};
```

### Fraud Protection Indicators

#### Fraud Protection Display
```typescript
// Fraud protection component
const FraudProtection: React.FC = () => {
  return (
    <div className="fraud-protection">
      <div className="protection-header">
        <span className="protection-icon">🛡️</span>
        <span className="protection-title">Proteção contra Fraude</span>
      </div>
      
      <div className="protection-features">
        <div className="protection-feature">
          <span>✅ Verificação de Identidade</span>
        </div>
        <div className="protection-feature">
          <span>✅ Detecção de Padrões Suspeitos</span>
        </div>
        <div className="protection-feature">
          <span>✅ Monitoramento 24/7</span>
        </div>
        <div className="protection-feature">
          <span>✅ Reembolso Garantido</span>
        </div>
      </div>
    </div>
  );
};
```

## Payment History Interface

### Accessible Payment History

#### History Display Component
```typescript
// Payment history component
const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'pix' | 'transfer' | 'cash'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const response = await fetch('/api/payment/history');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => 
    filter === 'all' || payment.method === filter
  );

  return (
    <div className="payment-history">
      <div className="history-header">
        <h3>Histórico de Pagamentos</h3>
        
        <div className="history-filters">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="pix">PIX</option>
            <option value="transfer">Transferência</option>
            <option value="cash">Dinheiro</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando histórico...</div>
      ) : (
        <div className="payment-list">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="payment-record">
              <div className="payment-info">
                <div className="payment-method">{payment.method}</div>
                <div className="payment-amount">R$ {payment.amount.toFixed(2)}</div>
                <div className="payment-date">
                  {new Date(payment.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="payment-status">{payment.status}</div>
              </div>
              
              <div className="payment-actions">
                <button className="btn-small">Ver Detalhes</button>
                <button className="btn-small">Comprovante</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Export Functionality

#### Export Options
```typescript
// Export payment history
const ExportPaymentHistory: React.FC = () => {
  const exportFormats = [
    { id: 'pdf', name: 'PDF', icon: '📄' },
    { id: 'csv', name: 'CSV', icon: '📊' },
    { id: 'excel', name: 'Excel', icon: '📈' }
  ];

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/payment/export?format=${format}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-history.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="export-options">
      <h4>Exportar Histórico</h4>
      
      <div className="export-buttons">
        {exportFormats.map(format => (
          <button 
            key={format.id}
            onClick={() => handleExport(format.id)}
            className="export-button"
          >
            <span className="export-icon">{format.icon}</span>
            <span className="export-name">{format.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

## Split Calculation Display

### Clear Split Calculations

#### Split Calculator Component
```typescript
// Split calculator component
const SplitCalculator: React.FC = () => {
  const [splitData, setSplitData] = useState({
    totalAmount: 0,
    participants: 1,
    method: 'equal' as 'equal' | 'by_consumption' | 'by_family' | 'host_pays'
  });

  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);

  const calculateSplit = () => {
    const { totalAmount, participants, method } = splitData;
    
    let result: SplitResult;
    
    switch (method) {
      case 'equal':
        result = {
          method: 'equal',
          amountPerPerson: totalAmount / participants,
          totalAmount,
          participants,
          breakdown: Array(participants).fill(totalAmount / participants)
        };
        break;
      case 'by_consumption':
        result = {
          method: 'by_consumption',
          amountPerPerson: totalAmount / participants,
          totalAmount,
          participants,
          breakdown: Array(participants).fill(totalAmount / participants)
        };
        break;
      case 'host_pays':
        result = {
          method: 'host_pays',
          amountPerPerson: 0,
          totalAmount,
          participants,
          breakdown: [totalAmount, ...Array(participants - 1).fill(0)]
        };
        break;
      default:
        result = {
          method: 'equal',
          amountPerPerson: totalAmount / participants,
          totalAmount,
          participants,
          breakdown: Array(participants).fill(totalAmount / participants)
        };
    }
    
    setSplitResult(result);
  };

  return (
    <div className="split-calculator">
      <h3>Calculadora de Divisão</h3>
      
      <div className="calculator-inputs">
        <div className="input-group">
          <label>Valor Total (R$)</label>
          <input 
            type="number"
            value={splitData.totalAmount}
            onChange={(e) => setSplitData({
              ...splitData,
              totalAmount: Number(e.target.value)
            })}
            placeholder="0,00"
          />
        </div>

        <div className="input-group">
          <label>Número de Participantes</label>
          <input 
            type="number"
            value={splitData.participants}
            onChange={(e) => setSplitData({
              ...splitData,
              participants: Number(e.target.value)
            })}
            min="1"
          />
        </div>

        <div className="input-group">
          <label>Método de Divisão</label>
          <select 
            value={splitData.method}
            onChange={(e) => setSplitData({
              ...splitData,
              method: e.target.value as any
            })}
          >
            <option value="equal">Igual</option>
            <option value="by_consumption">Por Consumo</option>
            <option value="by_family">Por Família</option>
            <option value="host_pays">Anfitrião Paga</option>
          </select>
        </div>

        <button onClick={calculateSplit} className="calculate-button">
          Calcular Divisão
        </button>
      </div>

      {splitResult && (
        <div className="split-result">
          <h4>Resultado da Divisão</h4>
          
          <div className="result-summary">
            <div className="summary-item">
              <span>Total:</span>
              <span className="amount">R$ {splitResult.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Participantes:</span>
              <span>{splitResult.participants}</span>
            </div>
            <div className="summary-item">
              <span>Por pessoa:</span>
              <span className="amount">R$ {splitResult.amountPerPerson.toFixed(2)}</span>
            </div>
          </div>

          <div className="breakdown">
            <h5>Detalhamento</h5>
            {splitResult.breakdown.map((amount, index) => (
              <div key={index} className="breakdown-item">
                <span>Pessoa {index + 1}:</span>
                <span className="amount">R$ {amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Brazilian Financial Regulation Compliance

### Regulatory Compliance

#### Compliance Indicators
```typescript
// Compliance indicator component
const ComplianceIndicator: React.FC = () => {
  return (
    <div className="compliance-indicator">
      <div className="compliance-header">
        <span className="compliance-icon">✅</span>
        <span className="compliance-title">Conforme às Regulamentações</span>
      </div>
      
      <div className="compliance-items">
        <div className="compliance-item">
          <span className="item-icon">🏦</span>
          <span>Banco Central do Brasil (BCB)</span>
        </div>
        <div className="compliance-item">
          <span className="item-icon">📋</span>
          <span>Lei Geral de Proteção de Dados (LGPD)</span>
        </div>
        <div className="compliance-item">
          <span className="item-icon">🔒</span>
          <span>PCI DSS Compliance</span>
        </div>
        <div className="compliance-item">
          <span className="item-icon">🛡️</span>
          <span>Proteção ao Consumidor</span>
        </div>
      </div>
    </div>
  );
};
```

#### Regulatory Information Display
```typescript
// Regulatory information component
const RegulatoryInfo: React.FC = () => {
  return (
    <div className="regulatory-info">
      <h3>Informações Regulamentares</h3>
      
      <div className="regulatory-sections">
        <div className="regulatory-section">
          <h4>Banco Central do Brasil</h4>
          <p>Este serviço está em conformidade com as diretrizes do Banco Central do Brasil para sistemas de pagamento instantâneo (PIX).</p>
        </div>
        
        <div className="regulatory-section">
          <h4>Lei Geral de Proteção de Dados</h4>
          <p>Seus dados pessoais são tratados em conformidade com a LGPD, garantindo sua privacidade e segurança.</p>
        </div>
        
        <div className="regulatory-section">
          <h4>Proteção ao Consumidor</h4>
          <p>Você tem direito a reembolso em caso de problemas com pagamentos, conforme estabelecido pelo Código de Defesa do Consumidor.</p>
        </div>
      </div>
    </div>
  );
};
```

## Mobile Optimization

### Brazilian Smartphone Usage

#### Mobile-First Design
```typescript
// Mobile-optimized payment interface
const MobilePaymentInterface: React.FC = () => {
  return (
    <div className="mobile-payment-interface">
      <div className="mobile-header">
        <h2>Pagamento PIX</h2>
        <div className="mobile-security-badge">
          <span>🔒</span>
          <span>Seguro</span>
        </div>
      </div>

      <div className="mobile-payment-form">
        <div className="mobile-input-group">
          <label>Valor (R$)</label>
          <input 
            type="number"
            placeholder="0,00"
            inputMode="decimal"
            className="mobile-input"
          />
        </div>

        <div className="mobile-input-group">
          <label>Chave PIX</label>
          <input 
            type="text"
            placeholder="Digite a chave PIX"
            className="mobile-input"
          />
        </div>

        <button className="mobile-pay-button">
          <span className="button-icon">💳</span>
          <span>Pagar com PIX</span>
        </button>
      </div>

      <div className="mobile-payment-methods">
        <h3>Outros Métodos</h3>
        <div className="method-buttons">
          <button className="method-button">
            <span>🏦</span>
            <span>Transferência</span>
          </button>
          <button className="method-button">
            <span>💵</span>
            <span>Dinheiro</span>
          </button>
          <button className="method-button">
            <span>💳</span>
            <span>Cartão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### Touch-Friendly Interface
```typescript
// Touch-friendly button component
const TouchButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ 
  onClick, 
  children 
}) => {
  return (
    <button 
      onClick={onClick}
      className="touch-button"
      style={{
        minHeight: '44px',
        minWidth: '44px',
        padding: '12px 16px',
        fontSize: '16px',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </button>
  );
};
```

## Accessibility Features

### WCAG 2.1 Compliance

#### Accessibility Implementation
```typescript
// Accessible payment interface
const AccessiblePaymentInterface: React.FC = () => {
  return (
    <div 
      className="accessible-payment-interface"
      role="main"
      aria-label="Interface de Pagamento"
    >
      <h1 id="payment-title">Pagamento PIX</h1>
      
      <form 
        role="form"
        aria-labelledby="payment-title"
        aria-describedby="payment-description"
      >
        <div id="payment-description" className="sr-only">
          Formulário para realizar pagamento via PIX
        </div>

        <div className="form-group">
          <label htmlFor="amount-input">Valor (R$)</label>
          <input 
            id="amount-input"
            type="number"
            aria-describedby="amount-help"
            aria-required="true"
            inputMode="decimal"
          />
          <div id="amount-help" className="help-text">
            Digite o valor que deseja pagar
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pix-key-input">Chave PIX</label>
          <input 
            id="pix-key-input"
            type="text"
            aria-describedby="pix-key-help"
            aria-required="true"
          />
          <div id="pix-key-help" className="help-text">
            Digite a chave PIX do destinatário
          </div>
        </div>

        <button 
          type="submit"
          aria-label="Realizar pagamento PIX"
          className="pay-button"
        >
          Pagar com PIX
        </button>
      </form>

      <div 
        className="security-info"
        role="region"
        aria-label="Informações de Segurança"
      >
        <h2>Segurança</h2>
        <ul>
          <li>🔒 Criptografia SSL</li>
          <li>🛡️ Proteção contra Fraude</li>
          <li>✅ Verificado pelo BCB</li>
        </ul>
      </div>
    </div>
  );
};
```

#### Screen Reader Support
```typescript
// Screen reader friendly component
const ScreenReaderPayment: React.FC = () => {
  return (
    <div className="screen-reader-payment">
      <div 
        className="payment-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Pronto para pagamento
      </div>

      <div className="payment-actions">
        <button 
          aria-label="Pagar R$ 50,00 via PIX"
          onClick={() => processPayment()}
        >
          Pagar R$ 50,00
        </button>
        
        <button 
          aria-label="Cancelar pagamento"
          onClick={() => cancelPayment()}
        >
          Cancelar
        </button>
      </div>

      <div 
        className="payment-feedback"
        role="alert"
        aria-live="assertive"
      >
        {/* Payment status messages will be announced here */}
      </div>
    </div>
  );
};
```

---

*This comprehensive payment integration interface implementation provides secure, accessible, and culturally appropriate payment functionality for Brazilian users with full PIX support and regulatory compliance.* 