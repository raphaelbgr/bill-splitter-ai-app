const { BrazilianNLPProcessor } = require('./lib/brazilian-nlp.ts');

async function testStory4Status() {
  console.log('Testing Story 4: Complex Expense Parsing Engine Status...\n');
  
  const nlpProcessor = new BrazilianNLPProcessor();
  
  // Test cases from the story
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

  console.log('Running accuracy tests...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test Case ${i + 1}:`);
    console.log(`Text: ${testCase.text}`);
    console.log(`Expected: ${JSON.stringify(testCase.expected)}`);
    
    try {
      const result = await nlpProcessor.processText(testCase.text);
      
      const scenarioCorrect = result.culturalContext.scenario === testCase.expected.scenario;
      const methodCorrect = result.splittingMethod === testCase.expected.method;
      const amountCorrect = Math.abs(result.totalAmount - testCase.expected.amount) < 1;
      
      console.log(`Actual: scenario=${result.culturalContext.scenario}, method=${result.splittingMethod}, amount=${result.totalAmount}`);
      console.log(`Results: scenario=${scenarioCorrect ? '✓' : '✗'}, method=${methodCorrect ? '✓' : '✗'}, amount=${amountCorrect ? '✓' : '✗'}`);
      
      if (scenarioCorrect && methodCorrect && amountCorrect) {
        correctPredictions++;
        console.log('✓ ALL CORRECT\n');
      } else {
        console.log('✗ FAILED\n');
      }
    } catch (error) {
      console.log(`✗ ERROR: ${error.message}\n`);
    }
  }

  const accuracy = (correctPredictions / totalTests) * 100;
  console.log(`\nFinal accuracy: ${accuracy}% (${correctPredictions}/${totalTests})`);
  
  if (accuracy >= 90) {
    console.log('✅ Story 4 is COMPLETE - Accuracy target met!');
  } else {
    console.log('⚠️ Story 4 needs refinement - Accuracy below 90% target');
  }
}

testStory4Status().catch(console.error); 