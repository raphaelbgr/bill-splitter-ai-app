// Final debug script for accuracy test
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
  
  // Test each splitting method pattern
  const patterns = {
    equal: [
      'igual', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'cada um igual',
      'divide igual', 'divide por igual', 'paga igual', 'paga por igual',
      'cada um paga uma rodada', 'rodada', 'rodadas', 'divide igualmente',
      'paga igualmente', 'cada um igual', 'todos igual', 'cada um paga uma rodada'
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
    vaquinha: [
      'vaquinha', 'coleta', 'contribuição', 'contribuicao',
      'cada um contribui', 'contribui igual', 'fazer vaquinha',
      'contribuição', 'contribuicao', 'contribui'
    ],
    by_family: [
      'família', 'familia', 'familiar', 'familiares',
      'divide por família', 'divide por familia', 'por família', 'por familia',
      'divide por família', 'por família'
    ]
  };
  
  console.log('\nPattern matching results:');
  let detectedMethod = null;
  for (const [method, methodPatterns] of Object.entries(patterns)) {
    for (const pattern of methodPatterns) {
      if (normalizedText.includes(pattern)) {
        console.log(`✓ ${method}: "${pattern}"`);
        if (!detectedMethod) {
          detectedMethod = method;
        }
      }
    }
  }
  
  console.log(`\nDetected method: ${detectedMethod}`);
  console.log(`Expected method: ${testCase.expected.method}`);
  console.log(`Method correct: ${detectedMethod === testCase.expected.method}`);
  
  // Test amount extraction
  const amountPatterns = [
    /R\$\s*(\d+[.,]\d{2})/g,
    /R\$\s*(\d+)/g,
    /(\d+[.,]\d{2})\s*reais?/g,
    /(\d+)\s*reais?/g
  ];
  
  let detectedAmount = 0;
  for (const pattern of amountPatterns) {
    const matches = normalizedText.matchAll(pattern);
    for (const match of matches) {
      const amount = parseFloat(match[1].replace(',', '.'));
      if (amount > 0) {
        detectedAmount = amount;
        break;
      }
    }
    if (detectedAmount > 0) break;
  }
  
  console.log(`Detected amount: ${detectedAmount}`);
  console.log(`Expected amount: ${testCase.expected.amount}`);
  console.log(`Amount correct: ${Math.abs(detectedAmount - testCase.expected.amount) < 1}`);
  
  // Test scenario detection
  const scenarioPatterns = {
    rodizio: ['rodízio', 'rodizio'],
    happy_hour: ['happy hour', 'happy hour'],
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
  
  console.log(`Detected scenario: ${detectedScenario}`);
  console.log(`Expected scenario: ${testCase.expected.scenario}`);
  console.log(`Scenario correct: ${detectedScenario === testCase.expected.scenario}`);
  
  const scenarioCorrect = detectedScenario === testCase.expected.scenario;
  const methodCorrect = detectedMethod === testCase.expected.method;
  const amountCorrect = Math.abs(detectedAmount - testCase.expected.amount) < 1;
  
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