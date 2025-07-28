import { AdvancedPortugueseNLPProcessor } from '../lib/advanced-portuguese-nlp';

describe('Advanced Portuguese NLP Processor', () => {
  let processor: AdvancedPortugueseNLPProcessor;

  beforeEach(() => {
    processor = new AdvancedPortugueseNLPProcessor();
  });

  describe('Regional Dialect Detection', () => {
    test('should detect São Paulo dialect', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.detectedDialects).toHaveLength(1);
      expect(result.detectedDialects[0].region).toBe('sao_paulo');
      expect(result.detectedDialects[0].confidence).toBeGreaterThan(0.7);
      expect(result.detectedDialects[0].dialectFeatures).toHaveLength(2); // cara, tipo
    });

    test('should detect Rio de Janeiro dialect', async () => {
      const text = 'Molecada, beleza? Aquele churrasco foi da hora!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_de_janeiro');

      expect(result.detectedDialects).toHaveLength(1);
      expect(result.detectedDialects[0].region).toBe('rio_de_janeiro');
      expect(result.detectedDialects[0].confidence).toBeGreaterThan(0.8);
      expect(result.detectedDialects[0].dialectFeatures).toHaveLength(2); // molecada, beleza
    });

    test('should detect Minas Gerais dialect', async () => {
      const text = 'Rapaziada, vamos fazer uma vaquinha para o aniversário da família?';
      const result = await processor.processAdvancedPortuguese(text, 'minas_gerais');

      expect(result.detectedDialects).toHaveLength(1);
      expect(result.detectedDialects[0].region).toBe('minas_gerais');
      expect(result.detectedDialects[0].confidence).toBeGreaterThan(0.8);
      expect(result.detectedDialects[0].dialectFeatures).toHaveLength(1); // rapaziada
    });

    test('should detect Bahia dialect', async () => {
      const text = 'Meninada, vamos curtir aquele acarajé? Beleza!';
      const result = await processor.processAdvancedPortuguese(text, 'bahia');

      expect(result.detectedDialects).toHaveLength(1);
      expect(result.detectedDialects[0].region).toBe('bahia');
      expect(result.detectedDialects[0].confidence).toBeGreaterThan(0.8);
      expect(result.detectedDialects[0].dialectFeatures).toHaveLength(2); // meninada, beleza
    });

    test('should detect Rio Grande do Sul dialect', async () => {
      const text = 'Bah, tchê! Aquele churrasco foi show de bola!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_grande_sul');

      expect(result.detectedDialects).toHaveLength(1);
      expect(result.detectedDialects[0].region).toBe('rio_grande_sul');
      expect(result.detectedDialects[0].confidence).toBeGreaterThan(0.9);
      expect(result.detectedDialects[0].dialectFeatures).toHaveLength(2); // bah, tchê
    });

    test('should detect multiple dialects in mixed text', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa! Bah, tchê, foi demais!';
      const result = await processor.processAdvancedPortuguese(text, 'outros');

      expect(result.detectedDialects.length).toBeGreaterThan(1);
      const regions = result.detectedDialects.map(d => d.region);
      expect(regions).toContain('sao_paulo');
      expect(regions).toContain('rio_grande_sul');
    });
  });

  describe('Slang Expression Processing', () => {
    test('should detect São Paulo slang expressions', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.slangExpressions.length).toBeGreaterThan(0);
      const expressions = result.slangExpressions.map(s => s.original);
      expect(expressions).toContain('cara');
      expect(expressions).toContain('tipo');
      expect(expressions).toContain('massa');
      expect(expressions).toContain('valeu');
      expect(expressions).toContain('mano');
    });

    test('should detect Rio de Janeiro slang expressions', async () => {
      const text = 'Molecada, beleza? Aquele churrasco foi da hora!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_de_janeiro');

      expect(result.slangExpressions.length).toBeGreaterThan(0);
      const expressions = result.slangExpressions.map(s => s.original);
      expect(expressions).toContain('molecada');
      expect(expressions).toContain('beleza');
      expect(expressions).toContain('da hora');
    });

    test('should detect Minas Gerais slang expressions', async () => {
      const text = 'Rapaziada, vamos fazer uma vaquinha para o aniversário da família?';
      const result = await processor.processAdvancedPortuguese(text, 'minas_gerais');

      expect(result.slangExpressions.length).toBeGreaterThan(0);
      const expressions = result.slangExpressions.map(s => s.original);
      expect(expressions).toContain('rapaziada');
    });

    test('should detect Bahia slang expressions', async () => {
      const text = 'Meninada, vamos curtir aquele acarajé? Beleza!';
      const result = await processor.processAdvancedPortuguese(text, 'bahia');

      expect(result.slangExpressions.length).toBeGreaterThan(0);
      const expressions = result.slangExpressions.map(s => s.original);
      expect(expressions).toContain('meninada');
      expect(expressions).toContain('beleza');
    });

    test('should detect Rio Grande do Sul slang expressions', async () => {
      const text = 'Bah, tchê! Aquele churrasco foi show de bola!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_grande_sul');

      expect(result.slangExpressions.length).toBeGreaterThan(0);
      const expressions = result.slangExpressions.map(s => s.original);
      expect(expressions).toContain('bah');
      expect(expressions).toContain('tche'); // Normalized version
    });
  });

  describe('Context Understanding', () => {
    test('should analyze cultural context', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.contextUnderstanding.confidence).toBeGreaterThan(0.7);
      expect(result.contextUnderstanding.culturalContext.references).toContain('rodízio');
      expect(result.contextUnderstanding.culturalContext.traditions).toContain('cultura gastronômica brasileira');
    });

    test('should analyze social context', async () => {
      const text = 'Rapaziada, vamos fazer uma vaquinha para o aniversário da família?';
      const result = await processor.processAdvancedPortuguese(text, 'minas_gerais');

      expect(result.contextUnderstanding.socialContext.confidence).toBeGreaterThan(0.7);
      expect(result.contextUnderstanding.socialContext.relationships).toContain('familiar');
    });

    test('should analyze regional context', async () => {
      const text = 'Bah, tchê! Aquele churrasco foi show de bola!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_grande_sul');

      expect(result.contextUnderstanding.regionalContext.confidence).toBeGreaterThan(0.8);
      expect(result.contextUnderstanding.regionalContext.localExpressions).toContain('expressões gaúchas');
      expect(result.contextUnderstanding.regionalContext.culturalMarkers).toContain('influência alemã/italiana');
    });

    test('should analyze situational context', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.contextUnderstanding.situationalContext.confidence).toBeGreaterThan(0.7);
      expect(result.contextUnderstanding.situationalContext.scenario).toBe('rodízio');
    });
  });

  describe('Multi-Dialect Support', () => {
    test('should detect cross-dialect understanding', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa! Bah, tchê, foi demais!';
      const result = await processor.processAdvancedPortuguese(text, 'outros');

      expect(result.multiDialectSupport.crossDialectUnderstanding).toBe(true);
      expect(result.multiDialectSupport.confidence).toBeGreaterThan(0.7);
    });

    test('should detect dialect switching', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa! Bah, tchê, foi demais!';
      const result = await processor.processAdvancedPortuguese(text, 'outros');

      expect(result.multiDialectSupport.dialectSwitching.length).toBeGreaterThan(0);
      const switching = result.multiDialectSupport.dialectSwitching[0];
      expect(switching.fromDialect).toBeDefined();
      expect(switching.toDialect).toBeDefined();
      expect(switching.confidence).toBeGreaterThan(0.7);
    });

    test('should handle single dialect', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.multiDialectSupport.crossDialectUnderstanding).toBe(false);
      expect(result.multiDialectSupport.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Regional Authenticity', () => {
    test('should calculate regional authenticity for São Paulo', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.regionalAuthenticity.regionalAccuracy).toBeGreaterThan(0.7);
      expect(result.regionalAuthenticity.culturalSensitivity).toBeGreaterThan(0.7);
      expect(result.regionalAuthenticity.naturalLanguage).toBeGreaterThan(0.7);
      expect(result.regionalAuthenticity.regionalRespect).toBeGreaterThan(0.7);
      expect(result.regionalAuthenticity.overallAuthenticity).toBeGreaterThan(0.7);
    });

    test('should calculate regional authenticity for Rio Grande do Sul', async () => {
      const text = 'Bah, tchê! Aquele churrasco foi show de bola!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_grande_sul');

      expect(result.regionalAuthenticity.regionalAccuracy).toBeGreaterThan(0.8);
      expect(result.regionalAuthenticity.culturalSensitivity).toBeGreaterThan(0.7);
      expect(result.regionalAuthenticity.naturalLanguage).toBeGreaterThan(0.8);
      expect(result.regionalAuthenticity.regionalRespect).toBeGreaterThan(0.8);
      expect(result.regionalAuthenticity.overallAuthenticity).toBeGreaterThan(0.8);
    });
  });

  describe('Overall Confidence', () => {
    test('should calculate high confidence for rich text', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should calculate moderate confidence for simple text', async () => {
      const text = 'Vamos dividir a conta';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('Suggestions Generation', () => {
    test('should generate suggestions for detected dialects', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('dialetos regionais'))).toBe(true);
    });

    test('should generate suggestions for detected slang', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('Expressões regionais'))).toBe(true);
    });

    test('should generate suggestions for high authenticity', async () => {
      const text = 'Bah, tchê! Aquele churrasco foi show de bola!';
      const result = await processor.processAdvancedPortuguese(text, 'rio_grande_sul');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('autenticidade regional'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle empty text gracefully', async () => {
      const text = '';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.originalText).toBe('');
      expect(result.normalizedText).toBe('');
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle text with only whitespace', async () => {
      const text = '   \n\t  ';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.originalText).toBe(text);
      expect(result.normalizedText).toBe('');
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle text with special characters', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano! @#$%^&*()';
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');

      expect(result.originalText).toBe(text);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Performance', () => {
    test('should process text within reasonable time', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano!';
      const startTime = Date.now();
      
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(1000); // Should process within 1 second
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(1000);
    });

    test('should handle long text efficiently', async () => {
      const text = 'Cara, tipo, aquele rodízio foi massa demais! Valeu, mano! '.repeat(100);
      const startTime = Date.now();
      
      const result = await processor.processAdvancedPortuguese(text, 'sao_paulo');
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(2000); // Should process within 2 seconds
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(2000);
    });
  });
}); 