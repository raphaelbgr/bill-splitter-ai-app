// Simple debug script to identify the failing accuracy test case
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

console.log('=== ACCURACY TEST DEBUG ===');

let correctPredictions = 0;
const totalTests = testCases.length;

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  console.log(`\n--- Test Case ${i + 1} ---`);
  console.log('Text:', testCase.text);
  console.log('Expected:', testCase.expected);
  
  const normalizedText = testCase.text.toLowerCase();
  
  // Test scenario detection
  const scenarioPatterns = {
    rodizio: ['rodízio', 'rodizio'],
    happy_hour: ['happy hour'],
    churrasco: ['churrasco'],
    aniversario: ['aniversário', 'aniversario'],
    vaquinha: ['vaquinha']
  };
  
  let detectedScenario = null;
  for (const [scenario, keywords] of Object.entries(scenarioPatterns)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        detectedScenario = scenario;
        break;
      }
    }
    if (detectedScenario) break;
  }
  
  // Test method detection
  const methodPatterns = {
    equal: ['igual', 'paga igual'],
    by_consumption: ['consumiu', 'cada um paga o que consumiu'],
    host_pays: ['eu pago'],
    vaquinha: ['vaquinha', 'cada um contribui'],
    by_family: ['família', 'divide por família']
  };
  
  let detectedMethod = null;
  for (const [method, keywords] of Object.entries(methodPatterns)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        detectedMethod = method;
        break;
      }
    }
    if (detectedMethod) break;
  }
  
  // Test amount detection
  const amountPattern = /R\$\s*(\d+[.,]\d{2})/g;
  const amountMatch = normalizedText.match(amountPattern);
  const detectedAmount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
  
  const scenarioCorrect = detectedScenario === testCase.expected.scenario;
  const methodCorrect = detectedMethod === testCase.expected.method;
  const amountCorrect = Math.abs(detectedAmount - testCase.expected.amount) < 1;
  
  console.log(`Scenario: ${detectedScenario} (expected: ${testCase.expected.scenario}) - ${scenarioCorrect ? '✓' : '✗'}`);
  console.log(`Method: ${detectedMethod} (expected: ${testCase.expected.method}) - ${methodCorrect ? '✓' : '✗'}`);
  console.log(`Amount: ${detectedAmount} (expected: ${testCase.expected.amount}) - ${amountCorrect ? '✓' : '✗'}`);
  
  if (scenarioCorrect && methodCorrect && amountCorrect) {
    correctPredictions++;
    console.log('✓ ALL CORRECT');
  } else {
    console.log('✗ FAILED');
  }
}

const accuracy = (correctPredictions / totalTests) * 100;
console.log(`\n=== FINAL RESULTS ===`);
console.log(`Correct predictions: ${correctPredictions}/${totalTests}`);
console.log(`Accuracy: ${accuracy}%`);
console.log(`Target: 90%`);
console.log(`Status: ${accuracy >= 90 ? 'PASS' : 'FAIL'}`); 