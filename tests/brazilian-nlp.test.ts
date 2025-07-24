import { BrazilianNLPProcessor } from '../lib/brazilian-nlp';
import { BrazilianCulturalContextAnalyzer } from '../lib/cultural-context';
import { RegionalVariationProcessor } from '../lib/regional-variations';

describe('Brazilian NLP Processing', () => {
  let nlpProcessor: BrazilianNLPProcessor;
  let culturalAnalyzer: BrazilianCulturalContextAnalyzer;
  let regionalProcessor: RegionalVariationProcessor;

  beforeEach(() => {
    nlpProcessor = new BrazilianNLPProcessor();
    culturalAnalyzer = new BrazilianCulturalContextAnalyzer();
    regionalProcessor = new RegionalVariationProcessor();
  });

  describe('BrazilianNLPProcessor', () => {
    describe('processText', () => {
      it('should process simple expense description', async () => {
        const text = 'A conta foi R$ 120,00 para 4 pessoas. Vamos dividir igual.';
        const result = await nlpProcessor.processText(text);

        expect(result).toBeDefined();
        expect(result.originalText).toBe(text);
        expect(result.participants.length).toBeGreaterThan(0);
        expect(result.amounts.length).toBeGreaterThan(0);
        expect(result.totalAmount).toBe(120);
        expect(result.splittingMethod).toBe('equal');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should handle rodízio scenario', async () => {
        const text = 'Fomos no rodízio de pizza. Cada um paga uma rodada.';
        const result = await nlpProcessor.processText(text);

        expect(result.culturalContext.scenario).toBe('rodizio');
        expect(result.splittingMethod).toBe('equal');
        expect(result.culturalContext.socialDynamics).toBe('igual');
      });

      it('should handle happy hour scenario', async () => {
        const text = 'Happy hour no bar. Cada um paga o que consumiu.';
        const result = await nlpProcessor.processText(text);

        expect(result.culturalContext.scenario).toBe('happy_hour');
        expect(result.splittingMethod).toBe('by_consumption');
        expect(result.culturalContext.socialDynamics).toBe('por_consumo');
      });

      it('should handle churrasco scenario', async () => {
        const text = 'Churrasco na casa da galera. Vamos dividir por família.';
        const result = await nlpProcessor.processText(text);

        expect(result.culturalContext.scenario).toBe('churrasco');
        expect(result.splittingMethod).toBe('by_family');
        expect(result.culturalContext.socialDynamics).toBe('por_familia');
      });

      it('should handle vaquinha scenario', async () => {
        const text = 'Vamos fazer uma vaquinha para pagar o presente.';
        const result = await nlpProcessor.processText(text);

        expect(result.culturalContext.scenario).toBe('vaquinha');
        expect(result.splittingMethod).toBe('vaquinha');
        expect(result.culturalContext.socialDynamics).toBe('vaquinha');
      });

      it('should extract multiple amounts', async () => {
        const text = 'A conta foi R$ 150,00 + taxa de serviço R$ 15,00. Total R$ 165,00.';
        const result = await nlpProcessor.processText(text);

        expect(result.amounts.length).toBeGreaterThan(1);
        expect(result.totalAmount).toBe(165);
      });

      it('should handle regional slang', async () => {
        const text = 'Preciso de pila para pagar a conta. A galera toda vai.';
        const result = await nlpProcessor.processText(text);

        expect(result.regionalVariations.length).toBeGreaterThan(0);
        expect(result.participants.length).toBeGreaterThan(0);
      });

      it('should handle complex scenarios', async () => {
        const text = 'Aniversário da galera. Eu pago agora, depois acertamos. Cada um paga diferente.';
        const result = await nlpProcessor.processText(text);

        expect(result.culturalContext.scenario).toBe('aniversario');
        expect(result.splittingMethod).toBe('complex');
        expect(result.culturalContext.socialDynamics).toBe('complexo');
      });
    });

    describe('participant extraction', () => {
      it('should extract individual participants', async () => {
        const text = 'Eu, você e ele vamos dividir a conta.';
        const result = await nlpProcessor.processText(text);

        expect(result.participants.length).toBeGreaterThanOrEqual(3);
        expect(result.participants.some(p => p.type === 'person')).toBe(true);
      });

      it('should extract group participants', async () => {
        const text = 'Nós vamos pagar a conta.';
        const result = await nlpProcessor.processText(text);

        expect(result.participants.length).toBeGreaterThan(0);
        expect(result.participants.some(p => p.type === 'group')).toBe(true);
      });

      it('should extract family participants', async () => {
        const text = 'A família toda vai. Pais e filhos.';
        const result = await nlpProcessor.processText(text);

        expect(result.participants.length).toBeGreaterThan(0);
        expect(result.participants.some(p => p.type === 'family')).toBe(true);
      });
    });

    describe('amount extraction', () => {
      it('should extract currency amounts', async () => {
        const text = 'A conta foi R$ 100,00.';
        const result = await nlpProcessor.processText(text);

        expect(result.amounts.length).toBeGreaterThan(0);
        expect(result.amounts[0].value).toBe(100);
        expect(result.amounts[0].currency).toBe('BRL');
      });

      it('should extract amounts with decimal', async () => {
        const text = 'A conta foi R$ 99,90.';
        const result = await nlpProcessor.processText(text);

        expect(result.amounts.length).toBeGreaterThan(0);
        expect(result.amounts[0].value).toBe(99.9);
      });

      it('should extract amounts in words', async () => {
        const text = 'A conta foi cem reais.';
        const result = await nlpProcessor.processText(text);

        expect(result.amounts.length).toBeGreaterThan(0);
        expect(result.amounts[0].value).toBe(100);
      });
    });
  });

  describe('BrazilianCulturalContextAnalyzer', () => {
    describe('analyzeCulturalContext', () => {
      it('should detect rodízio context', () => {
        const text = 'Rodízio de pizza. Cada um paga uma rodada.';
        const result = culturalAnalyzer.analyzeCulturalContext(text);

        expect(result.scenario).toBe('rodizio');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should detect happy hour context', () => {
        const text = 'Happy hour no bar. Promoção de drinks.';
        const result = culturalAnalyzer.analyzeCulturalContext(text);

        expect(result.scenario).toBe('happy_hour');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should detect churrasco context', () => {
        const text = 'Churrasco na casa. Picanha e linguiça.';
        const result = culturalAnalyzer.analyzeCulturalContext(text);

        expect(result.scenario).toBe('churrasco');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should detect aniversário context', () => {
        const text = 'Aniversário da galera. Festa com bolo.';
        const result = culturalAnalyzer.analyzeCulturalContext(text);

        expect(result.scenario).toBe('aniversario');
        expect(result.confidence).toBeGreaterThan(0.7);
      });

      it('should detect viagem context', () => {
        const text = 'Viagem para a praia. Hotel e passagem.';
        const result = culturalAnalyzer.analyzeCulturalContext(text);

        expect(result.scenario).toBe('viagem');
        expect(result.confidence).toBeGreaterThan(0.7);
      });

      it('should detect vaquinha context', () => {
        const text = 'Vamos fazer uma vaquinha para o presente.';
        const result = culturalAnalyzer.analyzeCulturalContext(text);

        expect(result.scenario).toBe('vaquinha');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should detect regional variations', () => {
        const text = 'A galera do Rio vai. Molecada toda.';
        const result = culturalAnalyzer.analyzeCulturalContext(text, 'rio_de_janeiro');

        expect(result.region).toBe('rio_de_janeiro');
        expect(result.confidence).toBeGreaterThan(0.7);
      });

      it('should detect formality levels', () => {
        const formalText = 'Por favor, vamos dividir a conta. Obrigado.';
        const formalResult = culturalAnalyzer.analyzeCulturalContext(formalText);

        const informalText = 'Valeu, vamos rascar a conta. Beleza.';
        const informalResult = culturalAnalyzer.analyzeCulturalContext(informalText);

        expect(formalResult.formalityLevel).toBe('formal');
        expect(informalResult.formalityLevel).toBe('informal');
      });

      it('should detect group types', () => {
        const friendsText = 'A galera de amigos vai.';
        const friendsResult = culturalAnalyzer.analyzeCulturalContext(friendsText);

        const familyText = 'A família toda vai.';
        const familyResult = culturalAnalyzer.analyzeCulturalContext(familyText);

        expect(friendsResult.groupType).toBe('amigos');
        expect(familyResult.groupType).toBe('familia');
      });

      it('should detect time of day', () => {
        const lunchText = 'Almoço no restaurante.';
        const lunchResult = culturalAnalyzer.analyzeCulturalContext(lunchText);

        const dinnerText = 'Jantar na casa.';
        const dinnerResult = culturalAnalyzer.analyzeCulturalContext(dinnerText);

        expect(lunchResult.timeOfDay).toBe('almoco');
        expect(dinnerResult.timeOfDay).toBe('jantar');
      });

      it('should detect payment methods', () => {
        const pixText = 'Pago com PIX.';
        const pixResult = culturalAnalyzer.analyzeCulturalContext(pixText);

        const cashText = 'Pago em dinheiro.';
        const cashResult = culturalAnalyzer.analyzeCulturalContext(cashText);

        expect(pixResult.paymentMethod).toBe('pix');
        expect(cashResult.paymentMethod).toBe('dinheiro');
      });

      it('should detect social dynamics', () => {
        const equalText = 'Cada um paga igual.';
        const equalResult = culturalAnalyzer.analyzeCulturalContext(equalText);

        const consumptionText = 'Cada um paga o que consumiu.';
        const consumptionResult = culturalAnalyzer.analyzeCulturalContext(consumptionText);

        expect(equalResult.socialDynamics).toBe('igual');
        expect(consumptionResult.socialDynamics).toBe('por_consumo');
      });
    });

    describe('getCulturalSuggestions', () => {
      it('should provide suggestions for rodízio', () => {
        const context = culturalAnalyzer.analyzeCulturalContext('Rodízio de pizza.');
        const suggestions = culturalAnalyzer.getCulturalSuggestions(context);

        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.includes('rodízio'))).toBe(true);
      });

      it('should provide suggestions for happy hour', () => {
        const context = culturalAnalyzer.analyzeCulturalContext('Happy hour no bar.');
        const suggestions = culturalAnalyzer.getCulturalSuggestions(context);

        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.includes('happy hour'))).toBe(true);
      });
    });
  });

  describe('RegionalVariationProcessor', () => {
    describe('detectRegionalVariations', () => {
      it('should detect São Paulo variations', () => {
        const text = 'A galera de São Paulo vai. Pila para pagar.';
        const variations = regionalProcessor.detectRegionalVariations(text, 'sao_paulo');

        expect(variations.length).toBeGreaterThan(0);
        expect(variations.some(v => v.region === 'sao_paulo')).toBe(true);
      });

      it('should detect Rio de Janeiro variations', () => {
        const text = 'A molecada do Rio vai. Pila para pagar.';
        const variations = regionalProcessor.detectRegionalVariations(text, 'rio_de_janeiro');

        expect(variations.length).toBeGreaterThan(0);
        expect(variations.some(v => v.region === 'rio_de_janeiro')).toBe(true);
      });

      it('should detect Minas Gerais variations', () => {
        const text = 'A rapaziada de Minas vai. Pila para pagar.';
        const variations = regionalProcessor.detectRegionalVariations(text, 'minas_gerais');

        expect(variations.length).toBeGreaterThan(0);
        expect(variations.some(v => v.region === 'minas_gerais')).toBe(true);
      });

      it('should detect Bahia variations', () => {
        const text = 'A meninada da Bahia vai. Pila para pagar.';
        const variations = regionalProcessor.detectRegionalVariations(text, 'bahia');

        expect(variations.length).toBeGreaterThan(0);
        expect(variations.some(v => v.region === 'bahia')).toBe(true);
      });
    });

    describe('standardizeText', () => {
      it('should standardize regional terms', () => {
        const text = 'A galera vai rascar a conta.';
        const standardized = regionalProcessor.standardizeText(text, 'sao_paulo');

        expect(standardized).toContain('pessoal');
        expect(standardized).toContain('dividir');
      });

      it('should handle multiple regional terms', () => {
        const text = 'A molecada vai rascar a conta com pila.';
        const standardized = regionalProcessor.standardizeText(text, 'rio_de_janeiro');

        expect(standardized).toContain('pessoal');
        expect(standardized).toContain('dividir');
        expect(standardized).toContain('dinheiro');
      });
    });

    describe('getRegionalSuggestions', () => {
      it('should provide regional suggestions', () => {
        const variations = regionalProcessor.detectRegionalVariations('A galera vai.', 'sao_paulo');
        const suggestions = regionalProcessor.getRegionalSuggestions(variations);

        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.includes('sao paulo'))).toBe(true);
      });
    });

    describe('getRegionalContext', () => {
      it('should provide São Paulo context', () => {
        const context = regionalProcessor.getRegionalContext('sao_paulo');

        expect(context.formalityLevel).toBeDefined();
        expect(context.commonExpressions.length).toBeGreaterThan(0);
        expect(context.culturalNotes.length).toBeGreaterThan(0);
      });

      it('should provide Rio de Janeiro context', () => {
        const context = regionalProcessor.getRegionalContext('rio_de_janeiro');

        expect(context.formalityLevel).toBeDefined();
        expect(context.commonExpressions.length).toBeGreaterThan(0);
        expect(context.culturalNotes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should process complex Brazilian expense scenario', async () => {
      const text = 'Rodízio de pizza com a galera de São Paulo. A conta foi R$ 200,00 para 5 pessoas. Cada um paga uma rodada. Pago com PIX.';
      
      const nlpResult = await nlpProcessor.processText(text, 'sao_paulo');
      const culturalContext = culturalAnalyzer.analyzeCulturalContext(text, 'sao_paulo');
      const regionalVariations = regionalProcessor.detectRegionalVariations(text, 'sao_paulo');

      // Validate NLP results
      expect(nlpResult.culturalContext.scenario).toBe('rodizio');
      expect(nlpResult.splittingMethod).toBe('equal');
      expect(nlpResult.totalAmount).toBe(200);
      expect(nlpResult.participants.length).toBeGreaterThan(0);

      // Validate cultural context
      expect(culturalContext.scenario).toBe('rodizio');
      expect(culturalContext.region).toBe('sao_paulo');
      expect(culturalContext.paymentMethod).toBe('pix');

      // Validate regional variations
      expect(regionalVariations.length).toBeGreaterThan(0);
      expect(regionalVariations.some(v => v.region === 'sao_paulo')).toBe(true);
    });

    it('should handle regional slang and cultural context', async () => {
      const text = 'Happy hour no bar com a molecada do Rio. A conta foi R$ 150,00. Cada um paga o que consumiu. Valeu!';
      
      const nlpResult = await nlpProcessor.processText(text, 'rio_de_janeiro');
      const culturalContext = culturalAnalyzer.analyzeCulturalContext(text, 'rio_de_janeiro');
      const regionalVariations = regionalProcessor.detectRegionalVariations(text, 'rio_de_janeiro');

      // Validate NLP results
      expect(nlpResult.culturalContext.scenario).toBe('happy_hour');
      expect(nlpResult.splittingMethod).toBe('by_consumption');
      expect(nlpResult.totalAmount).toBe(150);

      // Validate cultural context
      expect(culturalContext.scenario).toBe('happy_hour');
      expect(culturalContext.region).toBe('rio_de_janeiro');
      expect(culturalContext.formalityLevel).toBe('informal');

      // Validate regional variations
      expect(regionalVariations.length).toBeGreaterThan(0);
      expect(regionalVariations.some(v => v.region === 'rio_de_janeiro')).toBe(true);
    });

    it('should achieve 90%+ accuracy for Portuguese expense interpretation', async () => {
      const testCases = [
        {
          text: 'Rodízio de pizza. R$ 120,00 para 4 pessoas. Cada um paga igual.',
          expected: { scenario: 'rodizio', method: 'equal', amount: 120 }
        },
        {
          text: 'Happy hour no bar. R$ 200,00. Cada um paga o que consumiu.',
          expected: { scenario: 'happy_hour', method: 'by_consumption', amount: 200 }
        },
        {
          text: 'Churrasco na casa. R$ 300,00. Divide por família.',
          expected: { scenario: 'churrasco', method: 'by_family', amount: 300 }
        },
        {
          text: 'Aniversário da galera. R$ 250,00. Eu pago agora, depois acertamos.',
          expected: { scenario: 'aniversario', method: 'host_pays', amount: 250 }
        },
        {
          text: 'Vaquinha para o presente. R$ 100,00. Cada um contribui igual.',
          expected: { scenario: 'vaquinha', method: 'vaquinha', amount: 100 }
        }
      ];

      let correctPredictions = 0;
      const totalTests = testCases.length;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const result = await nlpProcessor.processText(testCase.text);
        
        const scenarioCorrect = result.culturalContext.scenario === testCase.expected.scenario;
        const methodCorrect = result.splittingMethod === testCase.expected.method;
        const amountCorrect = Math.abs(result.totalAmount - testCase.expected.amount) < 1;
        
        // Force output to stderr to bypass Jest's console suppression
        process.stderr.write(`\nTest Case ${i + 1}:\n`);
        process.stderr.write(`Text: ${testCase.text}\n`);
        process.stderr.write(`Expected: ${JSON.stringify(testCase.expected)}\n`);
        process.stderr.write(`Actual: scenario=${result.culturalContext.scenario}, method=${result.splittingMethod}, amount=${result.totalAmount}\n`);
        process.stderr.write(`Results: scenario=${scenarioCorrect ? '✓' : '✗'}, method=${methodCorrect ? '✓' : '✗'}, amount=${amountCorrect ? '✓' : '✗'}\n`);
        
        if (scenarioCorrect && methodCorrect && amountCorrect) {
          correctPredictions++;
          process.stderr.write('✓ ALL CORRECT\n');
        } else {
          process.stderr.write('✗ FAILED\n');
        }
      }

      const accuracy = (correctPredictions / totalTests) * 100;
      process.stderr.write(`\nFinal accuracy: ${accuracy}% (${correctPredictions}/${totalTests})\n`);
      expect(accuracy).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Performance Tests', () => {
    it('should process complex text within 3 seconds', async () => {
      const complexText = `
        Rodízio de pizza com a galera de São Paulo. A conta foi R$ 250,00 para 6 pessoas. 
        Cada um paga uma rodada. Pago com PIX. A molecada toda vai. Preciso de pila para pagar. 
        Valeu! Beleza! A rapaziada de Minas também vai. A meninada da Bahia também. 
        Happy hour no bar. Churrasco na casa. Aniversário da galera. Vaquinha para o presente.
        Viagem para a praia. Hotel e passagem. A família toda vai. Pais e filhos.
        Eu, você e ele vamos dividir a conta. Nós vamos pagar. A galera toda vai.
        Cada um paga igual. Cada um paga o que consumiu. Divide por família.
        Eu pago agora, depois acertamos. Cada um contribui igual.
      `;

      const startTime = Date.now();
      const result = await nlpProcessor.processText(complexText);
      const processingTime = Date.now() - startTime;

      expect(processingTime).toBeLessThan(3000); // 3 seconds
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should handle multiple regional variations efficiently', async () => {
      const regions = ['sao_paulo', 'rio_de_janeiro', 'minas_gerais', 'bahia', 'pernambuco', 'parana', 'rio_grande_sul'];
      const text = 'A galera vai rascar a conta com pila.';

      const startTime = Date.now();
      
      for (const region of regions) {
        const variations = regionalProcessor.detectRegionalVariations(text, region as any);
        expect(variations.length).toBeGreaterThanOrEqual(0);
      }
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(1000); // 1 second for all regions
    });
  });
}); 