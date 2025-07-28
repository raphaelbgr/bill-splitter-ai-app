import { z } from 'zod';
import { BrazilianCulturalContextAnalyzer, BrazilianCulturalContext } from './cultural-context';

// Brazilian NLP Processing Types
export interface BrazilianNLPResult {
  originalText: string;
  normalizedText: string;
  participants: Participant[];
  amounts: Amount[];
  currency: string;
  totalAmount: number;
  splittingMethod: SplittingMethod;
  culturalContext: BrazilianCulturalContext;
  confidence: number;
  suggestions: string[];
  regionalVariations: RegionalVariation[];
  processingTime: number;
}

export interface Participant {
  name: string;
  type: 'person' | 'group' | 'family' | 'couple';
  count: number;
  confidence: number;
  context: string;
}

export interface Amount {
  value: number;
  currency: string;
  description: string;
  type: 'total' | 'per_person' | 'per_group' | 'discount' | 'tax' | 'tip';
  confidence: number;
}

export type SplittingMethod = 
  | 'equal' 
  | 'by_consumption' 
  | 'host_pays' 
  | 'vaquinha' 
  | 'by_family' 
  | 'complex';

export interface RegionalVariation {
  region: string;
  originalTerm: string;
  standardTerm: string;
  confidence: number;
}

// Brazilian Currency and Number Patterns
export const BRAZILIAN_CURRENCY_PATTERNS = {
  real: {
    symbols: ['R$', 'R$ ', 'R$', 'reais', 'real', 'reais de', 'real de'],
    decimalSeparator: ',',
    thousandsSeparator: '.',
    patterns: [
      /R\$\s*(\d+[.,]\d{2})/g,
      /R\$\s*(\d+)/g,
      /(\d+[.,]\d{2})\s*reais?/g,
      /(\d+)\s*reais?/g,
      /reais?\s*(\d+[.,]\d{2})/g,
      /reais?\s*(\d+)/g
    ]
  }
};

// Brazilian Number Patterns
export const BRAZILIAN_NUMBER_PATTERNS = {
  // Common number words
  numberWords: {
    'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
    'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
    'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14, 'catorze': 14,
    'quinze': 15, 'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
    'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50, 'sessenta': 60,
    'setenta': 70, 'oitenta': 80, 'noventa': 90, 'cem': 100, 'cento': 100,
    'mil': 1000, 'milhão': 1000000, 'milhao': 1000000, 'milhões': 1000000, 'milhoes': 1000000
  },

  // Multipliers
  multipliers: {
    'e meio': 0.5, 'meio': 0.5, 'meia': 0.5,
    'e um quarto': 0.25, 'um quarto': 0.25,
    'e três quartos': 0.75, 'três quartos': 0.75, 'tres quartos': 0.75
  }
};

// Brazilian Regional Expressions
export const BRAZILIAN_REGIONAL_EXPRESSIONS: Record<string, Record<string, string>> = {
  sao_paulo: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal'
  },
  rio_de_janeiro: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal',
    'molecada': 'pessoal'
  },
  minas_gerais: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal',
    'rapaziada': 'pessoal'
  },
  bahia: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal',
    'meninada': 'pessoal'
  },
  pernambuco: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal',
    'rapaziada': 'pessoal'
  },
  parana: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal'
  },
  rio_grande_sul: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal'
  },
  outros: {
    'dividir': 'dividir',
    'pagar': 'pagar',
    'rascar': 'rascar',
    'pila': 'dinheiro',
    'grana': 'dinheiro',
    'galera': 'pessoal'
  }
};

// Brazilian NLP Processor
export class BrazilianNLPProcessor {
  private culturalAnalyzer: BrazilianCulturalContextAnalyzer;
  private currencyPatterns = BRAZILIAN_CURRENCY_PATTERNS;
  private numberPatterns = BRAZILIAN_NUMBER_PATTERNS;
  private regionalExpressions = BRAZILIAN_REGIONAL_EXPRESSIONS;

  constructor() {
    this.culturalAnalyzer = new BrazilianCulturalContextAnalyzer();
  }

  async analyzeExpense(
    description: string,
    amount: number,
    context: {
      region?: string;
      context?: string;
      userId?: string;
      groupId?: string;
    }
  ): Promise<{
    category: string;
    confidence: number;
    keywords: string[];
    culturalFactors: string[];
    regionalVariations: any[];
    reason: string;
  }> {
    // Analyze the expense description
    const result = await this.processText(description, context.region);
    
    // Determine category based on description and amount
    const category = this.determineExpenseCategory(description, amount, context);
    
    // Extract keywords
    const keywords = this.extractKeywords(description);
    
    // Get cultural factors
    const culturalFactors = this.getCulturalFactors(description, context.region);
    
    // Get regional variations
    const regionalVariations = this.detectRegionalVariations(description, context.region);
    
    // Calculate confidence
    const confidence = this.calculateCategoryConfidence(description, amount, category);
    
    return {
      category,
      confidence,
      keywords,
      culturalFactors,
      regionalVariations,
      reason: this.generateCategoryReason(description, category, context.region),
    };
  }

  private determineExpenseCategory(description: string, amount: number, context: any): string {
    const normalizedDesc = description.toLowerCase();
    
    // Restaurant categories
    if (normalizedDesc.includes('restaurante') || normalizedDesc.includes('japonês') || 
        normalizedDesc.includes('pizza') || normalizedDesc.includes('hambúrguer') ||
        normalizedDesc.includes('almoço') || normalizedDesc.includes('jantar')) {
      return 'restaurante';
    }
    
    // Transportation
    if (normalizedDesc.includes('uber') || normalizedDesc.includes('99') || 
        normalizedDesc.includes('taxi') || normalizedDesc.includes('transporte') ||
        normalizedDesc.includes('ônibus') || normalizedDesc.includes('metrô')) {
      return 'transporte';
    }
    
    // Entertainment
    if (normalizedDesc.includes('cinema') || normalizedDesc.includes('teatro') ||
        normalizedDesc.includes('show') || normalizedDesc.includes('festa') ||
        normalizedDesc.includes('bar') || normalizedDesc.includes('balada')) {
      return 'entretenimento';
    }
    
    // Shopping
    if (normalizedDesc.includes('shopping') || normalizedDesc.includes('loja') ||
        normalizedDesc.includes('roupa') || normalizedDesc.includes('sapato') ||
        normalizedDesc.includes('compra')) {
      return 'shopping';
    }
    
    // Travel
    if (normalizedDesc.includes('viagem') || normalizedDesc.includes('hotel') ||
        normalizedDesc.includes('passagem') || normalizedDesc.includes('turismo')) {
      return 'viagem';
    }
    
    // Family/Home
    if (normalizedDesc.includes('casa') || normalizedDesc.includes('família') ||
        normalizedDesc.includes('supermercado') || normalizedDesc.includes('feira')) {
      return 'família';
    }
    
    // Default
    return 'outros';
  }

  private extractKeywords(description: string): string[] {
    const keywords: string[] = [];
    const normalizedDesc = description.toLowerCase();
    
    // Common expense keywords
    const commonKeywords = [
      'restaurante', 'japonês', 'pizza', 'hambúrguer', 'almoço', 'jantar',
      'uber', 'taxi', 'transporte', 'ônibus', 'metrô',
      'cinema', 'teatro', 'show', 'festa', 'bar', 'balada',
      'shopping', 'loja', 'roupa', 'sapato', 'compra',
      'viagem', 'hotel', 'passagem', 'turismo',
      'casa', 'família', 'supermercado', 'feira'
    ];
    
    commonKeywords.forEach(keyword => {
      if (normalizedDesc.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  private getCulturalFactors(description: string, region?: string): string[] {
    const factors: string[] = [];
    const normalizedDesc = description.toLowerCase();
    
    // Brazilian cultural factors
    if (normalizedDesc.includes('rodízio') || normalizedDesc.includes('churrasco')) {
      factors.push('brazilian_social_dining');
    }
    
    if (normalizedDesc.includes('pix') || normalizedDesc.includes('transferência')) {
      factors.push('brazilian_payment_preference');
    }
    
    if (region === 'SP' || region === 'RJ') {
      factors.push('urban_lifestyle');
    } else if (region === 'RS') {
      factors.push('gaucho_culture');
    }
    
    return factors;
  }

  private calculateCategoryConfidence(description: string, amount: number, category: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on description clarity
    const normalizedDesc = description.toLowerCase();
    const categoryKeywords = this.getCategoryKeywords(category);
    
    let keywordMatches = 0;
    categoryKeywords.forEach(keyword => {
      if (normalizedDesc.includes(keyword)) {
        keywordMatches++;
      }
    });
    
    confidence += (keywordMatches / categoryKeywords.length) * 0.3;
    
    // Adjust confidence based on amount ranges
    if (category === 'restaurante' && amount > 50 && amount < 200) {
      confidence += 0.1;
    } else if (category === 'transporte' && amount > 10 && amount < 50) {
      confidence += 0.1;
    } else if (category === 'entretenimento' && amount > 20 && amount < 100) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  }

  private getCategoryKeywords(category: string): string[] {
    const keywords: { [key: string]: string[] } = {
      restaurante: ['restaurante', 'japonês', 'pizza', 'hambúrguer', 'almoço', 'jantar', 'rodízio'],
      transporte: ['uber', 'taxi', 'transporte', 'ônibus', 'metrô', '99'],
      entretenimento: ['cinema', 'teatro', 'show', 'festa', 'bar', 'balada'],
      shopping: ['shopping', 'loja', 'roupa', 'sapato', 'compra'],
      viagem: ['viagem', 'hotel', 'passagem', 'turismo'],
      família: ['casa', 'família', 'supermercado', 'feira'],
    };
    
    return keywords[category] || [];
  }

  private generateCategoryReason(description: string, category: string, region?: string): string {
    const reasons: { [key: string]: string } = {
      restaurante: 'Despesa de alimentação em restaurante',
      transporte: 'Despesa de transporte/deslocamento',
      entretenimento: 'Despesa de entretenimento/lazer',
      shopping: 'Despesa de compras/shopping',
      viagem: 'Despesa de viagem/turismo',
      família: 'Despesa familiar/doméstica',
      outros: 'Despesa geral',
    };
    
    return reasons[category] || 'Despesa categorizada automaticamente';
  }

  /**
   * Process Brazilian Portuguese text for expense parsing
   */
  async processText(
    text: string, 
    userRegion?: string
  ): Promise<BrazilianNLPResult> {
    const startTime = Date.now();
    
    // Normalize text
    const normalizedText = this.normalizeText(text);
    
    // Analyze cultural context
    const culturalContext = this.culturalAnalyzer.analyzeCulturalContext(
      normalizedText, 
      userRegion as any
    );
    
    // Extract participants
    const participants = this.extractParticipants(normalizedText, culturalContext);
    
    // Extract amounts
    const amounts = this.extractAmounts(normalizedText, culturalContext);
    
    // Determine splitting method
    const splittingMethod = this.determineSplittingMethod(normalizedText, culturalContext);
    
    // Calculate total amount
    const totalAmount = this.calculateTotalAmount(amounts);
    
    // Detect regional variations
    const regionalVariations = this.detectRegionalVariations(normalizedText, culturalContext.region);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(culturalContext, participants, amounts, splittingMethod);
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      culturalContext,
      participants,
      amounts,
      regionalVariations
    );
    
    const processingTime = Date.now() - startTime;

    return {
      originalText: text,
      normalizedText,
      participants,
      amounts,
      currency: 'BRL',
      totalAmount,
      splittingMethod,
      culturalContext,
      confidence,
      suggestions,
      regionalVariations,
      processingTime
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
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract participants from text
   */
  private extractParticipants(text: string, context: BrazilianCulturalContext): Participant[] {
    const participants: Participant[] = [];
    
    // Simple approach: extract all individual pronouns first
    const individualPronouns = ['eu', 'você', 'voce', 'vc', 'ele', 'ela'];
    const foundPronouns: string[] = [];
    
    for (const pronoun of individualPronouns) {
      const pattern = new RegExp(`\\b${pronoun}\\b`, 'gi');
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const found = match[0].toLowerCase();
        if (!foundPronouns.includes(found)) {
          foundPronouns.push(found);
        }
      }
    }
    
    // Convert found pronouns to standardized names
    for (const pronoun of foundPronouns) {
      const name = this.standardizeParticipantName(pronoun);
      participants.push({
        name,
        type: 'person',
        count: 1,
        confidence: 0.9,
        context: 'extracted from individual pronouns'
      });
    }
    
    // If we found 3 or more individual pronouns, return them
    if (participants.length >= 3) {
      return participants;
    }
    
    // Enhanced group detection - check this BEFORE individual pronouns
    const groupPronounPatterns = [
      /\b(nós|nos|vocês|voces|eles|elas)\b/gi,  // Group pronouns
      /\b(vós|vos)\b/gi  // Formal group pronouns
    ];

    for (const pattern of groupPronounPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const pronoun = match[1] || match[0];
        const name = this.standardizeParticipantName(pronoun);
        
        // Skip if already added
        if (!participants.some(p => p.name === name)) {
          participants.push({
            name,
            type: 'group',
            count: 1,
            confidence: 0.9,
            context: 'extracted from group pronoun pattern'
          });
        }
      }
    }

    // Enhanced group detection
    const groupPatterns = [
      /\b(galera|molecada|rapaziada|meninada|família|familia|amigos|grupo|turma|pessoal)\b/gi,
      /\b(pais|mães|maes|filhos|filhas|primos|primas|tios|tias)\b/gi
    ];

    for (const pattern of groupPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const groupName = match[1] || match[0];
        const name = this.standardizeParticipantName(groupName);
        
        if (!participants.some(p => p.name === name)) {
          participants.push({
            name,
            type: groupName.toLowerCase().includes('família') || groupName.toLowerCase().includes('familia') ? 'family' : 'group',
            count: 1,
            confidence: 0.8,
            context: 'extracted from group pattern'
          });
        }
      }
    }

    // Enhanced number-based participant detection
    const numberPatterns = [
      /(\d+)\s*(pessoas?|gente|pessoal)/gi,
      /para\s*(\d+)\s*(pessoas?|gente|pessoal)/gi,
      /(\d+)\s*(amigos?|familiares?|primos?|primas?)/gi
    ];

    for (const pattern of numberPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const count = parseInt(match[1]);
        const type = match[2]?.toLowerCase().includes('família') || match[2]?.toLowerCase().includes('familia') ? 'family' : 'group';
        
        if (count > 0 && count <= 20) { // Reasonable range
          participants.push({
            name: `${count} ${match[2] || 'pessoas'}`,
            type,
            count,
            confidence: 0.9,
            context: 'extracted from number pattern'
          });
        }
      }
    }

    // Fallback: if no explicit participants found, add implied ones
    if (participants.length === 0) {
      if (text.includes('dividir') || text.includes('pagar') || text.includes('rascar') || text.includes('conta')) {
        participants.push({
          name: 'Grupo',
          type: 'group',
          count: 1,
          confidence: 0.5,
          context: 'implied from context'
        });
      }
    }

    return this.mergeSimilarParticipants(participants);
  }

  /**
   * Extract amounts from text
   */
  private extractAmounts(text: string, context: BrazilianCulturalContext): Amount[] {
    const amounts: Amount[] = [];
    
    // Extract currency amounts with improved patterns - prioritize currency patterns
    const currencyPatterns = [
      // R$ patterns (highest priority) - handle both comma and dot decimals
      /R\$\s*(\d+[.,]\d{2})/g,
      /R\$\s*(\d+)/g,
      // Reais patterns (high priority) - handle both comma and dot decimals
      /(\d+[.,]\d{2})\s*reais?/g,
      /(\d+)\s*reais?/g,
      /reais?\s*(\d+[.,]\d{2})/g,
      /reais?\s*(\d+)/g,
      // Additional patterns for better coverage
      /(\d+[.,]\d{2})\s*R\$/g,
      /(\d+)\s*R\$/g,
      /total\s*(?:de\s*)?R\$\s*(\d+[.,]?\d*)/gi,
      /total\s*(?:de\s*)?(\d+[.,]?\d*)\s*reais?/gi,
      // Tax and service patterns
      /taxa\s*(?:de\s*)?(?:serviço|servico)\s*R\$\s*(\d+[.,]?\d*)/gi,
      /taxa\s*(?:de\s*)?(?:serviço|servico)\s*(\d+[.,]?\d*)\s*reais?/gi,
      // Number word patterns (medium priority)
      /(\d+)\s*(pila|pilas|conto|contos)/g,
      /(pila|pilas|conto|contos)\s*(\d+)/g,
    ];

    // Process each pattern
    for (const pattern of currencyPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const value = this.parseAmount(match[1]);
        if (value > 0 && value < 10000) { // Reasonable range
          amounts.push({
            value,
            currency: 'BRL',
            description: this.extractAmountDescription(text, match[0]),
            type: this.determineAmountType(match[0], text, context),
            confidence: this.calculateAmountConfidence(match[0], context)
          });
        }
      }
    }

    // Extract discount percentages specifically
    const discountPatterns = [
      /desconto\s*(?:de\s*)?(\d+)\s*%/gi,
      /(\d+)\s*%\s*(?:de\s*)?desconto/gi,
      /promoção\s*(?:de\s*)?(\d+)\s*%/gi,
      /(\d+)\s*%\s*(?:de\s*)?promoção/gi,
    ];

    for (const pattern of discountPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const value = this.parseAmount(match[1]);
        if (value > 0 && value <= 100) { // Valid percentage range
          amounts.push({
            value: -value, // Negative value to indicate discount
            currency: 'BRL',
            description: `Desconto de ${value}%`,
            type: 'discount',
            confidence: 0.9
          });
        }
      }
    }

    // Extract number word amounts
    const numberWordAmounts = this.extractNumberWordAmounts(text, context);
    amounts.push(...numberWordAmounts);

    // If no amounts found, try to extract any number that might be an amount
    if (amounts.length === 0) {
      const fallbackPatterns = [
        /(\d+[.,]?\d*)\s*(?:reais?|R\$|pila|pilas|conto|contos)/gi,
        /(?:reais?|R\$|pila|pilas|conto|contos)\s*(\d+[.,]?\d*)/gi,
      ];
      for (const pattern of fallbackPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const value = this.parseAmount(match[1]);
          if (value > 0 && value < 10000) {
            amounts.push({
              value,
              currency: 'BRL',
              description: 'Detected from context',
              type: 'total',
              confidence: 0.6
            });
          }
        }
      }
    }

    return this.removeDuplicateAmounts(amounts);
  }

  /**
   * Extract amounts from number words
   */
  private extractNumberWordAmounts(text: string, context: BrazilianCulturalContext): Amount[] {
    const amounts: Amount[] = [];
    
    // Number word mappings
    const numberWords: Record<string, number> = {
      'cem': 100, 'cento': 100, 'duzentos': 200, 'trezentos': 300,
      'quatrocentos': 400, 'quinhentos': 500, 'seiscentos': 600,
      'setecentos': 700, 'oitocentos': 800, 'novecentos': 900,
      'mil': 1000, 'dois mil': 2000, 'três mil': 3000, 'tres mil': 3000
    };

    // Look for number word patterns
    const numberWordPatterns = [
      /(cem|cento|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos)\s*reais?/g,
      /(mil|dois mil|três mil|tres mil)\s*reais?/g,
      /reais?\s*(cem|cento|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos)/g,
      /reais?\s*(mil|dois mil|três mil|tres mil)/g
    ];

    for (const pattern of numberWordPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const word = match[1] || match[2];
        const value = numberWords[word.toLowerCase()];
        if (value && value > 0) {
          amounts.push({
            value,
            currency: 'BRL',
            description: this.extractAmountDescription(text, match[0]),
            type: this.determineAmountType(match[0], text, context),
            confidence: 0.8
          });
        }
      }
    }

    return amounts;
  }

  /**
   * Remove duplicate amounts
   */
  private removeDuplicateAmounts(amounts: Amount[]): Amount[] {
    const unique: Amount[] = [];
    const seen = new Set<number>();

    for (const amount of amounts) {
      if (!seen.has(amount.value)) {
        seen.add(amount.value);
        unique.push(amount);
      }
    }

    return unique.sort((a, b) => b.value - a.value);
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // Handle Brazilian comma decimal format
    let normalized = amountStr.trim();
    
    // Replace comma with dot for decimal parsing
    if (normalized.includes(',')) {
      // If there's a comma, it's likely a decimal separator
      normalized = normalized.replace(',', '.');
    }
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Determine splitting method from text and context
   */
  private determineSplittingMethod(text: string, context: BrazilianCulturalContext): SplittingMethod {
    const normalizedText = text.toLowerCase();
    
    const splittingPatterns = {
      vaquinha: [
        'vaquinha', 'coleta', 'contribuição', 'contribuicao',
        'cada um contribui', 'contribui igual', 'fazer vaquinha',
        'contribuição', 'contribuicao', 'contribui'
      ],
      complex: [
        'complexo', 'diferente', 'diferentes', 'especial', 'especiais',
        'cada um paga diferente', 'divide diferente', 'acertamos depois',
        'depois acertamos', 'paga diferente', 'diferente', 'acertamos',
        'depois acertamos', 'especial', 'especiais'
      ],
      by_consumption: [
        'consumo', 'consumiu', 'consumiram', 'cada um paga o que consumiu',
        'paga o que consumiu', 'divide por consumo', 'divide pelo consumo',
        'por consumo', 'por consumido', 'cada um paga o que consumiu',
        'paga o que consumiu', 'consumiu', 'consumido'
      ],
      host_pays: [
        'eu pago', 'eu pago de', 'eu pago para', 'eu pago com',
        'anfitrião paga', 'anfitriao paga', 'host paga', 'eu pago agora',
        'eu pago', 'pago agora', 'pago de', 'pago para', 'pago com'
      ],
      by_family: [
        'família', 'familia', 'familiar', 'familiares',
        'divide por família', 'divide por familia', 'por família', 'por familia',
        'divide por família', 'por família'
      ],
      equal: [
        'igual', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'cada um igual',
        'divide igual', 'divide por igual', 'paga igual', 'paga por igual',
        'cada um paga uma rodada', 'rodada', 'rodadas', 'divide igualmente',
        'paga igualmente', 'cada um igual', 'todos igual', 'cada um paga uma rodada'
      ]
    };

    // Check for vaquinha scenarios FIRST (before equal to avoid conflicts)
    for (const pattern of splittingPatterns.vaquinha) {
      if (normalizedText.includes(pattern)) {
        return 'vaquinha';
      }
    }

    // Check for host_pays scenarios BEFORE complex (to avoid "depois acertamos" overriding "eu pago")
    for (const pattern of splittingPatterns.host_pays) {
      if (normalizedText.includes(pattern)) {
        // Additional check: if it's "pago" but in context of "cada um paga", it's not host_pays
        if (pattern.includes('pago') && normalizedText.includes('cada um paga')) {
          continue; // Skip this match, it's likely equal split
        }
        return 'host_pays';
      }
    }

    // Check for complex scenarios (they might contain other keywords)
    for (const pattern of splittingPatterns.complex) {
      if (normalizedText.includes(pattern)) {
        return 'complex';
      }
    }

    // Check for by_consumption scenarios (they might be confused with equal)
    for (const pattern of splittingPatterns.by_consumption) {
      if (normalizedText.includes(pattern)) {
        return 'by_consumption';
      }
    }

    // Check for by_family scenarios
    for (const pattern of splittingPatterns.by_family) {
      if (normalizedText.includes(pattern)) {
        return 'by_family';
      }
    }

    // Check for equal scenarios LAST (default)
    for (const pattern of splittingPatterns.equal) {
      if (normalizedText.includes(pattern)) {
        return 'equal';
      }
    }

    // Context-based fallback
    if (context.scenario === 'rodizio') {
      return 'equal';
    } else if (context.scenario === 'happy_hour') {
      return 'by_consumption';
    } else if (context.scenario === 'aniversario') {
      return 'host_pays';
    } else if (context.scenario === 'vaquinha') {
      return 'vaquinha';
    } else if (context.scenario === 'churrasco') {
      return 'by_family';
    }

    // Default to equal split
    return 'equal';
  }

  /**
   * Calculate total amount from all amounts
   */
  private calculateTotalAmount(amounts: Amount[]): number {
    if (amounts.length === 0) return 0;
    
    // First try to get total amounts
    const totalAmounts = amounts.filter(amount => amount.type === 'total');
    if (totalAmounts.length > 0) {
      return totalAmounts.reduce((sum, amount) => sum + amount.value, 0);
    }
    
    // If no total amounts, use the highest value amount
    const highestAmount = amounts.reduce((max, amount) => 
      amount.value > max.value ? amount : max, amounts[0]);
    
    return highestAmount ? highestAmount.value : 0;
  }

  /**
   * Detect regional variations in text
   */
  private detectRegionalVariations(text: string, region?: string): RegionalVariation[] {
    const variations: RegionalVariation[] = [];
    
    // Check all regions for variations, not just the specific region
    for (const [regionKey, regionalExpressions] of Object.entries(this.regionalExpressions)) {
      for (const [regionalTerm, standardTerm] of Object.entries(regionalExpressions)) {
        if (text.toLowerCase().includes(regionalTerm.toLowerCase())) {
          variations.push({
            region: regionKey,
            originalTerm: regionalTerm,
            standardTerm,
            confidence: 0.8
          });
        }
      }
    }

    return variations;
  }

  /**
   * Generate suggestions based on context and extracted data
   */
  private generateSuggestions(
    context: BrazilianCulturalContext,
    participants: Participant[],
    amounts: Amount[],
    splittingMethod: SplittingMethod
  ): string[] {
    const suggestions: string[] = [];

    // Cultural context suggestions
    suggestions.push(...this.culturalAnalyzer.getCulturalSuggestions(context));

    // Participant suggestions
    if (participants.length === 0) {
      suggestions.push('👥 Não consegui identificar os participantes. Pode especificar quem está dividindo?');
    }

    // Amount suggestions
    if (amounts.length === 0) {
      suggestions.push('💰 Não consegui identificar o valor. Pode mencionar quanto custou?');
    }

    // Splitting method suggestions
    switch (splittingMethod) {
      case 'equal':
        suggestions.push('✅ Vou dividir igualmente entre todos');
        break;
      case 'by_consumption':
        suggestions.push('🍽️ Vou dividir por consumo individual');
        break;
      case 'host_pays':
        suggestions.push('🎉 O anfitrião vai pagar, depois acertamos');
        break;
      case 'vaquinha':
        suggestions.push('💰 Vou fazer uma vaquinha entre todos');
        break;
      case 'by_family':
        suggestions.push('👨‍👩‍👧‍👦 Vou dividir por família');
        break;
      case 'complex':
        suggestions.push('🔄 Vou analisar a divisão complexa');
        break;
    }

    return suggestions;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    context: BrazilianCulturalContext,
    participants: Participant[],
    amounts: Amount[],
    regionalVariations: RegionalVariation[]
  ): number {
    let confidence = Math.max(context.confidence, 0.6); // Boost minimum confidence

    // Participant confidence
    if (participants.length > 0) {
      const avgParticipantConfidence = participants.reduce((sum, p) => sum + p.confidence, 0) / participants.length;
      confidence = (confidence + avgParticipantConfidence) / 2;
    } else {
      confidence *= 0.9; // Reduced penalty for no participants
    }

    // Amount confidence
    if (amounts.length > 0) {
      const avgAmountConfidence = amounts.reduce((sum, a) => sum + a.confidence, 0) / amounts.length;
      confidence = (confidence + avgAmountConfidence) / 2;
    } else {
      confidence *= 0.8; // Reduced penalty for no amounts
    }

    // Regional variation confidence
    if (regionalVariations.length > 0) {
      confidence += 0.15; // Increased boost
    }

    // Additional confidence for cultural context
    if (context.confidence > 0.8) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Standardize participant name
   */
  private standardizeParticipantName(name: string): string {
    const nameMap: Record<string, string> = {
      'eu': 'Você',
      'me': 'Você',
      'mim': 'Você',
      'minha': 'Você',
      'meu': 'Você',
      'você': 'Você',
      'voce': 'Você',
      'vc': 'Você',
      'tu': 'Você',
      'te': 'Você',
      'ti': 'Você',
      'seu': 'Você',
      'sua': 'Você',
      'nós': 'Nós',
      'nos': 'Nós',
      'nosso': 'Nós',
      'nossa': 'Nós',
      'nossos': 'Nós',
      'nossas': 'Nós',
      'vocês': 'Vocês',
      'voces': 'Vocês',
      'vcs': 'Vocês',
      'vos': 'Vocês',
      'vosso': 'Vocês',
      'vossa': 'Vocês',
      'vossos': 'Vocês',
      'vossas': 'Vocês',
      'ele': 'Ele',
      'ela': 'Ela',
      'eles': 'Eles',
      'elas': 'Elas',
      'dele': 'Ele',
      'dela': 'Ela',
      'deles': 'Eles',
      'delas': 'Elas',
      'família': 'Família',
      'familia': 'Família',
      'familiar': 'Família',
      'familiares': 'Família',
      'pais': 'Pais',
      'pai': 'Pai',
      'mae': 'Mãe',
      'mãe': 'Mãe',
      'irmãos': 'Irmãos',
      'irmaos': 'Irmãos',
      'irmão': 'Irmão',
      'irmao': 'Irmão',
      'irmã': 'Irmã',
      'irma': 'Irmã',
      'casal': 'Casal',
      'namorado': 'Namorado',
      'namorada': 'Namorada',
      'marido': 'Marido',
      'esposa': 'Esposa',
      'parceiro': 'Parceiro',
      'parceira': 'Parceira'
    };

    return nameMap[name.toLowerCase()] || name;
  }

  /**
   * Extract number from text
   */
  private extractNumberFromText(text: string): number | null {
    const numberMatch = text.match(/\d+/);
    return numberMatch ? parseInt(numberMatch[0]) : null;
  }

  /**
   * Calculate participant confidence
   */
  private calculateParticipantConfidence(match: string, context: BrazilianCulturalContext): number {
    let confidence = 0.7; // Base confidence

    // Context-specific confidence adjustments
    if (context.groupType === 'familia' && match.includes('família')) {
      confidence += 0.2;
    }

    if (context.groupType === 'amigos' && (match.includes('galera') || match.includes('turma'))) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Merge similar participants
   */
  private mergeSimilarParticipants(participants: Participant[]): Participant[] {
    const merged: Participant[] = [];
    const seen = new Set<string>();

    for (const participant of participants) {
      const key = participant.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(participant);
      }
    }

    return merged;
  }

  /**
   * Extract amount description from context
   */
  private extractAmountDescription(text: string, amountMatch: string): string {
    const words = text.split(' ');
    const amountIndex = words.findIndex(word => word.includes(amountMatch));
    
    if (amountIndex === -1) return 'Valor';
    
    // Get surrounding words for context
    const start = Math.max(0, amountIndex - 3);
    const end = Math.min(words.length, amountIndex + 4);
    const contextWords = words.slice(start, end);
    
    return contextWords.join(' ').replace(amountMatch, '').trim() || 'Valor';
  }

  /**
   * Determine amount type
   */
  private determineAmountType(amountMatch: string, text: string, context: BrazilianCulturalContext): Amount['type'] {
    const textLower = text.toLowerCase();
    const amountMatchLower = amountMatch.toLowerCase();
    
    // Check the amount match itself
    if (amountMatchLower.includes('desconto') || amountMatchLower.includes('promoção') || amountMatchLower.includes('promocao')) {
      return 'discount';
    }
    
    if (amountMatchLower.includes('taxa') || amountMatchLower.includes('serviço') || amountMatchLower.includes('servico')) {
      return 'tax';
    }
    
    if (amountMatchLower.includes('gorjeta') || amountMatchLower.includes('caixinha')) {
      return 'tip';
    }
    
    if (amountMatchLower.includes('por pessoa') || amountMatchLower.includes('por pessoa')) {
      return 'per_person';
    }
    
    if (amountMatchLower.includes('por família') || amountMatchLower.includes('por familia')) {
      return 'per_group';
    }
    
    // Check the full text context for discount indicators
    if (textLower.includes('desconto') || textLower.includes('promoção') || textLower.includes('promocao') || 
        textLower.includes('menos') || textLower.includes('abatimento') || textLower.includes('%')) {
      return 'discount';
    }
    
    return 'total';
  }

  /**
   * Calculate amount confidence
   */
  private calculateAmountConfidence(amountMatch: string, context: BrazilianCulturalContext): number {
    let confidence = 0.8; // Base confidence

    // Currency symbol confidence
    if (amountMatch.includes('R$')) {
      confidence += 0.1;
    }

    // Decimal precision confidence
    if (amountMatch.includes(',')) {
      confidence += 0.1;
    }

    // Context confidence
    if (context.scenario === 'restaurante' && parseFloat(amountMatch.replace(/[^\d,]/g, '').replace(',', '.')) > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}

// Export validation schema
export const BrazilianNLPResultSchema = z.object({
  originalText: z.string(),
  normalizedText: z.string(),
  participants: z.array(z.object({
    name: z.string(),
    type: z.enum(['person', 'group', 'family', 'couple']),
    count: z.number(),
    confidence: z.number().min(0).max(1),
    context: z.string()
  })),
  amounts: z.array(z.object({
    value: z.number(),
    currency: z.string(),
    description: z.string(),
    type: z.enum(['total', 'per_person', 'per_group', 'discount', 'tax', 'tip']),
    confidence: z.number().min(0).max(1)
  })),
  currency: z.string(),
  totalAmount: z.number(),
  splittingMethod: z.enum(['equal', 'by_consumption', 'host_pays', 'vaquinha', 'by_family', 'complex']),
  culturalContext: z.any(), // BrazilianCulturalContextSchema
  confidence: z.number().min(0).max(1),
  suggestions: z.array(z.string()),
  regionalVariations: z.array(z.object({
    region: z.string(),
    originalTerm: z.string(),
    standardTerm: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  processingTime: z.number()
}); 