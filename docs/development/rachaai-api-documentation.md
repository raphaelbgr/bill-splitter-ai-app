# RachaAI - API Documentation
## Accessibility Features & Brazilian Cultural Integration

*Generated by Sally - UX Expert & API Specialist*
*Created: December 2024*

---

## API Documentation Overview

This document provides comprehensive API documentation for RachaAI, covering accessibility features, Brazilian cultural pattern recognition, payment integration, and regional optimization.

---

## 1. Core API Endpoints

### 1.1 Chat API

**Endpoint:** `POST /api/ai/chat`

**Description:** Main conversational interface for expense splitting with Claude AI

```typescript
interface ChatRequest {
  message: string;
  userId?: string;
  region?: 'SP' | 'RJ' | 'NE' | 'Sul';
  accessibility?: {
    screenReader: boolean;
    voiceInput: boolean;
    highContrast: boolean;
  };
  performance?: {
    modelPreference?: 'haiku' | 'sonnet' | 'opus';
    costOptimization: boolean;
  };
}

interface ChatResponse {
  id: string;
  content: string;
  culturalPattern?: {
    type: 'rodizio' | 'happy_hour' | 'aniversario' | 'churrasco' | 'vaquinha';
    confidence: number;
    regionalVariation: string;
    explanation: string;
  };
  payment?: {
    type: 'PIX' | 'equal' | 'consumption' | 'contribution';
    amount: number;
    participants: number;
    individualAmount: number;
  };
  accessibility?: {
    screenReaderAnnouncement: string;
    keyboardNavigation: string[];
    voiceCommands: string[];
  };
  performance?: {
    modelUsed: 'haiku' | 'sonnet' | 'opus';
    responseTime: number;
    cost: number;
  };
}
```

**Example Request:**
```bash
curl -X POST https://rachaai.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Rolou um rodízio japonês, 4 pessoas, R$ 180",
    "region": "SP",
    "accessibility": {
      "screenReader": true,
      "voiceInput": false,
      "highContrast": false
    },
    "performance": {
      "costOptimization": true
    }
  }'
```

**Example Response:**
```json
{
  "id": "msg_123",
  "content": "Rolou um rodízio japonês! 🍣\n\nNo rodízio, todos pagam igual:\nR$ 180 ÷ 4 = R$ 45 cada",
  "culturalPattern": {
    "type": "rodizio",
    "confidence": 0.95,
    "regionalVariation": "SP",
    "explanation": "No rodízio, todos pagam o mesmo valor"
  },
  "payment": {
    "type": "equal",
    "amount": 180,
    "participants": 4,
    "individualAmount": 45
  },
  "accessibility": {
    "screenReaderAnnouncement": "Padrão cultural detectado: Rodízio japonês. R$ 45 cada pessoa",
    "keyboardNavigation": ["confirm", "customize", "explain", "share"],
    "voiceCommands": ["confirmar", "personalizar", "explicar", "compartilhar"]
  },
  "performance": {
    "modelUsed": "sonnet",
    "responseTime": 2100,
    "cost": 0.10
  }
}
```

### 1.2 Cultural Pattern Recognition API

**Endpoint:** `POST /api/cultural/recognize`

**Description:** Recognize Brazilian cultural patterns in expense descriptions

```typescript
interface CulturalRecognitionRequest {
  text: string;
  region: 'SP' | 'RJ' | 'NE' | 'Sul';
  context?: {
    participants?: number;
    amount?: number;
    occasion?: string;
  };
}

interface CulturalRecognitionResponse {
  patterns: {
    type: 'rodizio' | 'happy_hour' | 'aniversario' | 'churrasco' | 'vaquinha';
    confidence: number;
    regionalExpression: string;
    culturalContext: {
      divisionType: 'equal' | 'consumption' | 'contribution' | 'fixed';
      explanation: string;
      regionalExplanation: string;
    };
    accessibility: {
      announcement: string;
      explanation: string;
    };
  }[];
  regionalAdaptation: {
    expressions: string[];
    languageVariations: string[];
  };
}
```

**Example Request:**
```bash
curl -X POST https://rachaai.vercel.app/api/cultural/recognize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Happy hour, 6 pessoas, R$ 240, mas cada um bebeu diferente",
    "region": "RJ",
    "context": {
      "participants": 6,
      "amount": 240,
      "occasion": "social"
    }
  }'
```

**Example Response:**
```json
{
  "patterns": [
    {
      "type": "happy_hour",
      "confidence": 0.92,
      "regionalExpression": "Beleza, happy hour",
      "culturalContext": {
        "divisionType": "consumption",
        "explanation": "No happy hour, cada um paga o que consumiu",
        "regionalExplanation": "Beleza, happy hour, cada um paga o que bebeu"
      },
      "accessibility": {
        "announcement": "Padrão cultural detectado: Happy Hour - divisão por consumo",
        "explanation": "No happy hour, cada um paga o que consumiu"
      }
    }
  ],
  "regionalAdaptation": {
    "expressions": ["beleza", "happy hour", "cada um paga o seu"],
    "languageVariations": ["carioca", "RJ", "Rio de Janeiro"]
  }
}
```

### 1.3 Payment Integration API

**Endpoint:** `POST /api/payment/generate`

**Description:** Generate PIX payments for expense splitting

```typescript
interface PaymentRequest {
  amount: number;
  recipient: string;
  pixKey: string;
  description?: string;
  accessibility?: {
    screenReader: boolean;
    voiceAnnouncement: boolean;
  };
}

interface PaymentResponse {
  pixCode: string;
  qrCode: string;
  amount: number;
  recipient: string;
  description: string;
  accessibility: {
    announcement: string;
    qrDescription: string;
    sharingOptions: {
      whatsapp: string;
      email: string;
      copy: string;
    };
  };
}
```

**Example Request:**
```bash
curl -X POST https://rachaai.vercel.app/api/payment/generate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.00,
    "recipient": "João Silva",
    "pixKey": "joao@email.com",
    "description": "Rodízio japonês - RachaAI",
    "accessibility": {
      "screenReader": true,
      "voiceAnnouncement": true
    }
  }'
```

**Example Response:**
```json
{
  "pixCode": "00020126580014br.gov.bcb.pix0136joao@email.com520400005303986540545.005802BR5913João Silva6008São Paulo62070503***6304ABCD",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "amount": 45.00,
  "recipient": "João Silva",
  "description": "Rodízio japonês - RachaAI",
  "accessibility": {
    "announcement": "PIX gerado para João Silva: R$ 45,00",
    "qrDescription": "QR Code PIX para João Silva, R$ 45,00. Toque para ampliar",
    "sharingOptions": {
      "whatsapp": "Compartilhar via WhatsApp",
      "email": "Compartilhar via Email",
      "copy": "Copiar PIX key"
    }
  }
}
```

---

## 2. Accessibility API Endpoints

### 2.1 Screen Reader Support API

**Endpoint:** `POST /api/accessibility/announce`

**Description:** Generate screen reader announcements for cultural patterns and actions

```typescript
interface AnnouncementRequest {
  type: 'cultural_pattern' | 'payment' | 'loading' | 'error' | 'success';
  data: {
    pattern?: string;
    amount?: number;
    participants?: number;
    model?: string;
    action?: string;
  };
  region?: 'SP' | 'RJ' | 'NE' | 'Sul';
}

interface AnnouncementResponse {
  announcement: string;
  priority: 'polite' | 'assertive';
  duration?: number;
  repeat?: boolean;
}
```

**Example Request:**
```bash
curl -X POST https://rachaai.vercel.app/api/accessibility/announce \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cultural_pattern",
    "data": {
      "pattern": "rodizio",
      "amount": 180,
      "participants": 4
    },
    "region": "SP"
  }'
```

**Example Response:**
```json
{
  "announcement": "Padrão cultural detectado: Rodízio japonês. R$ 45 cada pessoa",
  "priority": "polite",
  "duration": 3000,
  "repeat": false
}
```

### 2.2 Voice Input API

**Endpoint:** `POST /api/accessibility/voice`

**Description:** Process voice input with Brazilian Portuguese recognition

```typescript
interface VoiceRequest {
  audio: string; // base64 encoded audio
  region: 'SP' | 'RJ' | 'NE' | 'Sul';
  language: 'pt-BR';
  culturalPatterns: boolean;
}

interface VoiceResponse {
  text: string;
  confidence: number;
  culturalPatterns?: {
    type: string;
    confidence: number;
    regionalVariation: string;
  }[];
  alternatives?: string[];
  accessibility: {
    screenReaderAnnouncement: string;
    keyboardNavigation: string[];
  };
}
```

**Example Request:**
```bash
curl -X POST https://rachaai.vercel.app/api/accessibility/voice \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT...",
    "region": "SP",
    "language": "pt-BR",
    "culturalPatterns": true
  }'
```

**Example Response:**
```json
{
  "text": "Rolou um rodízio japonês, 4 pessoas, R$ 180",
  "confidence": 0.94,
  "culturalPatterns": [
    {
      "type": "rodizio",
      "confidence": 0.95,
      "regionalVariation": "SP"
    }
  ],
  "alternatives": [
    "Rodízio japonês, 4 pessoas, R$ 180",
    "Rolou um rodízio, 4 pessoas, R$ 180"
  ],
  "accessibility": {
    "screenReaderAnnouncement": "Reconhecido: Rolou um rodízio japonês, 4 pessoas",
    "keyboardNavigation": ["edit", "confirm", "send"]
  }
}
```

### 2.3 Keyboard Navigation API

**Endpoint:** `GET /api/accessibility/navigation`

**Description:** Get keyboard navigation structure for components

```typescript
interface NavigationRequest {
  component: 'conversation' | 'payment' | 'settings' | 'cultural';
  context?: {
    pattern?: string;
    region?: string;
    action?: string;
  };
}

interface NavigationResponse {
  tabOrder: string[];
  shortcuts: {
    [key: string]: string;
  };
  focusManagement: {
    initial: string;
    onResponse: string;
    onError: string;
  };
  announcements: {
    [action: string]: string;
  };
}
```

**Example Request:**
```bash
curl -X GET "https://rachaai.vercel.app/api/accessibility/navigation?component=conversation&context[pattern]=rodizio&context[region]=SP"
```

**Example Response:**
```json
{
  "tabOrder": [
    "message-input",
    "send-button",
    "voice-button",
    "camera-button",
    "confirm-button",
    "customize-button",
    "explain-button",
    "share-button"
  ],
  "shortcuts": {
    "Enter": "send message",
    "Space": "activate button",
    "Escape": "cancel",
    "Tab": "next element",
    "Shift+Tab": "previous element"
  },
  "focusManagement": {
    "initial": "message-input",
    "onResponse": "confirm-button",
    "onError": "error-message"
  },
  "announcements": {
    "pattern_detected": "Padrão cultural detectado: Rodízio japonês",
    "payment_generated": "PIX gerado para João Silva: R$ 45,00",
    "loading": "Claude está processando"
  }
}
```

---

## 3. Regional Optimization API

### 3.1 Regional Performance API

**Endpoint:** `GET /api/regional/performance`

**Description:** Get regional performance optimization settings

```typescript
interface RegionalPerformanceRequest {
  region: 'SP' | 'RJ' | 'NE' | 'Sul';
  networkSpeed?: 'fast' | 'medium' | 'slow';
  peakHour?: boolean;
}

interface RegionalPerformanceResponse {
  optimization: {
    modelPreference: 'haiku' | 'sonnet' | 'opus';
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
    imageQuality: 'high' | 'medium' | 'low';
    realTimeUpdates: boolean;
  };
  cultural: {
    expressions: string[];
    recognitionAccuracy: number;
    regionalVariations: string[];
  };
  performance: {
    targetResponseTime: number;
    networkOptimization: string;
    costOptimization: boolean;
  };
}
```

**Example Request:**
```bash
curl -X GET "https://rachaai.vercel.app/api/regional/performance?region=NE&networkSpeed=slow&peakHour=false"
```

**Example Response:**
```json
{
  "optimization": {
    "modelPreference": "haiku",
    "cacheStrategy": "aggressive",
    "imageQuality": "low",
    "realTimeUpdates": false
  },
  "cultural": {
    "expressions": ["oxe, rodízio", "oxe, happy hour", "oxe, aniversário"],
    "recognitionAccuracy": 0.92,
    "regionalVariations": ["nordestino", "NE", "Nordeste"]
  },
  "performance": {
    "targetResponseTime": 1000,
    "networkOptimization": "slow_network",
    "costOptimization": true
  }
}
```

### 3.2 Peak Hour Optimization API

**Endpoint:** `GET /api/regional/peak-hours`

**Description:** Get peak hour optimization settings

```typescript
interface PeakHourRequest {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  region: 'SP' | 'RJ' | 'NE' | 'Sul';
}

interface PeakHourResponse {
  isPeakHour: boolean;
  optimization: {
    modelPreference: 'haiku' | 'sonnet' | 'opus';
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
    realTimeUpdates: boolean;
  };
  cultural: {
    context: string;
    expressions: string[];
  };
  performance: {
    expectedResponseTime: number;
    costOptimization: boolean;
  };
}
```

**Example Request:**
```bash
curl -X GET "https://rachaai.vercel.app/api/regional/peak-hours?hour=19&dayOfWeek=6&region=RJ"
```

**Example Response:**
```json
{
  "isPeakHour": true,
  "optimization": {
    "modelPreference": "sonnet",
    "cacheStrategy": "aggressive",
    "realTimeUpdates": true
  },
  "cultural": {
    "context": "weekend_social",
    "expressions": ["beleza, happy hour", "aniversário", "churrasco"]
  },
  "performance": {
    "expectedResponseTime": 2500,
    "costOptimization": false
  }
}
```

---

## 4. Cost Management API

### 4.1 Cost Tracking API

**Endpoint:** `GET /api/costs/tracking`

**Description:** Get current cost tracking information

```typescript
interface CostTrackingRequest {
  period: 'daily' | 'monthly';
  region?: 'SP' | 'RJ' | 'NE' | 'Sul';
}

interface CostTrackingResponse {
  current: number; // R$
  limit: number; // R$
  remaining: number; // R$
  percentage: number; // percentage of limit
  status: 'safe' | 'warning' | 'critical';
  breakdown: {
    haiku: {
      cost: number;
      usage: number; // percentage
      savings: number;
    };
    sonnet: {
      cost: number;
      usage: number;
      savings: number;
    };
    opus: {
      cost: number;
      usage: number;
      costIncrease: number;
    };
  };
  optimization: {
    enabled: boolean;
    savings: number;
    recommendations: string[];
  };
}
```

**Example Request:**
```bash
curl -X GET "https://rachaai.vercel.app/api/costs/tracking?period=daily&region=SP"
```

**Example Response:**
```json
{
  "current": 1.20,
  "limit": 2.00,
  "remaining": 0.80,
  "percentage": 60,
  "status": "safe",
  "breakdown": {
    "haiku": {
      "cost": 0.40,
      "usage": 33,
      "savings": 0.80
    },
    "sonnet": {
      "cost": 0.70,
      "usage": 58,
      "savings": 0.30
    },
    "opus": {
      "cost": 0.10,
      "usage": 9,
      "costIncrease": 0.10
    }
  },
  "optimization": {
    "enabled": true,
    "savings": 1.20,
    "recommendations": [
      "Switch to Haiku for simple queries",
      "Enable aggressive caching",
      "Optimize query complexity"
    ]
  }
}
```

### 4.2 Cost Optimization API

**Endpoint:** `POST /api/costs/optimize`

**Description:** Request cost optimization recommendations

```typescript
interface CostOptimizationRequest {
  currentCost: number;
  targetCost: number;
  region: 'SP' | 'RJ' | 'NE' | 'Sul';
  performance: {
    responseTime: number;
    userSatisfaction: number;
  };
}

interface CostOptimizationResponse {
  recommendations: {
    immediate: {
      action: string;
      potentialSavings: number;
      implementationTime: string;
      risk: 'low' | 'medium' | 'high';
    }[];
    shortTerm: {
      action: string;
      potentialSavings: number;
      implementationTime: string;
      risk: 'low' | 'medium' | 'high';
    }[];
  };
  optimization: {
    modelSwitching: boolean;
    caching: boolean;
    queryOptimization: boolean;
  };
}
```

**Example Request:**
```bash
curl -X POST https://rachaai.vercel.app/api/costs/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "currentCost": 1.80,
    "targetCost": 1.20,
    "region": "SP",
    "performance": {
      "responseTime": 2500,
      "userSatisfaction": 4.5
    }
  }'
```

**Example Response:**
```json
{
  "recommendations": {
    "immediate": [
      {
        "action": "Switch to Haiku for simple queries",
        "potentialSavings": 0.40,
        "implementationTime": "5 minutes",
        "risk": "low"
      },
      {
        "action": "Enable aggressive caching",
        "potentialSavings": 0.20,
        "implementationTime": "10 minutes",
        "risk": "low"
      }
    ],
    "shortTerm": [
      {
        "action": "Implement query complexity analysis",
        "potentialSavings": 0.30,
        "implementationTime": "2 hours",
        "risk": "medium"
      }
    ]
  },
  "optimization": {
    "modelSwitching": true,
    "caching": true,
    "queryOptimization": false
  }
}
```

---

## 5. Error Handling

### 5.1 Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    accessibility?: {
      screenReaderAnnouncement: string;
      keyboardNavigation: string[];
    };
  };
  timestamp: string;
  requestId: string;
}
```

### 5.2 Common Error Codes

```typescript
const ErrorCodes = {
  // Authentication Errors
  UNAUTHORIZED: {
    code: 'AUTH_001',
    message: 'Authentication required',
    screenReaderAnnouncement: 'Erro de autenticação. Faça login novamente.'
  },
  
  // Cultural Pattern Errors
  PATTERN_NOT_RECOGNIZED: {
    code: 'CULT_001',
    message: 'Cultural pattern not recognized',
    screenReaderAnnouncement: 'Padrão cultural não reconhecido. Tente novamente.'
  },
  
  // Payment Errors
  PIX_GENERATION_FAILED: {
    code: 'PAY_001',
    message: 'PIX generation failed',
    screenReaderAnnouncement: 'Erro ao gerar PIX. Tente novamente.'
  },
  
  // Performance Errors
  MODEL_UNAVAILABLE: {
    code: 'PERF_001',
    message: 'Requested model unavailable',
    screenReaderAnnouncement: 'Modelo não disponível. Usando alternativa.'
  },
  
  // Regional Errors
  REGION_NOT_SUPPORTED: {
    code: 'REG_001',
    message: 'Region not supported',
    screenReaderAnnouncement: 'Região não suportada. Usando configuração padrão.'
  }
};
```

---

## 6. Rate Limiting

### 6.1 Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### 6.2 Rate Limit by Endpoint

```typescript
const RateLimits = {
  '/api/ai/chat': {
    requests: 100,
    window: '1 minute',
    costOptimization: true
  },
  '/api/cultural/recognize': {
    requests: 500,
    window: '1 minute',
    costOptimization: false
  },
  '/api/payment/generate': {
    requests: 50,
    window: '1 minute',
    costOptimization: false
  },
  '/api/accessibility/voice': {
    requests: 200,
    window: '1 minute',
    costOptimization: true
  }
};
```

---

## 7. Success Criteria

### **API Success Metrics:**
- **Response Time:** <2s for Brazilian users
- **Availability:** 99.9% uptime
- **Error Rate:** <1% error rate
- **Accessibility:** 100% WCAG 2.1 AA compliance
- **Cultural Recognition:** 95%+ accuracy for Brazilian patterns

### **API Requirements:**
- **Brazilian Portuguese support**
- **Regional cultural adaptation**
- **Accessibility-first design**
- **Cost optimization integration**
- **Performance monitoring**
- **Error handling with accessibility**

The API documentation ensures RachaAI provides **comprehensive, accessible, and culturally-aware** endpoints for Brazilian users with **optimal performance** and **cost management**. 