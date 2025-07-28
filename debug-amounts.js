// Debug script for amount extraction
const testCases = [
  'Rodízio de pizza. R$ 120,00 para 4 pessoas. Cada um paga igual.',
  'Happy hour no bar. R$ 200,00. Cada um paga o que consumiu.',
  'Churrasco na casa. R$ 300,00. Divide por família.',
  'Aniversário da galera. R$ 250,00. Eu pago agora, depois acertamos.',
  'Vaquinha para o presente. R$ 100,00. Cada um contribui igual.'
];

console.log('=== AMOUNT EXTRACTION DEBUG ===');

// Test the regex patterns directly
const amountPatterns = [
  /R\$\s*(\d+[.,]\d{2})/g,
  /R\$\s*(\d+)/g,
  /(\d+[.,]\d{2})\s*reais?/g,
  /(\d+)\s*reais?/g,
  /reais?\s*(\d+[.,]\d{2})/g,
  /reais?\s*(\d+)/g,
  /(\d+[.,]\d{2})\s*R\$/g,
  /(\d+)\s*R\$/g,
  /total\s*(?:de\s*)?R\$\s*(\d+[.,]?\d*)/gi,
  /total\s*(?:de\s*)?(\d+[.,]?\d*)\s*reais?/gi,
];

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  console.log(`\n--- Test Case ${i + 1} ---`);
  console.log('Text:', testCase);
  
  for (let j = 0; j < amountPatterns.length; j++) {
    const pattern = amountPatterns[j];
    const matches = testCase.matchAll(pattern);
    
    for (const match of matches) {
      console.log(`Pattern ${j + 1}:`, pattern.source);
      console.log('Match:', match[0]);
      console.log('Group 1:', match[1]);
      
      // Test parsing
      const value = parseFloat(match[1].replace(',', '.'));
      console.log('Parsed value:', value);
    }
  }
} 