// Debug script for processText method
const { BrazilianNLPProcessor } = require('./lib/brazilian-nlp.ts');

const nlpProcessor = new BrazilianNLPProcessor();

async function debugProcessText() {
  const testCases = [
    'Rodízio de pizza. R$ 120,00 para 4 pessoas. Cada um paga igual.',
    'Happy hour no bar. R$ 200,00. Cada um paga o que consumiu.',
    'Churrasco na casa. R$ 300,00. Divide por família.',
    'Aniversário da galera. R$ 250,00. Eu pago agora, depois acertamos.',
    'Vaquinha para o presente. R$ 100,00. Cada um contribui igual.'
  ];

  console.log('=== PROCESS TEXT DEBUG ===');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test Case ${i + 1} ---`);
    console.log('Text:', testCase);
    
    try {
      const result = await nlpProcessor.processText(testCase);
      console.log('Amounts found:', result.amounts.length);
      console.log('Amounts:', result.amounts.map(a => ({ value: a.value, currency: a.currency, type: a.type })));
      console.log('Total amount:', result.totalAmount);
      console.log('Splitting method:', result.splittingMethod);
      console.log('Scenario:', result.culturalContext.scenario);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

debugProcessText(); 