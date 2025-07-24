// Debug script for accuracy test cases
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
  for (const [method, methodPatterns] of Object.entries(patterns)) {
    for (const pattern of methodPatterns) {
      if (normalizedText.includes(pattern)) {
        console.log(`✓ ${method}: "${pattern}"`);
      }
    }
  }
  
  // Test the specific expected pattern
  const expectedPattern = patterns[testCase.expected.method];
  if (expectedPattern) {
    const found = expectedPattern.some(pattern => normalizedText.includes(pattern));
    console.log(`\nExpected method "${testCase.expected.method}" pattern found:`, found);
  }
} 