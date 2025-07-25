# Portuguese NLP Processing Documentation

## Overview

This document outlines the comprehensive Portuguese Natural Language Processing (NLP) implementation for RachaAI, designed to understand complex Brazilian expense descriptions with high accuracy and cultural context awareness.

## Architecture Overview

### Core Components

1. **Brazilian NLP Processor** (`lib/brazilian-nlp.ts`)
   - Advanced Portuguese text processing
   - Participant and amount extraction
   - Cultural context integration
   - Regional variation support

2. **Cultural Context Analyzer** (`lib/cultural-context.ts`)
   - Brazilian cultural pattern recognition
   - Social dynamics detection
   - Regional formality analysis
   - Context-aware suggestions

3. **Regional Variation Processor** (`lib/regional-variations.ts`)
   - Regional Portuguese variations
   - Slang and expression handling
   - Regional standardization
   - Cultural adaptation

## Portuguese NLP Processing

### Text Processing Pipeline

#### 1. Text Normalization
```typescript
// Normalize Portuguese text
private normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
```

#### 2. Participant Extraction
```typescript
// Extract participants from Portuguese text
private extractParticipants(text: string, context: BrazilianCulturalContext): Participant[] {
  const participants: Participant[] = [];
  
  // Individual participants
  const individualPatterns = [
    /eu\s+(?:e\s+)?(?:você|vc|tu)/gi,
    /(?:você|vc|tu)\s+(?:e\s+)?eu/gi,
    /(?:eu|você|vc|tu|ele|ela)\s+(?:e\s+)?(?:eu|você|vc|tu|ele|ela)/gi
  ];
  
  // Group participants
  const groupPatterns = [
    /(\d+)\s+pessoas?/gi,
    /(\d+)\s+amigos?/gi,
    /(\d+)\s+colegas?/gi,
    /(\d+)\s+familiares?/gi
  ];
  
  // Family participants
  const familyPatterns = [
    /(?:minha|meu)\s+(?:esposa|marido|namorada|namorado)/gi,
    /(?:meus|minhas)\s+(?:pais|mae|pai|irmãos|irmãs)/gi,
    /familia/gi
  ];
  
  return participants;
}
```

#### 3. Amount Extraction
```typescript
// Extract monetary amounts from Portuguese text
private extractAmounts(text: string, context: BrazilianCulturalContext): Amount[] {
  const amounts: Amount[] = [];
  
  // Brazilian currency patterns
  const currencyPatterns = [
    /R\$\s*(\d+[.,]\d{2})/g,
    /R\$\s*(\d+)/g,
    /(\d+[.,]\d{2})\s*reais?/g,
    /(\d+)\s*reais?/g
  ];
  
  // Number word patterns
  const numberWords = {
    'cem': 100, 'duzentos': 200, 'trezentos': 300,
    'quatrocentos': 400, 'quinhentos': 500
  };
  
  return amounts;
}
```

#### 4. Cultural Context Recognition
```typescript
// Recognize Brazilian cultural contexts
private detectCulturalContext(text: string): BrazilianCulturalContext {
  const patterns = {
    rodizio: /rodízio|rodizio|rodada/gi,
    happy_hour: /happy\s*hour|happyhour/gi,
    churrasco: /churrasco|churrasqueira/gi,
    aniversario: /aniversário|aniversario|festa/gi,
    viagem: /viagem|viagem|hotel|passagem/gi,
    vaquinha: /vaquinha|contribuição/gi
  };
  
  return context;
}
```

### Brazilian Cultural Contexts

#### Rodízio Pattern
- **Keywords:** rodízio, rodada, pizza rodízio, churrasco rodízio
- **Social Dynamics:** Equal splitting, round-based payment
- **Regional Variations:** São Paulo (formal), Rio de Janeiro (casual)
- **Typical Scenarios:** Restaurant all-you-can-eat, group dining

#### Happy Hour Pattern
- **Keywords:** happy hour, bar, drinks, promoção
- **Social Dynamics:** Consumption-based splitting, individual payment
- **Regional Variations:** Work colleagues, casual friends
- **Typical Scenarios:** After-work socializing, drink promotions

#### Churrasco Pattern
- **Keywords:** churrasco, churrasqueira, carne, família
- **Social Dynamics:** Family-based splitting, host contribution
- **Regional Variations:** Family-oriented, group contribution
- **Typical Scenarios:** Family gatherings, weekend events

#### Aniversário Pattern
- **Keywords:** aniversário, festa, bolo, convidados
- **Social Dynamics:** Birthday person doesn't pay, equal splitting
- **Regional Variations:** Family celebrations, friend groups
- **Typical Scenarios:** Birthday parties, celebrations

#### Viagem Pattern
- **Keywords:** viagem, hotel, passagem, turismo
- **Social Dynamics:** Complex splitting, different budgets
- **Regional Variations:** Group travel, mixed budgets
- **Typical Scenarios:** Group trips, travel expenses

#### Vaquinha Pattern
- **Keywords:** vaquinha, contribuição, presente, grupo
- **Social Dynamics:** Group contribution, equal shares
- **Regional Variations:** Informal groups, gifts
- **Typical Scenarios:** Group gifts, shared expenses

## Cultural Context Recognition Guide

### Social Dynamics Detection

#### Equal Splitting (igual)
```typescript
// Detect equal splitting patterns
const equalPatterns = [
  /cada\s+um\s+paga\s+igual/gi,
  /divide\s+igual/gi,
  /todos\s+pagam\s+igual/gi,
  /rodízio/gi // Implies equal splitting
];
```

#### Consumption-Based Splitting (por_consumo)
```typescript
// Detect consumption-based patterns
const consumptionPatterns = [
  /cada\s+um\s+paga\s+o\s+que\s+consumiu/gi,
  /paga\s+o\s+que\s+bebeu/gi,
  /paga\s+o\s+que\s+comeu/gi,
  /happy\s*hour/gi // Often consumption-based
];
```

#### Host Pays (anfitriao_paga)
```typescript
// Detect host payment patterns
const hostPatterns = [
  /eu\s+pago/gi,
  /anfitrião\s+paga/gi,
  /depois\s+acertamos/gi,
  /eu\s+pago\s+agora/gi
];
```

#### Vaquinha (vaquinha)
```typescript
// Detect group contribution patterns
const vaquinhaPatterns = [
  /vaquinha/gi,
  /contribuição/gi,
  /cada\s+um\s+contribui/gi,
  /presente\s+da\s+galera/gi
];
```

#### Family-Based Splitting (por_familia)
```typescript
// Detect family-based patterns
const familyPatterns = [
  /divide\s+por\s+família/gi,
  /por\s+família/gi,
  /família\s+paga/gi,
  /churrasco\s+de\s+família/gi
];
```

### Regional Formality Analysis

#### São Paulo (Formal)
- **Characteristics:** Business-like, formal language
- **Common Expressions:** "dividir equitativamente", "participantes"
- **Formality Level:** Formal to professional
- **Payment Methods:** PIX, credit cards

#### Rio de Janeiro (Casual)
- **Characteristics:** Friendly, informal language
- **Common Expressions:** "molecada", "valeu", "beleza"
- **Formality Level:** Informal to casual
- **Payment Methods:** PIX, cash

#### Nordeste (Warm)
- **Characteristics:** Family-oriented, warm language
- **Common Expressions:** "família", "meninada", "rapaziada"
- **Formality Level:** Informal, family-focused
- **Payment Methods:** PIX, cash

#### Sul (Direct)
- **Characteristics:** Direct, precise language
- **Common Expressions:** "bah tchê", "gurizada"
- **Formality Level:** Informal, direct
- **Payment Methods:** PIX, credit cards

## Regional Variation Support Documentation

### Regional Expression Database

#### São Paulo Regionalisms
```typescript
const saoPauloExpressions = {
  'pila': {
    term: 'pila',
    standardTerm: 'dinheiro',
    meaning: 'Money, cash',
    formality: 'slang',
    usage: 'Informal way to refer to money'
  },
  'galera': {
    term: 'galera',
    standardTerm: 'pessoal',
    meaning: 'Group of people',
    formality: 'informal',
    usage: 'Refers to a group of people'
  },
  'rascar': {
    term: 'rascar',
    standardTerm: 'dividir',
    meaning: 'To split, to divide',
    formality: 'slang',
    usage: 'Informal way to say divide'
  }
};
```

#### Rio de Janeiro Regionalisms
```typescript
const rioExpressions = {
  'molecada': {
    term: 'molecada',
    standardTerm: 'pessoal',
    meaning: 'Group of young people',
    formality: 'informal',
    usage: 'Refers to a group of young people'
  },
  'valeu': {
    term: 'valeu',
    standardTerm: 'obrigado',
    meaning: 'Thanks, okay',
    formality: 'informal',
    usage: 'Casual way to say thanks or okay'
  },
  'beleza': {
    term: 'beleza',
    standardTerm: 'tudo bem',
    meaning: 'Okay, fine',
    formality: 'informal',
    usage: 'Casual way to say okay'
  }
};
```

#### Nordeste Regionalisms
```typescript
const nordesteExpressions = {
  'meninada': {
    term: 'meninada',
    standardTerm: 'pessoal',
    meaning: 'Group of people',
    formality: 'informal',
    usage: 'Refers to a group of people'
  },
  'rapaziada': {
    term: 'rapaziada',
    standardTerm: 'pessoal',
    meaning: 'Group of people',
    formality: 'informal',
    usage: 'Refers to a group of people'
  }
};
```

#### Sul Regionalisms
```typescript
const sulExpressions = {
  'bah tchê': {
    term: 'bah tchê',
    standardTerm: 'interjeição',
    meaning: 'Expression of surprise or emphasis',
    formality: 'informal',
    usage: 'Regional expression of surprise'
  },
  'gurizada': {
    term: 'gurizada',
    standardTerm: 'pessoal',
    meaning: 'Group of people',
    formality: 'informal',
    usage: 'Refers to a group of people'
  }
};
```

### Regional Standardization

#### Text Standardization Process
```typescript
// Standardize regional terms to standard Portuguese
private standardizeText(text: string, userRegion?: BrazilianRegion): string {
  let standardizedText = text;
  
  // Get regional expressions for user's region
  const regionalExpressions = this.getRegionalExpressions(userRegion);
  
  // Replace regional terms with standard terms
  for (const [regionalTerm, standardTerm] of Object.entries(regionalExpressions)) {
    const regex = new RegExp(`\\b${regionalTerm}\\b`, 'gi');
    standardizedText = standardizedText.replace(regex, standardTerm);
  }
  
  return standardizedText;
}
```

#### Regional Context Detection
```typescript
// Detect user's regional context
private detectRegion(text: string, userRegion?: BrazilianRegion): BrazilianRegion {
  const regionalIndicators = {
    sao_paulo: ['pila', 'galera', 'rascar'],
    rio_de_janeiro: ['molecada', 'valeu', 'beleza'],
    nordeste: ['meninada', 'rapaziada'],
    sul: ['bah tchê', 'gurizada']
  };
  
  // Analyze text for regional indicators
  for (const [region, indicators] of Object.entries(regionalIndicators)) {
    for (const indicator of indicators) {
      if (text.toLowerCase().includes(indicator)) {
        return region as BrazilianRegion;
      }
    }
  }
  
  return userRegion || 'outros';
}
```

## Testing Framework Documentation

### Unit Test Structure

#### Portuguese NLP Processing Tests
```typescript
describe('Portuguese NLP Processing Tests', () => {
  test('should process complex Portuguese expense descriptions', async () => {
    const text = 'Fizemos um rodízio japonês com 8 pessoas. A conta foi R$ 320, mas 2 pessoas não beberam álcool. Como dividir?';
    const result = await nlpProcessor.processText(text);
    
    expect(result.originalText).toBe(text);
    expect(result.participants.length).toBeGreaterThan(0);
    expect(result.amounts.length).toBeGreaterThan(0);
    expect(result.currency).toBe('BRL');
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
```

#### Cultural Context Recognition Tests
```typescript
describe('Cultural Context Recognition Tests', () => {
  test('should recognize rodízio scenarios', async () => {
    const text = 'Pizza rodízio com a galera. Cada um paga uma rodada.';
    const result = await nlpProcessor.processText(text);
    
    expect(result.culturalContext.scenario).toBe('rodizio');
    expect(result.culturalContext.socialDynamics).toBe('rodizio');
  });
});
```

#### Regional Variation Tests
```typescript
describe('Regional Variation Tests', () => {
  test('should handle São Paulo expressions', async () => {
    const text = 'Vamos rascar a conta. Cada um paga igual.';
    const result = await nlpProcessor.processText(text);
    
    expect(result.regionalVariations.length).toBeGreaterThan(0);
    expect(result.regionalVariations.some(v => v.region === 'sao_paulo')).toBe(true);
  });
});
```

### Integration Test Structure

#### End-to-End Processing Tests
```typescript
describe('Integration Tests', () => {
  test('should process complex Brazilian expense scenario', async () => {
    const text = 'Rodízio de pizza com a galera de São Paulo. A conta foi R$ 200,00 para 5 pessoas. Cada um paga uma rodada. Pago com PIX.';
    
    const result = await nlpProcessor.processText(text);
    
    expect(result.culturalContext.scenario).toBe('rodizio');
    expect(result.splittingMethod).toBe('equal');
    expect(result.totalAmount).toBe(200);
    expect(result.participants.length).toBeGreaterThan(0);
  });
});
```

### Performance Test Structure

#### Response Time Tests
```typescript
describe('Performance Tests', () => {
  test('should process complex text within time limits', async () => {
    const complexText = 'Fizemos um rodízio japonês com 8 pessoas, incluindo 2 que não bebem álcool. A conta foi R$ 320, mas temos desconto de 15% para grupo. Como dividir considerando que alguns trouxeram bebidas?';
    
    const startTime = Date.now();
    const result = await nlpProcessor.processText(complexText);
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(3000); // <3 seconds
    expect(result.processingTime).toBeLessThan(3000);
  });
});
```

## Accuracy Validation Procedures

### Accuracy Metrics

#### Portuguese Expense Interpretation (Target: 90%+)
```typescript
// Test cases for accuracy validation
const accuracyTestCases = [
  {
    input: 'Dividir R$ 100 entre 4 pessoas',
    expectedParticipants: 4,
    expectedAmount: 100,
    expectedMethod: 'equal'
  },
  {
    input: 'Happy hour. Cada um paga o que consumiu.',
    expectedMethod: 'by_consumption'
  },
  {
    input: 'Churrasco. Eu pago a carne.',
    expectedMethod: 'host_pays'
  },
  {
    input: 'Vamos fazer uma vaquinha.',
    expectedMethod: 'vaquinha'
  },
  {
    input: 'Aniversário da minha mãe. Ela não paga.',
    expectedMethod: 'equal'
  }
];
```

#### Cultural Pattern Recognition (Target: 95%+)
```typescript
// Cultural pattern test cases
const culturalTestCases = [
  { input: 'Rodízio com amigos', expectedScenario: 'rodizio' },
  { input: 'Happy hour com colegas', expectedScenario: 'happy_hour' },
  { input: 'Churrasco de família', expectedScenario: 'churrasco' },
  { input: 'Aniversário da minha mãe', expectedScenario: 'aniversario' },
  { input: 'Viagem em grupo', expectedScenario: 'viagem' },
  { input: 'Vamos fazer uma vaquinha', expectedScenario: 'vaquinha' }
];
```

#### Regional Variation Support (Target: 85%+)
```typescript
// Regional variation test cases
const regionalTestCases = [
  { input: 'Vamos rascar a conta', region: 'sao_paulo' },
  { input: 'Happy hour com a molecada', region: 'rio_de_janeiro' },
  { input: 'Churrasco com a família', region: 'bahia' },
  { input: 'Bah tchê, como dividir?', region: 'rio_grande_sul' }
];
```

### Validation Process

#### 1. Test Execution
```bash
# Run accuracy validation tests
npm test -- --testNamePattern="Accuracy Validation Tests"
```

#### 2. Results Analysis
```typescript
// Analyze test results
const analyzeAccuracy = (testResults: TestResult[]) => {
  const totalTests = testResults.length;
  const correctTests = testResults.filter(result => result.correct).length;
  const accuracy = (correctTests / totalTests) * 100;
  
  console.log(`Accuracy: ${accuracy}% (${correctTests}/${totalTests})`);
  return accuracy >= 90; // Target accuracy
};
```

#### 3. Performance Validation
```typescript
// Validate performance targets
const validatePerformance = (processingTimes: number[]) => {
  const averageTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
  const maxTime = Math.max(...processingTimes);
  
  console.log(`Average processing time: ${averageTime}ms`);
  console.log(`Maximum processing time: ${maxTime}ms`);
  
  return averageTime < 2000 && maxTime < 3000; // Performance targets
};
```

## Brazilian Cultural Training Data Guide

### Training Data Structure

#### Cultural Scenarios
```typescript
// Brazilian cultural scenario training data
const culturalTrainingData = {
  rodizio: {
    scenarios: [
      'Pizza rodízio com amigos',
      'Churrasco rodízio na churrascaria',
      'Rodízio japonês com colegas do trabalho',
      'Rodízio de massas com a família'
    ],
    socialDynamics: 'equal',
    paymentMethods: ['pix', 'cartao'],
    regionalVariations: {
      sao_paulo: 'Formal rodízio experience',
      rio_de_janeiro: 'Casual rodízio with friends',
      nordeste: 'Family rodízio gatherings',
      sul: 'Direct rodízio splitting'
    }
  },
  happy_hour: {
    scenarios: [
      'Happy hour com colegas do trabalho',
      'Happy hour no bar com amigos',
      'Happy hour com promoção de drinks',
      'Happy hour com a galera'
    ],
    socialDynamics: 'by_consumption',
    paymentMethods: ['pix', 'dinheiro'],
    regionalVariations: {
      sao_paulo: 'Business happy hour',
      rio_de_janeiro: 'Casual happy hour',
      nordeste: 'Social happy hour',
      sul: 'Direct happy hour'
    }
  }
};
```

#### Regional Expressions
```typescript
// Regional expression training data
const regionalTrainingData = {
  sao_paulo: {
    expressions: [
      { term: 'pila', standard: 'dinheiro', context: 'money' },
      { term: 'galera', standard: 'pessoal', context: 'group' },
      { term: 'rascar', standard: 'dividir', context: 'split' }
    ],
    formality: 'formal',
    culturalNotes: [
      'More business-oriented language',
      'Formal payment methods preferred',
      'Direct communication style'
    ]
  },
  rio_de_janeiro: {
    expressions: [
      { term: 'molecada', standard: 'pessoal', context: 'group' },
      { term: 'valeu', standard: 'obrigado', context: 'thanks' },
      { term: 'beleza', standard: 'tudo bem', context: 'okay' }
    ],
    formality: 'informal',
    culturalNotes: [
      'Casual and friendly language',
      'Informal payment methods accepted',
      'Warm communication style'
    ]
  }
};
```

### Training Data Validation

#### Data Quality Checks
```typescript
// Validate training data quality
const validateTrainingData = (data: TrainingData) => {
  const checks = {
    completeness: data.scenarios.length > 0,
    accuracy: data.socialDynamics !== undefined,
    regionalCoverage: Object.keys(data.regionalVariations).length > 0,
    culturalAccuracy: data.culturalNotes.length > 0
  };
  
  return Object.values(checks).every(check => check);
};
```

#### Cultural Accuracy Validation
```typescript
// Validate cultural accuracy
const validateCulturalAccuracy = (scenarios: string[]) => {
  const culturalKeywords = [
    'rodízio', 'happy hour', 'churrasco', 'aniversário',
    'viagem', 'vaquinha', 'família', 'amigos'
  ];
  
  return scenarios.every(scenario => 
    culturalKeywords.some(keyword => 
      scenario.toLowerCase().includes(keyword)
    )
  );
};
```

---

*This comprehensive Portuguese NLP processing implementation provides high-accuracy Brazilian expense understanding with cultural context awareness and regional adaptation.* 