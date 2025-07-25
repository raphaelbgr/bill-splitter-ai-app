import { BrazilianRegion, BrazilianCulturalContext } from './cultural-context';

// Regional Portuguese Processing Types
export interface RegionalPortugueseResult {
  originalText: string;
  normalizedText: string;
  detectedRegion: BrazilianRegion;
  regionalExpressions: RegionalExpression[];
  culturalReferences: CulturalReference[];
  codeSwitching: CodeSwitching[];
  confidence: number;
  suggestions: string[];
}

export interface RegionalExpression {
  original: string;
  standard: string;
  region: BrazilianRegion;
  confidence: number;
  context: string;
}

export interface CulturalReference {
  reference: string;
  type: 'food' | 'activity' | 'social' | 'payment' | 'expression';
  region: BrazilianRegion;
  confidence: number;
  explanation: string;
}

export interface CodeSwitching {
  original: string;
  portuguesePart: string;
  englishPart: string;
  confidence: number;
}

// Regional Portuguese Expressions by Region
export const REGIONAL_PORTUGUESE_EXPRESSIONS: Record<BrazilianRegion, Record<string, string>> = {
  sao_paulo: {
    // Formal business expressions
    'cara': 'pessoa',
    'tipo': 'tipo',
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente'
  },
  rio_de_janeiro: {
    // Casual, friendly expressions
    'molecada': 'pessoal',
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  },
  minas_gerais: {
    // Warm, family-oriented expressions
    'rapaziada': 'pessoal',
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  },
  bahia: {
    // Warm, family-oriented expressions
    'meninada': 'pessoal',
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  },
  pernambuco: {
    // Warm, family-oriented expressions
    'rapaziada': 'pessoal',
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  },
  parana: {
    // More direct, precise expressions
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  },
  rio_grande_sul: {
    // Direct, precise expressions with German/Italian influences
    'bah': 'pois é',
    'tchê': 'amigo',
    'tche': 'amigo',
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  },
  outros: {
    // Standard expressions
    'beleza': 'tudo bem',
    'massa': 'legal',
    'da hora': 'muito bom',
    'rolê': 'passeio',
    'curtir': 'aproveitar',
    'mano': 'amigo',
    'parça': 'amigo',
    'firmeza': 'tudo certo',
    'valeu': 'obrigado',
    'tranquilo': 'sem problema',
    'suave': 'tranquilo',
    'daora': 'legal',
    'show': 'ótimo',
    'bacaninha': 'legal',
    'irado': 'muito bom',
    'top': 'excelente',
    'demais': 'muito bom',
    'bom demais': 'excelente',
    'massa demais': 'muito legal',
    'da hora demais': 'muito bom',
    'show de bola': 'excelente',
    'bacaninha demais': 'muito legal',
    'irado demais': 'muito bom',
    'top demais': 'excelente',
    'demais da conta': 'muito bom',
    'bom demais da conta': 'excelente',
    'massa demais da conta': 'muito legal',
    'da hora demais da conta': 'muito bom',
    'show de bola demais': 'excelente',
    'bacaninha demais da conta': 'muito legal',
    'irado demais da conta': 'muito bom',
    'top demais da conta': 'excelente',
    'cara': 'pessoa',
    'tipo': 'tipo'
  }
};

// Brazilian Cultural References
export const BRAZILIAN_CULTURAL_REFERENCES: Record<string, CulturalReference> = {
  // Food-related references
  'rodízio': {
    reference: 'rodízio',
    type: 'food',
    region: 'sao_paulo',
    confidence: 0.95,
    explanation: 'All-you-can-eat restaurant concept, very popular in Brazil'
  },
  'rodizio': {
    reference: 'rodizio',
    type: 'food',
    region: 'sao_paulo',
    confidence: 0.95,
    explanation: 'All-you-can-eat restaurant concept, very popular in Brazil'
  },
  'churrasco': {
    reference: 'churrasco',
    type: 'food',
    region: 'rio_grande_sul',
    confidence: 0.95,
    explanation: 'Brazilian barbecue tradition, especially popular in the South'
  },
  'feijoada': {
    reference: 'feijoada',
    type: 'food',
    region: 'rio_de_janeiro',
    confidence: 0.90,
    explanation: 'Traditional Brazilian black bean stew with pork'
  },
  'acarajé': {
    reference: 'acarajé',
    type: 'food',
    region: 'bahia',
    confidence: 0.95,
    explanation: 'Traditional Bahian street food made from black-eyed peas'
  },
  'carne de sol': {
    reference: 'carne de sol',
    type: 'food',
    region: 'pernambuco',
    confidence: 0.90,
    explanation: 'Sun-dried beef, traditional in the Northeast'
  },

  // Activity-related references
  'happy hour': {
    reference: 'happy hour',
    type: 'activity',
    region: 'sao_paulo',
    confidence: 0.85,
    explanation: 'After-work social drinking, very common in business districts'
  },
  'aniversário': {
    reference: 'aniversário',
    type: 'activity',
    region: 'outros',
    confidence: 0.90,
    explanation: 'Birthday celebration culture, very important in Brazilian social life'
  },
  'aniversario': {
    reference: 'aniversario',
    type: 'activity',
    region: 'outros',
    confidence: 0.90,
    explanation: 'Birthday celebration culture, very important in Brazilian social life'
  },
  'viagem': {
    reference: 'viagem',
    type: 'activity',
    region: 'outros',
    confidence: 0.85,
    explanation: 'Travel and vacation culture, very popular in Brazil'
  },
  'vaquinha': {
    reference: 'vaquinha',
    type: 'activity',
    region: 'outros',
    confidence: 0.90,
    explanation: 'Group contribution concept, very common for gifts and events'
  },

  // Social references
  'galera': {
    reference: 'galera',
    type: 'social',
    region: 'outros',
    confidence: 0.85,
    explanation: 'Informal way to refer to a group of people'
  },
  'molecada': {
    reference: 'molecada',
    type: 'social',
    region: 'rio_de_janeiro',
    confidence: 0.90,
    explanation: 'Rio slang for group of people, especially young people'
  },
  'rapaziada': {
    reference: 'rapaziada',
    type: 'social',
    region: 'minas_gerais',
    confidence: 0.90,
    explanation: 'Minas Gerais slang for group of people'
  },
  'meninada': {
    reference: 'meninada',
    type: 'social',
    region: 'bahia',
    confidence: 0.90,
    explanation: 'Bahian slang for group of people'
  },

  // Payment references
  'pix': {
    reference: 'pix',
    type: 'payment',
    region: 'outros',
    confidence: 0.95,
    explanation: 'Brazilian instant payment system, very popular'
  },
  'boleto': {
    reference: 'boleto',
    type: 'payment',
    region: 'outros',
    confidence: 0.90,
    explanation: 'Brazilian bank slip payment method'
  },
  'cartão': {
    reference: 'cartão',
    type: 'payment',
    region: 'outros',
    confidence: 0.85,
    explanation: 'Credit/debit card payment method'
  },
  'cartao': {
    reference: 'cartao',
    type: 'payment',
    region: 'outros',
    confidence: 0.85,
    explanation: 'Credit/debit card payment method'
  },

  // Expression references
  'beleza': {
    reference: 'beleza',
    type: 'expression',
    region: 'outros',
    confidence: 0.85,
    explanation: 'Very common Brazilian expression meaning "okay" or "alright"'
  },
  'valeu': {
    reference: 'valeu',
    type: 'expression',
    region: 'outros',
    confidence: 0.90,
    explanation: 'Informal way to say "thank you" or "thanks"'
  },
  'tranquilo': {
    reference: 'tranquilo',
    type: 'expression',
    region: 'outros',
    confidence: 0.85,
    explanation: 'Informal way to say "no problem" or "it\'s fine"'
  },
  'bah': {
    reference: 'bah',
    type: 'expression',
    region: 'rio_grande_sul',
    confidence: 0.95,
    explanation: 'Very characteristic Rio Grande do Sul expression, similar to "well" or "so"'
  },
  'tchê': {
    reference: 'tchê',
    type: 'expression',
    region: 'rio_grande_sul',
    confidence: 0.95,
    explanation: 'Very characteristic Rio Grande do Sul expression, similar to "hey" or "dude"'
  },
  'tche': {
    reference: 'tche',
    type: 'expression',
    region: 'rio_grande_sul',
    confidence: 0.95,
    explanation: 'Very characteristic Rio Grande do Sul expression, similar to "hey" or "dude"'
  }
};

// Regional Portuguese Processor
export class RegionalPortugueseProcessor {
  private regionalExpressions = REGIONAL_PORTUGUESE_EXPRESSIONS;
  private culturalReferences = BRAZILIAN_CULTURAL_REFERENCES;

  /**
   * Process text for regional Portuguese variations and cultural context
   */
  async processRegionalPortuguese(
    text: string,
    userRegion?: BrazilianRegion
  ): Promise<RegionalPortugueseResult> {
    const normalizedText = this.normalizeText(text);
    const detectedRegion = this.detectRegion(text, userRegion);
    const regionalExpressions = this.detectRegionalExpressions(text, detectedRegion);
    const culturalReferences = this.detectCulturalReferences(text);
    const codeSwitching = this.detectCodeSwitching(text);
    const confidence = this.calculateConfidence(regionalExpressions, culturalReferences, codeSwitching);
    const suggestions = this.generateSuggestions(regionalExpressions, culturalReferences, detectedRegion);

    return {
      originalText: text,
      normalizedText,
      detectedRegion,
      regionalExpressions,
      culturalReferences,
      codeSwitching,
      confidence,
      suggestions
    };
  }

  /**
   * Normalize text for processing
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detect the region based on text patterns and user preference
   */
  private detectRegion(text: string, userRegion?: BrazilianRegion): BrazilianRegion {
    const normalizedText = this.normalizeText(text);
    
    // Check for specific regional markers
    if (normalizedText.includes('bah') || normalizedText.includes('tchê')) {
      return 'rio_grande_sul';
    }
    if (normalizedText.includes('molecada')) {
      return 'rio_de_janeiro';
    }
    if (normalizedText.includes('rapaziada')) {
      return 'minas_gerais';
    }
    if (normalizedText.includes('meninada')) {
      return 'bahia';
    }
    if (normalizedText.includes('acarajé') || normalizedText.includes('acaraje')) {
      return 'bahia';
    }
    if (normalizedText.includes('carne de sol')) {
      return 'pernambuco';
    }
    if (normalizedText.includes('churrasco')) {
      return 'rio_grande_sul';
    }
    if (normalizedText.includes('feijoada')) {
      return 'rio_de_janeiro';
    }

    // Use user preference if available
    if (userRegion && userRegion !== 'outros') {
      return userRegion;
    }

    // Default to São Paulo (most common business region)
    return 'sao_paulo';
  }

  /**
   * Detect regional expressions in the text
   */
  private detectRegionalExpressions(text: string, region: BrazilianRegion): RegionalExpression[] {
    const normalizedText = this.normalizeText(text);
    const expressions: RegionalExpression[] = [];
    const regionExpressions = this.regionalExpressions[region] || {};

    // Sort expressions by length (longest first) to avoid partial matches
    const sortedExpressions = Object.entries(regionExpressions)
      .sort(([a], [b]) => b.length - a.length);

    for (const [original, standard] of sortedExpressions) {
      if (normalizedText.includes(original)) {
        // Check if this expression is already covered by a longer expression
        const isCovered = expressions.some(exp => 
          exp.original.includes(original) || original.includes(exp.original)
        );
        
        if (!isCovered) {
          expressions.push({
            original,
            standard,
            region,
            confidence: this.calculateExpressionConfidence(original, region),
            context: this.extractExpressionContext(text, original)
          });
        }
      }
    }

    return expressions;
  }

  /**
   * Detect cultural references in the text
   */
  private detectCulturalReferences(text: string): CulturalReference[] {
    const normalizedText = this.normalizeText(text);
    const references: CulturalReference[] = [];

    // Sort references by length (longest first) to avoid partial matches
    const sortedReferences = Object.entries(this.culturalReferences)
      .sort(([a], [b]) => b.length - a.length);

    for (const [key, reference] of sortedReferences) {
      // Check for exact matches and partial matches with accent variations
      const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalizedTextForComparison = normalizedText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      if (normalizedText.includes(key) || 
          normalizedText.includes(key.replace('í', 'i')) ||
          normalizedText.includes(key.replace('ã', 'a')) ||
          normalizedText.includes(key.replace('ê', 'e')) ||
          normalizedTextForComparison.includes(normalizedKey)) {
        // Check if this reference is already covered by a longer reference
        const isCovered = references.some(ref => 
          ref.reference.includes(key) || key.includes(ref.reference)
        );
        
        if (!isCovered) {
          references.push({
            ...reference,
            confidence: this.calculateCulturalReferenceConfidence(key, reference.region)
          });
        }
      }
    }

    return references;
  }

  /**
   * Detect code-switching between Portuguese and English
   */
  private detectCodeSwitching(text: string): CodeSwitching[] {
    const codeSwitching: CodeSwitching[] = [];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[^\w]/g, '');
      
      // Check for English words commonly used in Brazilian Portuguese
      const englishWords = [
        'ok', 'okay', 'yes', 'no', 'hello', 'hi', 'bye', 'thanks', 'thank you',
        'cool', 'nice', 'good', 'bad', 'great', 'awesome', 'perfect', 'excellent',
        'amazing', 'incredible', 'fantastic', 'wonderful', 'terrible', 'horrible',
        'beautiful', 'ugly', 'big', 'small', 'hot', 'cold', 'new', 'old',
        'fast', 'slow', 'easy', 'hard', 'difficult', 'simple', 'complex',
        'happy', 'sad', 'angry', 'excited', 'bored', 'tired', 'energetic',
        'smart', 'stupid', 'clever', 'dumb', 'funny', 'serious', 'fun',
        'boring', 'interesting', 'exciting', 'amazing', 'wonderful', 'terrible'
      ];

      if (englishWords.includes(word)) {
        const originalWord = words[i];
        const portuguesePart = text.substring(0, text.indexOf(originalWord));
        const englishPart = word;
        
        codeSwitching.push({
          original: originalWord,
          portuguesePart,
          englishPart,
          confidence: 0.85
        });
      }
    }

    return codeSwitching;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(
    regionalExpressions: RegionalExpression[],
    culturalReferences: CulturalReference[],
    codeSwitching: CodeSwitching[]
  ): number {
    const expressionConfidence = regionalExpressions.length > 0 
      ? regionalExpressions.reduce((sum, exp) => sum + exp.confidence, 0) / regionalExpressions.length 
      : 0.5;
    
    const culturalConfidence = culturalReferences.length > 0 
      ? culturalReferences.reduce((sum, ref) => sum + ref.confidence, 0) / culturalReferences.length 
      : 0.5;
    
    const codeSwitchingConfidence = codeSwitching.length > 0 
      ? codeSwitching.reduce((sum, cs) => sum + cs.confidence, 0) / codeSwitching.length 
      : 0.5;

    // Weight the confidence based on the number of detected items
    const totalItems = regionalExpressions.length + culturalReferences.length + codeSwitching.length;
    const baseConfidence = (expressionConfidence + culturalConfidence + codeSwitchingConfidence) / 3;
    
    // Boost confidence if we have multiple indicators
    if (totalItems >= 3) {
      return Math.min(0.95, baseConfidence + 0.1);
    } else if (totalItems >= 2) {
      return Math.min(0.9, baseConfidence + 0.05);
    }
    
    return baseConfidence;
  }

  /**
   * Calculate confidence for regional expressions
   */
  private calculateExpressionConfidence(expression: string, region: BrazilianRegion): number {
    // Base confidence on expression frequency and regional specificity
    const regionalSpecificity = {
      'sao_paulo': 0.8,
      'rio_de_janeiro': 0.85,
      'minas_gerais': 0.9,
      'bahia': 0.9,
      'pernambuco': 0.9,
      'parana': 0.8,
      'rio_grande_sul': 0.95,
      'outros': 0.7
    };

    // Boost confidence for longer expressions
    const lengthBoost = Math.min(0.1, expression.length * 0.02);
    
    return Math.min(0.95, (regionalSpecificity[region] || 0.7) + lengthBoost);
  }

  /**
   * Calculate confidence for cultural references
   */
  private calculateCulturalReferenceConfidence(reference: string, region: BrazilianRegion): number {
    // Base confidence on reference specificity and regional accuracy
    const referenceData = this.culturalReferences[reference];
    if (!referenceData) return 0.5;

    return referenceData.confidence;
  }

  /**
   * Extract context around an expression
   */
  private extractExpressionContext(text: string, expression: string): string {
    const index = text.toLowerCase().indexOf(expression);
    if (index === -1) return '';

    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + expression.length + 20);
    return text.substring(start, end).trim();
  }

  /**
   * Generate suggestions based on regional analysis
   */
  private generateSuggestions(
    regionalExpressions: RegionalExpression[],
    culturalReferences: CulturalReference[],
    region: BrazilianRegion
  ): string[] {
    const suggestions: string[] = [];

    // Add regional expression suggestions
    if (regionalExpressions.length > 0) {
      suggestions.push(`Detectei expressões regionais de ${this.getRegionName(region)}`);
    }

    // Add cultural reference suggestions
    if (culturalReferences.length > 0) {
      const references = culturalReferences.map(ref => ref.reference).join(', ');
      suggestions.push(`Referências culturais detectadas: ${references}`);
    }

    // Add regional authenticity suggestions
    suggestions.push(`Processando com contexto regional de ${this.getRegionName(region)}`);

    return suggestions;
  }

  /**
   * Get human-readable region name
   */
  private getRegionName(region: BrazilianRegion): string {
    const regionNames: Record<BrazilianRegion, string> = {
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
      'minas_gerais': 'Minas Gerais',
      'bahia': 'Bahia',
      'pernambuco': 'Pernambuco',
      'parana': 'Paraná',
      'rio_grande_sul': 'Rio Grande do Sul',
      'outros': 'outras regiões'
    };

    return regionNames[region] || 'outras regiões';
  }
} 