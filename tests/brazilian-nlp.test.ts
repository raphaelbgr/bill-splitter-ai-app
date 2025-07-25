import { BrazilianNLPProcessor } from '../lib/brazilian-nlp';
import { BrazilianCulturalContextAnalyzer } from '../lib/cultural-context';
import { RegionalVariationProcessor } from '../lib/regional-variations';

describe('Brazilian NLP Processing Tests', () => {
  let nlpProcessor: BrazilianNLPProcessor;
  let culturalAnalyzer: BrazilianCulturalContextAnalyzer;
  let regionalProcessor: RegionalVariationProcessor;

  beforeEach(() => {
    nlpProcessor = new BrazilianNLPProcessor();
    culturalAnalyzer = new BrazilianCulturalContextAnalyzer();
    regionalProcessor = new RegionalVariationProcessor();
  });

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

    test('should handle Brazilian cultural contexts correctly', async () => {
      const text = 'Happy hour com os colegas do trabalho. Cada um paga o que consumiu.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('happy_hour');
      expect(result.culturalContext.groupType).toBe('trabalho');
      expect(result.splittingMethod).toBe('by_consumption');
    });

    test('should extract participants accurately', async () => {
      const text = 'Churrasco com família: eu, minha esposa, meus pais e meus irmãos.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.participants.length).toBeGreaterThan(0);
      expect(result.participants.some(p => p.type === 'family')).toBe(true);
    });

    test('should parse Brazilian currency correctly', async () => {
      const text = 'A conta foi R$ 150,50. Dividir entre 4 pessoas.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.amounts.length).toBeGreaterThan(0);
      expect(result.amounts[0].value).toBe(150.50);
      expect(result.amounts[0].currency).toBe('BRL');
    });

    test('should handle complex scenarios with discounts', async () => {
      const text = 'Rodízio de pizza: R$ 45 por pessoa, mas temos desconto de 10% para grupo de 6 ou mais.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.amounts.length).toBeGreaterThan(0);
      expect(result.amounts.some(a => a.type === 'discount')).toBe(true);
      expect(result.splittingMethod).toBe('equal');
    });
  });

  describe('Cultural Context Recognition Tests', () => {
    test('should recognize rodízio scenarios', async () => {
      const text = 'Pizza rodízio com a galera. Cada um paga uma rodada.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('rodizio');
      expect(result.culturalContext.socialDynamics).toBe('rodizio');
    });

    test('should recognize happy hour scenarios', async () => {
      const text = 'Happy hour com os colegas. Cada um paga o que bebeu.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('happy_hour');
      expect(result.culturalContext.groupType).toBe('trabalho');
    });

    test('should recognize churrasco scenarios', async () => {
      const text = 'Churrasco de família. Eu pago a carne, cada um traz algo.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('churrasco');
      expect(result.culturalContext.groupType).toBe('familia');
    });

    test('should recognize aniversário scenarios', async () => {
      const text = 'Aniversário da minha mãe. Ela não paga, dividimos entre os convidados.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('aniversario');
      expect(result.splittingMethod).toBe('equal');
    });

    test('should recognize vaquinha scenarios', async () => {
      const text = 'Vamos fazer uma vaquinha para o presente da galera.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('vaquinha');
      expect(result.splittingMethod).toBe('vaquinha');
    });
  });

  describe('Regional Variation Tests', () => {
    test('should handle São Paulo expressions', async () => {
      const text = 'Vamos rascar a conta. Cada um paga igual.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.regionalVariations.length).toBeGreaterThan(0);
      expect(result.regionalVariations.some(v => v.region === 'sao_paulo')).toBe(true);
    });

    test('should handle Rio de Janeiro expressions', async () => {
      const text = 'Happy hour com a molecada. Cada um paga o que consumiu.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.regionalVariations.length).toBeGreaterThan(0);
      expect(result.regionalVariations.some(v => v.region === 'rio_de_janeiro')).toBe(true);
    });

    test('should handle Nordeste expressions', async () => {
      const text = 'Churrasco com a família. Meu pai paga a carne.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.regionalVariations.length).toBeGreaterThan(0);
      expect(result.regionalVariations.some(v => v.region === 'bahia' || v.region === 'pernambuco')).toBe(true);
    });

    test('should handle Sul expressions', async () => {
      const text = 'Bah tchê, como vamos dividir essa conta?';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.regionalVariations.length).toBeGreaterThan(0);
      expect(result.regionalVariations.some(v => v.region === 'parana' || v.region === 'rio_grande_sul')).toBe(true);
    });
  });

  describe('Brazilian Slang and Expression Tests', () => {
    test('should understand Brazilian slang', async () => {
      const text = 'Preciso de grana para pagar minha parte.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.regionalVariations.length).toBeGreaterThan(0);
      expect(result.regionalVariations.some(v => v.originalTerm === 'grana')).toBe(true);
    });

    test('should understand informal expressions', async () => {
      const text = 'Vamos fazer uma vaquinha para o presente da galera.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.regionalVariations.length).toBeGreaterThan(0);
      expect(result.regionalVariations.some(v => v.originalTerm === 'galera')).toBe(true);
    });

    test('should handle formal vs informal contexts', async () => {
      const formalText = 'Solicitamos a divisão equitativa da despesa entre os participantes.';
      const informalText = 'Vamos rascar a conta entre a galera.';
      
      const formalResult = await nlpProcessor.processText(formalText);
      const informalResult = await nlpProcessor.processText(informalText);
      
      expect(formalResult.culturalContext.formalityLevel).toBe('formal');
      expect(informalResult.culturalContext.formalityLevel).toBe('informal');
    });
  });

  describe('Context-Aware Splitting Tests', () => {
    test('should determine equal splitting correctly', async () => {
      const text = 'Dividir R$ 100 entre 4 pessoas igualmente.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.splittingMethod).toBe('equal');
      expect(result.participants.length).toBe(1);
      expect(result.participants[0].count).toBe(4);
    });

    test('should determine consumption-based splitting', async () => {
      const text = 'Happy hour. Cada um paga o que consumiu.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.splittingMethod).toBe('by_consumption');
    });

    test('should determine host pays scenario', async () => {
      const text = 'Churrasco. Eu pago a carne, cada um traz algo.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.splittingMethod).toBe('host_pays');
    });

    test('should determine vaquinha scenario', async () => {
      const text = 'Vamos fazer uma vaquinha para o presente.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.splittingMethod).toBe('vaquinha');
    });

    test('should determine family-based splitting', async () => {
      const text = 'Churrasco de família. Divide por família.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.splittingMethod).toBe('by_family');
    });
  });

  describe('Cultural Pattern Recognition Tests', () => {
    test('should recognize social dynamics patterns', async () => {
      const text = 'Rodízio com amigos. Cada um paga uma rodada.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.groupType).toBe('amigos');
      expect(result.culturalContext.socialDynamics).toBe('rodizio');
    });

    test('should recognize family dynamics', async () => {
      const text = 'Churrasco de família. Meus pais pagam a carne.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.groupType).toBe('familia');
      expect(result.culturalContext.socialDynamics).toBe('anfitriao_paga');
    });

    test('should recognize work dynamics', async () => {
      const text = 'Happy hour com colegas do trabalho.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.groupType).toBe('trabalho');
      expect(result.culturalContext.scenario).toBe('happy_hour');
    });

    test('should recognize complex scenarios', async () => {
      const text = 'Viagem em grupo. Cada um com orçamento diferente.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.culturalContext.scenario).toBe('viagem');
      expect(result.splittingMethod).toBe('complex');
    });
  });

  describe('Fallback Mechanism Tests', () => {
    test('should handle unclear descriptions', async () => {
      const text = 'Alguma coisa com algumas pessoas.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('should handle mixed languages', async () => {
      const text = 'Dinner with friends. Dividir a conta.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('should handle incomplete information', async () => {
      const text = 'Dividir entre pessoas.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.participants.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('should provide helpful suggestions', async () => {
      const text = 'Algo com alguém.';
      
      const result = await nlpProcessor.processText(text);
      
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('exemplo');
    });
  });

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

    test('should handle concurrent processing', async () => {
      const texts = [
        'Dividir R$ 100 entre 4 pessoas',
        'Happy hour com colegas',
        'Churrasco de família',
        'Aniversário da minha mãe',
        'Viagem em grupo'
      ];
      
      const promises = texts.map(text => nlpProcessor.processText(text));
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.confidence).toBeGreaterThan(0.5);
        expect(result.processingTime).toBeLessThan(3000);
      });
    });

    test('should cache repeated queries', async () => {
      const text = 'Dividir R$ 50 entre 2 pessoas';
      
      const startTime1 = Date.now();
      const result1 = await nlpProcessor.processText(text);
      const endTime1 = Date.now();
      const time1 = endTime1 - startTime1;
      
      const startTime2 = Date.now();
      const result2 = await nlpProcessor.processText(text);
      const endTime2 = Date.now();
      const time2 = endTime2 - startTime2;
      
      // Second query should be faster (cached)
      expect(time2).toBeLessThan(time1);
    });
  });

  describe('Accuracy Validation Tests', () => {
    test('should achieve 90%+ accuracy for Portuguese expense interpretation', async () => {
      const testCases = [
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
      
      let correctCount = 0;
      
      for (const testCase of testCases) {
        const result = await nlpProcessor.processText(testCase.input);
        
        if (testCase.expectedParticipants) {
          const totalParticipants = result.participants.reduce((sum, p) => sum + p.count, 0);
          if (totalParticipants === testCase.expectedParticipants) correctCount++;
        }
        
        if (testCase.expectedAmount) {
          const totalAmount = result.amounts.reduce((sum, a) => sum + a.value, 0);
          if (Math.abs(totalAmount - testCase.expectedAmount) < 1) correctCount++;
        }
        
        if (testCase.expectedMethod && result.splittingMethod === testCase.expectedMethod) {
          correctCount++;
        }
      }
      
      const accuracy = correctCount / testCases.length;
      expect(accuracy).toBeGreaterThan(0.9); // 90%+ accuracy
    });

    test('should handle Brazilian cultural patterns correctly', async () => {
      const culturalTestCases = [
        { input: 'Rodízio com amigos', expectedScenario: 'rodizio' },
        { input: 'Happy hour com colegas', expectedScenario: 'happy_hour' },
        { input: 'Churrasco de família', expectedScenario: 'churrasco' },
        { input: 'Aniversário da minha mãe', expectedScenario: 'aniversario' },
        { input: 'Viagem em grupo', expectedScenario: 'viagem' },
        { input: 'Vamos fazer uma vaquinha', expectedScenario: 'vaquinha' }
      ];
      
      let correctCount = 0;
      
      for (const testCase of culturalTestCases) {
        const result = await nlpProcessor.processText(testCase.input);
        if (result.culturalContext.scenario === testCase.expectedScenario) {
          correctCount++;
        }
      }
      
      const accuracy = correctCount / culturalTestCases.length;
      expect(accuracy).toBeGreaterThan(0.95); // 95%+ accuracy for cultural patterns
    });
  });
}); 