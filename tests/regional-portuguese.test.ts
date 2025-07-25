import { RegionalPortugueseProcessor, RegionalPortugueseResult } from '../lib/regional-portuguese';

describe('Regional Portuguese Processor - Story 7', () => {
  let processor: RegionalPortugueseProcessor;

  beforeEach(() => {
    processor = new RegionalPortugueseProcessor();
  });

  describe('Regional Portuguese Variations', () => {
    test('should detect São Paulo regional expressions', async () => {
      const text = 'Cara, vamos dividir a conta do rodízio. Beleza?';
      const result = await processor.processRegionalPortuguese(text, 'sao_paulo');

      expect(result.detectedRegion).toBe('sao_paulo');
      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(result.regionalExpressions.some(exp => exp.original === 'cara')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'beleza')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should detect Rio de Janeiro regional expressions', async () => {
      const text = 'Molecada, vamos fazer uma vaquinha pro presente. Valeu!';
      const result = await processor.processRegionalPortuguese(text, 'rio_de_janeiro');

      expect(result.detectedRegion).toBe('rio_de_janeiro');
      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(result.regionalExpressions.some(exp => exp.original === 'molecada')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'valeu')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Minas Gerais regional expressions', async () => {
      const text = 'Rapaziada, vamos curtir o churrasco. Tranquilo!';
      const result = await processor.processRegionalPortuguese(text, 'minas_gerais');

      expect(result.detectedRegion).toBe('minas_gerais');
      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(result.regionalExpressions.some(exp => exp.original === 'rapaziada')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'tranquilo')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Bahia regional expressions', async () => {
      const text = 'Meninada, vamos comer acarajé. Massa demais!';
      const result = await processor.processRegionalPortuguese(text, 'bahia');

      expect(result.detectedRegion).toBe('bahia');
      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(result.regionalExpressions.some(exp => exp.original === 'meninada')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'massa demais')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Rio Grande do Sul regional expressions', async () => {
      const text = 'Bah tchê, vamos fazer um churrasco. Top demais!';
      const result = await processor.processRegionalPortuguese(text, 'rio_grande_sul');

      expect(result.detectedRegion).toBe('rio_grande_sul');
      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(result.regionalExpressions.some(exp => exp.original === 'bah')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'tchê' || exp.original === 'tche')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Brazilian Slang Recognition', () => {
    test('should recognize common Brazilian slang expressions', async () => {
      const text = 'Massa demais cara! Vamos curtir o rolê. Show de bola!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(3);
      expect(result.regionalExpressions.some(exp => exp.original === 'massa demais')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'cara')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'curtir')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'show de bola')).toBe(true);
    });

    test('should recognize informal expressions', async () => {
      const text = 'Beleza mano! Valeu por tudo. Suave!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(3);
      expect(result.regionalExpressions.some(exp => exp.original === 'beleza')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'mano')).toBe(true);
      expect(result.regionalExpressions.some(exp => exp.original === 'valeu')).toBe(true);
    });
  });

  describe('Cultural Context Understanding', () => {
    test('should detect food-related cultural references', async () => {
      const text = 'Vamos no rodízio de pizza. Depois churrasco na casa.';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(1);
      expect(result.culturalReferences.some(ref => ref.reference === 'rodízio')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'churrasco')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.type === 'food')).toBe(true);
    });

    test('should detect activity-related cultural references', async () => {
      const text = 'Happy hour no bar. Depois aniversário da galera.';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(result.culturalReferences.some(ref => ref.reference === 'happy hour')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'aniversário')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'galera')).toBe(true);
    });

    test('should detect payment-related cultural references', async () => {
      const text = 'Vamos pagar com PIX. Ou boleto se preferir.';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(result.culturalReferences.some(ref => ref.reference === 'pix')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'boleto')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.type === 'payment')).toBe(true);
    });
  });

  describe('Code-switching Detection', () => {
    test('should detect Portuguese-English code-switching', async () => {
      const text = 'Vamos fazer um happy hour. Cool!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.codeSwitching.length).toBeGreaterThanOrEqual(1);
      expect(result.codeSwitching.some(cs => cs.englishPart === 'happy')).toBe(true);
      expect(result.codeSwitching.some(cs => cs.englishPart === 'cool')).toBe(true);
    });

    test('should detect common English words in Brazilian context', async () => {
      const text = 'Ok, vamos lá. Perfect!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.codeSwitching.length).toBeGreaterThanOrEqual(1);
      expect(result.codeSwitching.some(cs => cs.englishPart === 'ok')).toBe(true);
      expect(result.codeSwitching.some(cs => cs.englishPart === 'perfect')).toBe(true);
    });
  });

  describe('Regional Dialect Processing', () => {
    test('should process São Paulo formal business language', async () => {
      const text = 'Cara, vamos dividir a conta do rodízio. Tipo, cada um paga igual.';
      const result = await processor.processRegionalPortuguese(text, 'sao_paulo');

      expect(result.detectedRegion).toBe('sao_paulo');
      expect(result.suggestions).toContain('Detectei expressões regionais de São Paulo');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should process Rio de Janeiro casual language', async () => {
      const text = 'Molecada, beleza? Vamos curtir o rolê.';
      const result = await processor.processRegionalPortuguese(text, 'rio_de_janeiro');

      expect(result.detectedRegion).toBe('rio_de_janeiro');
      expect(result.suggestions).toContain('Detectei expressões regionais de Rio de Janeiro');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should process Minas Gerais warm language', async () => {
      const text = 'Rapaziada, vamos fazer um churrasco. Valeu!';
      const result = await processor.processRegionalPortuguese(text, 'minas_gerais');

      expect(result.detectedRegion).toBe('minas_gerais');
      expect(result.suggestions).toContain('Detectei expressões regionais de Minas Gerais');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should process Rio Grande do Sul direct language', async () => {
      const text = 'Bah tchê, vamos fazer um churrasco. Top demais!';
      const result = await processor.processRegionalPortuguese(text, 'rio_grande_sul');

      expect(result.detectedRegion).toBe('rio_grande_sul');
      expect(result.suggestions).toContain('Detectei expressões regionais de Rio Grande do Sul');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Cultural Reference Recognition', () => {
    test('should recognize Brazilian food culture', async () => {
      const text = 'Rodízio de pizza, churrasco, feijoada. Tudo massa!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(result.culturalReferences.some(ref => ref.reference === 'rodízio')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'churrasco')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'feijoada')).toBe(true);
    });

    test('should recognize Brazilian social activities', async () => {
      const text = 'Happy hour, aniversário, vaquinha. Tudo show!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(result.culturalReferences.some(ref => ref.reference === 'happy hour')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'aniversário')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'vaquinha')).toBe(true);
    });

    test('should recognize Brazilian payment methods', async () => {
      const text = 'PIX, boleto, cartão. Qual preferir?';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(2);
      expect(result.culturalReferences.some(ref => ref.reference === 'pix')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'boleto')).toBe(true);
      expect(result.culturalReferences.some(ref => ref.reference === 'cartão')).toBe(true);
    });
  });

  describe('Natural Conversation Optimization', () => {
    test('should process natural Brazilian conversation', async () => {
      const text = 'Cara, vamos fazer um rodízio. Beleza? Valeu!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(2);
      expect(result.culturalReferences.length).toBeGreaterThanOrEqual(1);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('should handle mixed regional expressions', async () => {
      const text = 'Molecada, vamos curtir o rolê. Top demais!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.regionalExpressions.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Regional Understanding Accuracy', () => {
    test('should accurately detect São Paulo region', async () => {
      const text = 'Cara, vamos no rodízio. Tipo, cada um paga igual.';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.detectedRegion).toBe('sao_paulo');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should accurately detect Rio de Janeiro region', async () => {
      const text = 'Molecada, vamos fazer uma vaquinha. Beleza?';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.detectedRegion).toBe('rio_de_janeiro');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should accurately detect Rio Grande do Sul region', async () => {
      const text = 'Bah tchê, vamos fazer um churrasco. Top!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.detectedRegion).toBe('rio_grande_sul');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Cultural Sensitivity', () => {
    test('should maintain cultural sensitivity in processing', async () => {
      const text = 'Vamos respeitar a cultura local. Beleza?';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(1);
      expect(result.regionalExpressions.some(exp => exp.original === 'beleza')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should handle regional variations appropriately', async () => {
      const text = 'Cada região tem sua cultura. Valeu!';
      const result = await processor.processRegionalPortuguese(text);

      expect(result.regionalExpressions.length).toBeGreaterThanOrEqual(1);
      expect(result.regionalExpressions.some(exp => exp.original === 'valeu')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });
}); 