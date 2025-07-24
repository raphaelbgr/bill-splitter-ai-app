// Debug script that calls the real processText method
const { BrazilianNLPProcessor } = require('./lib/brazilian-nlp.ts');

const nlpProcessor = new BrazilianNLPProcessor();

async function debugRealTest() {
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

  console.log('=== REAL PROCESS TEXT DEBUG ===');

  let correctPredictions = 0;
  const totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test Case ${i + 1} ---`);
    console.log('Text:', testCase.text);
    console.log('Expected:', testCase.expected);
    
    try {
      const result = await nlpProcessor.processText(testCase.text);
      
      console.log('Actual result:');
      console.log('- Scenario:', result.culturalContext.scenario);
      console.log('- Method:', result.splittingMethod);
      console.log('- Total amount:', result.totalAmount);
      console.log('- Amounts found:', result.amounts.length);
      console.log('- Amounts:', result.amounts.map(a => ({ value: a.value, currency: a.currency })));
      
      const scenarioCorrect = result.culturalContext.scenario === testCase.expected.scenario;
      const methodCorrect = result.splittingMethod === testCase.expected.method;
      const amountCorrect = Math.abs(result.totalAmount - testCase.expected.amount) < 1;
      
      console.log('\nValidation:');
      console.log(`- Scenario: ${scenarioCorrect ? '✓' : '✗'} (${result.culturalContext.scenario} vs ${testCase.expected.scenario})`);
      console.log(`- Method: ${methodCorrect ? '✓' : '✗'} (${result.splittingMethod} vs ${testCase.expected.method})`);
      console.log(`- Amount: ${amountCorrect ? '✓' : '✗'} (${result.totalAmount} vs ${testCase.expected.amount})`);
      
      if (scenarioCorrect && methodCorrect && amountCorrect) {
        correctPredictions++;
        console.log('✓ ALL CORRECT');
      } else {
        console.log('✗ FAILED');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const accuracy = (correctPredictions / totalTests) * 100;
  console.log(`\n=== FINAL RESULTS ===`);
  console.log(`Correct predictions: ${correctPredictions}/${totalTests}`);
  console.log(`Accuracy: ${accuracy}%`);
  console.log(`Target: 90%`);
  console.log(`Status: ${accuracy >= 90 ? 'PASS' : 'FAIL'}`);
}

debugRealTest(); 