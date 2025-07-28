import { RegionalPortugueseProcessor } from '../lib/regional-portuguese';

describe('Regional Portuguese Integration - Story 7', () => {
  let regionalProcessor: RegionalPortugueseProcessor;

  beforeEach(() => {
    regionalProcessor = new RegionalPortugueseProcessor();
  });

  describe('Regional Portuguese Integration', () => {
    test('should process regional Portuguese with high confidence', async () => {
      const message = 'Cara, vamos dividir a conta do rodízio. Beleza?';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message, 'sao_paulo');
      
      expect(regionalResult.detectedRegion).toBe('sao_paulo');
      expect(regionalResult.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'cara')).toBe(true);
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'beleza')).toBe(true);
      expect(regionalResult.culturalReferences.some(ref => ref.reference === 'rodízio')).toBe(true);
      expect(regionalResult.confidence).toBeGreaterThan(0.6);
    });

    test('should detect Rio de Janeiro regional expressions', async () => {
      const message = 'Molecada, vamos fazer uma vaquinha pro presente. Valeu!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message, 'rio_de_janeiro');

      expect(regionalResult.detectedRegion).toBe('rio_de_janeiro');
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'molecada')).toBe(true);
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'valeu')).toBe(true);
      expect(regionalResult.culturalReferences.some(ref => ref.reference === 'vaquinha')).toBe(true);
      expect(regionalResult.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Rio Grande do Sul regional expressions', async () => {
      const message = 'Bah tchê, vamos fazer um churrasco. Top demais!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message, 'rio_grande_sul');

      expect(regionalResult.detectedRegion).toBe('rio_grande_sul');
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'bah')).toBe(true);
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'tchê' || exp.original === 'tche')).toBe(true);
      expect(regionalResult.culturalReferences.some(ref => ref.reference === 'churrasco')).toBe(true);
      expect(regionalResult.confidence).toBeGreaterThan(0.8);
    });

    test('should detect code-switching between Portuguese and English', async () => {
      const message = 'Vamos fazer um happy hour. Cool!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.codeSwitching.length).toBeGreaterThanOrEqual(1);
      expect(regionalResult.codeSwitching.some(cs => cs.englishPart === 'happy')).toBe(true);
      expect(regionalResult.codeSwitching.some(cs => cs.englishPart === 'cool')).toBe(true);
    });

    test('should detect cultural references accurately', async () => {
      const message = 'Rodízio de pizza, churrasco, feijoada. Tudo massa!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(regionalResult.culturalReferences.some(ref => ref.reference === 'rodízio')).toBe(true);
      expect(regionalResult.culturalReferences.some(ref => ref.reference === 'churrasco')).toBe(true);
      expect(regionalResult.culturalReferences.some(ref => ref.reference === 'feijoada')).toBe(true);
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'massa')).toBe(true);
    });

    test('should provide regional suggestions', async () => {
      const message = 'Cara, vamos no rodízio. Tipo, cada um paga igual.';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message, 'sao_paulo');

      expect(regionalResult.suggestions.length).toBeGreaterThan(0);
      expect(regionalResult.suggestions.some(suggestion => 
        suggestion.includes('São Paulo') || suggestion.includes('expressões regionais')
      )).toBe(true);
    });

    test('should handle mixed regional expressions', async () => {
      const message = 'Molecada, vamos curtir o rolê. Top demais!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.regionalExpressions.length).toBeGreaterThan(0);
      expect(regionalResult.confidence).toBeGreaterThan(0.6);
      expect(regionalResult.suggestions.length).toBeGreaterThan(0);
    });

    test('should maintain cultural sensitivity', async () => {
      const message = 'Vamos respeitar a cultura local. Beleza?';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.regionalExpressions.length).toBeGreaterThanOrEqual(1);
      expect(regionalResult.regionalExpressions.some(exp => exp.original === 'beleza')).toBe(true);
      expect(regionalResult.confidence).toBeGreaterThan(0.6);
    });

    test('should process natural Brazilian conversation', async () => {
      const message = 'Cara, vamos fazer um rodízio. Beleza? Valeu!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(regionalResult.culturalReferences.length).toBeGreaterThanOrEqual(1);
      expect(regionalResult.confidence).toBeGreaterThan(0.7);
      expect(regionalResult.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Regional Processing Performance', () => {
    test('should process regional expressions efficiently', async () => {
      const startTime = Date.now();
      const message = 'Cara, vamos dividir a conta do rodízio. Beleza?';
      
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message, 'sao_paulo');
      const processingTime = Date.now() - startTime;

      expect(regionalResult.detectedRegion).toBe('sao_paulo');
      expect(regionalResult.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(processingTime).toBeLessThan(1000); // Should process in under 1 second
    });

    test('should handle long messages with regional expressions', async () => {
      const longMessage = 'Cara, vamos fazer um rodízio de pizza com a galera. Depois vamos no churrasco e fazer uma vaquinha pro presente. Beleza? Valeu!';
      
      const regionalResult = await regionalProcessor.processRegionalPortuguese(longMessage);

      expect(regionalResult.regionalExpressions.length).toBeGreaterThanOrEqual(3);
      expect(regionalResult.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(regionalResult.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Regional Accuracy Validation', () => {
    test('should accurately detect São Paulo region', async () => {
      const message = 'Cara, vamos no rodízio. Tipo, cada um paga igual.';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.detectedRegion).toBe('sao_paulo');
      expect(regionalResult.confidence).toBeGreaterThan(0.6);
    });

    test('should accurately detect Rio de Janeiro region', async () => {
      const message = 'Molecada, vamos fazer uma vaquinha. Beleza?';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.detectedRegion).toBe('rio_de_janeiro');
      expect(regionalResult.confidence).toBeGreaterThan(0.7);
    });

    test('should accurately detect Rio Grande do Sul region', async () => {
      const message = 'Bah tchê, vamos fazer um churrasco. Top!';
      const regionalResult = await regionalProcessor.processRegionalPortuguese(message);

      expect(regionalResult.detectedRegion).toBe('rio_grande_sul');
      expect(regionalResult.confidence).toBeGreaterThan(0.8);
    });
  });
}); 