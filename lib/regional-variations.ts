import { z } from 'zod';

// Brazilian Regional Types
export type BrazilianRegion = 
  | 'sao_paulo' 
  | 'rio_de_janeiro' 
  | 'minas_gerais' 
  | 'bahia' 
  | 'pernambuco' 
  | 'parana' 
  | 'rio_grande_sul' 
  | 'outros';

export interface RegionalVariation {
  region: BrazilianRegion;
  originalTerm: string;
  standardTerm: string;
  confidence: number;
  context: string;
}

export interface RegionalExpression {
  term: string;
  standardTerm: string;
  meaning: string;
  formality: 'formal' | 'informal' | 'slang';
  usage: string;
  examples: string[];
}

// Regional Portuguese Variations Database
export const REGIONAL_VARIATIONS_DB: Record<BrazilianRegion, Record<string, RegionalExpression>> = {
  sao_paulo: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'rodízio': {
      term: 'rodízio',
      standardTerm: 'rodízio',
      meaning: 'All-you-can-eat service',
      formality: 'formal',
      usage: 'Restaurant service where each person pays a round',
      examples: ['Pizza rodízio', 'Churrasco rodízio', 'Cada um paga uma rodada']
    }
  },

  rio_de_janeiro: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'molecada': {
      term: 'molecada',
      standardTerm: 'pessoal',
      meaning: 'Group of young people',
      formality: 'informal',
      usage: 'Refers to a group of young people',
      examples: ['A molecada toda', 'A molecada vai', 'Com a molecada']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar a vez': {
      term: 'pagar a vez',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga a vez', 'Vou pagar a vez', 'Pagar a vez']
    }
  },

  minas_gerais: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'rapaziada': {
      term: 'rapaziada',
      standardTerm: 'pessoal',
      meaning: 'Group of people, especially men',
      formality: 'informal',
      usage: 'Refers to a group of people, often men',
      examples: ['A rapaziada toda', 'A rapaziada vai', 'Com a rapaziada']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar a rodada': {
      term: 'pagar a rodada',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga a rodada', 'Vou pagar a rodada', 'Pagar a rodada']
    }
  },

  bahia: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'meninada': {
      term: 'meninada',
      standardTerm: 'pessoal',
      meaning: 'Group of young people',
      formality: 'informal',
      usage: 'Refers to a group of young people',
      examples: ['A meninada toda', 'A meninada vai', 'Com a meninada']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar a vez': {
      term: 'pagar a vez',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga a vez', 'Vou pagar a vez', 'Pagar a vez']
    }
  },

  pernambuco: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'rapaziada': {
      term: 'rapaziada',
      standardTerm: 'pessoal',
      meaning: 'Group of people, especially men',
      formality: 'informal',
      usage: 'Refers to a group of people, often men',
      examples: ['A rapaziada toda', 'A rapaziada vai', 'Com a rapaziada']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar a rodada': {
      term: 'pagar a rodada',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga a rodada', 'Vou pagar a rodada', 'Pagar a rodada']
    }
  },

  parana: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar a vez': {
      term: 'pagar a vez',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga a vez', 'Vou pagar a vez', 'Pagar a vez']
    }
  },

  rio_grande_sul: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar a rodada': {
      term: 'pagar a rodada',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga a rodada', 'Vou pagar a rodada', 'Pagar a rodada']
    }
  },

  outros: {
    // Money-related
    'pila': {
      term: 'pila',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de pila', 'Tenho pila', 'Sem pila']
    },
    'grana': {
      term: 'grana',
      standardTerm: 'dinheiro',
      meaning: 'Money, cash',
      formality: 'slang',
      usage: 'Informal way to refer to money',
      examples: ['Preciso de grana', 'Tenho grana', 'Sem grana']
    },
    'galera': {
      term: 'galera',
      standardTerm: 'pessoal',
      meaning: 'Group of people, crowd',
      formality: 'informal',
      usage: 'Refers to a group of people',
      examples: ['A galera toda', 'A galera vai', 'Com a galera']
    },
    'rascar': {
      term: 'rascar',
      standardTerm: 'dividir',
      meaning: 'To split, to divide',
      formality: 'slang',
      usage: 'Informal way to say divide',
      examples: ['Vamos rascar a conta', 'Rasca aí', 'Rascando a conta']
    },
    'pagar rodada': {
      term: 'pagar rodada',
      standardTerm: 'pagar rodada',
      meaning: 'To pay for a round',
      formality: 'informal',
      usage: 'Each person pays for one round',
      examples: ['Cada um paga rodada', 'Vou pagar rodada', 'Pagar rodada']
    }
  }
};

// Regional Portuguese Variation Processor
export class RegionalVariationProcessor {
  private variationsDB = REGIONAL_VARIATIONS_DB;

  /**
   * Detect regional variations in text
   */
  detectRegionalVariations(text: string, userRegion?: BrazilianRegion): RegionalVariation[] {
    const variations: RegionalVariation[] = [];
    const normalizedText = this.normalizeText(text);
    
    // If user region is provided, check that region first
    const regionsToCheck = userRegion 
      ? [userRegion, ...this.getOtherRegions(userRegion)]
      : Object.keys(this.variationsDB) as BrazilianRegion[];

    for (const region of regionsToCheck) {
      const regionalExpressions = this.variationsDB[region];
      
      for (const [term, expression] of Object.entries(regionalExpressions)) {
        if (normalizedText.includes(term.toLowerCase())) {
          variations.push({
            region: region as BrazilianRegion,
            originalTerm: term,
            standardTerm: expression.standardTerm,
            confidence: this.calculateVariationConfidence(term, region, userRegion),
            context: expression.meaning
          });
        }
      }
    }

    return this.removeDuplicateVariations(variations);
  }

  /**
   * Standardize text by replacing regional variations
   */
  standardizeText(text: string, userRegion?: BrazilianRegion): string {
    let standardizedText = text;
    const variations = this.detectRegionalVariations(text, userRegion);

    for (const variation of variations) {
      const regex = new RegExp(`\\b${variation.originalTerm}\\b`, 'gi');
      standardizedText = standardizedText.replace(regex, variation.standardTerm);
    }

    return standardizedText;
  }

  /**
   * Get regional context for a specific region
   */
  getRegionalContext(region: BrazilianRegion): {
    formalityLevel: 'formal' | 'informal' | 'slang';
    commonExpressions: string[];
    culturalNotes: string[];
  } {
    const regionalExpressions = this.variationsDB[region];
    const expressions = Object.values(regionalExpressions);
    
    const formalityLevel = this.determineRegionalFormality(expressions);
    const commonExpressions = expressions.map(exp => exp.term);
    const culturalNotes = this.getCulturalNotes(region);

    return {
      formalityLevel,
      commonExpressions,
      culturalNotes
    };
  }

  /**
   * Get suggestions for regional variations
   */
  getRegionalSuggestions(variations: RegionalVariation[]): string[] {
    const suggestions: string[] = [];

    for (const variation of variations) {
      const expression = this.variationsDB[variation.region]?.[variation.originalTerm];
      if (expression) {
        suggestions.push(`📍 ${variation.region.replace('_', ' ')}: "${variation.originalTerm}" = "${expression.standardTerm}" (${expression.meaning})`);
      }
    }

    return suggestions;
  }

  /**
   * Calculate confidence for regional variation detection
   */
  private calculateVariationConfidence(
    term: string, 
    detectedRegion: BrazilianRegion, 
    userRegion?: BrazilianRegion
  ): number {
    let confidence = 0.7; // Base confidence

    // Boost confidence if user region matches detected region
    if (userRegion && userRegion === detectedRegion) {
      confidence += 0.2;
    }

    // Boost confidence for common terms
    if (['pila', 'grana', 'galera', 'rascar'].includes(term)) {
      confidence += 0.1;
    }

    // Penalty for very common terms across regions
    if (this.isCommonAcrossRegions(term)) {
      confidence -= 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Check if term is common across multiple regions
   */
  private isCommonAcrossRegions(term: string): boolean {
    let regionCount = 0;
    
    for (const region of Object.keys(this.variationsDB)) {
      if (this.variationsDB[region as BrazilianRegion][term]) {
        regionCount++;
      }
    }

    return regionCount > 3; // If term appears in more than 3 regions, it's common
  }

  /**
   * Get other regions excluding the specified one
   */
  private getOtherRegions(excludeRegion: BrazilianRegion): BrazilianRegion[] {
    return Object.keys(this.variationsDB)
      .filter(region => region !== excludeRegion)
      .map(region => region as BrazilianRegion);
  }

  /**
   * Remove duplicate variations
   */
  private removeDuplicateVariations(variations: RegionalVariation[]): RegionalVariation[] {
    const unique: RegionalVariation[] = [];
    const seen = new Set<string>();

    for (const variation of variations) {
      const key = `${variation.originalTerm}-${variation.standardTerm}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(variation);
      }
    }

    return unique;
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
   * Determine regional formality level
   */
  private determineRegionalFormality(expressions: RegionalExpression[]): 'formal' | 'informal' | 'slang' {
    const formalityCounts = {
      formal: 0,
      informal: 0,
      slang: 0
    };

    for (const expression of expressions) {
      formalityCounts[expression.formality]++;
    }

    if (formalityCounts.slang > formalityCounts.informal && formalityCounts.slang > formalityCounts.formal) {
      return 'slang';
    } else if (formalityCounts.informal > formalityCounts.formal) {
      return 'informal';
    } else {
      return 'formal';
    }
  }

  /**
   * Get cultural notes for a region
   */
  private getCulturalNotes(region: BrazilianRegion): string[] {
    const culturalNotes: Record<BrazilianRegion, string[]> = {
      sao_paulo: [
        'São Paulo tends to be more formal in business contexts',
        'Uses more standard Portuguese terms',
        'Prefers direct communication style'
      ],
      rio_de_janeiro: [
        'Rio de Janeiro is more casual and friendly',
        'Uses more informal expressions',
        'Prefers relaxed communication style'
      ],
      minas_gerais: [
        'Minas Gerais is known for hospitality',
        'Uses traditional Portuguese expressions',
        'Prefers warm and welcoming communication'
      ],
      bahia: [
        'Bahia is known for its cultural diversity',
        'Uses African-influenced Portuguese',
        'Prefers expressive and colorful communication'
      ],
      pernambuco: [
        'Pernambuco has strong cultural traditions',
        'Uses traditional Northeastern expressions',
        'Prefers warm and community-oriented communication'
      ],
      parana: [
        'Paraná has European immigrant influences',
        'Uses more formal expressions',
        'Prefers precise and organized communication'
      ],
      rio_grande_sul: [
        'Rio Grande do Sul has strong regional identity',
        'Uses traditional Southern expressions',
        'Prefers direct and honest communication'
      ],
      outros: [
        'General Brazilian Portuguese patterns',
        'Uses standard Portuguese expressions',
        'Prefers clear and direct communication'
      ]
    };

    return culturalNotes[region] || culturalNotes.outros;
  }

  /**
   * Get all available regions
   */
  getAllRegions(): BrazilianRegion[] {
    return Object.keys(this.variationsDB) as BrazilianRegion[];
  }

  /**
   * Get expressions for a specific region
   */
  getRegionalExpressions(region: BrazilianRegion): RegionalExpression[] {
    const expressions = this.variationsDB[region];
    return Object.values(expressions);
  }

  /**
   * Search expressions across all regions
   */
  searchExpressions(searchTerm: string): Array<{ region: BrazilianRegion; expression: RegionalExpression }> {
    const results: Array<{ region: BrazilianRegion; expression: RegionalExpression }> = [];

    for (const [region, expressions] of Object.entries(this.variationsDB)) {
      for (const [term, expression] of Object.entries(expressions)) {
        if (term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expression.meaning.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            region: region as BrazilianRegion,
            expression
          });
        }
      }
    }

    return results;
  }
}

// Export validation schema
export const RegionalVariationSchema = z.object({
  region: z.enum(['sao_paulo', 'rio_de_janeiro', 'minas_gerais', 'bahia', 'pernambuco', 'parana', 'rio_grande_sul', 'outros']),
  originalTerm: z.string(),
  standardTerm: z.string(),
  confidence: z.number().min(0).max(1),
  context: z.string()
});

export const RegionalExpressionSchema = z.object({
  term: z.string(),
  standardTerm: z.string(),
  meaning: z.string(),
  formality: z.enum(['formal', 'informal', 'slang']),
  usage: z.string(),
  examples: z.array(z.string())
}); 