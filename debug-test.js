// Simple debug script to test social dynamics detection
const { BrazilianCulturalContextAnalyzer } = require('./lib/cultural-context.ts');
const { BrazilianNLPProcessor } = require('./lib/brazilian-nlp.ts');

const analyzer = new BrazilianCulturalContextAnalyzer();
const nlpProcessor = new BrazilianNLPProcessor();

// Test the specific failing cases
const happyHourText = 'Happy hour no bar. Cada um paga o que consumiu.';
const complexText = 'Aniversário da galera. Eu pago agora, depois acertamos. Cada um paga diferente.';
const participantText = 'Eu, você e ele vamos dividir a conta.';

console.log('Happy Hour Text:', happyHourText);
console.log('Happy Hour Text (lowercase):', happyHourText.toLowerCase());
const happyHourResult = analyzer.analyzeCulturalContext(happyHourText);
console.log('Happy Hour Social Dynamics:', happyHourResult.socialDynamics);
console.log('Happy Hour Scenario:', happyHourResult.scenario);

console.log('\nComplex Text:', complexText);
console.log('Complex Text (lowercase):', complexText.toLowerCase());
const complexResult = analyzer.analyzeCulturalContext(complexText);
console.log('Complex Social Dynamics:', complexResult.socialDynamics);
console.log('Complex Scenario:', complexResult.scenario);

// Test participant extraction
console.log('\n--- Participant Extraction Debug ---');
console.log('Participant Text:', participantText);
const participantResult = nlpProcessor.processText(participantText);
console.log('Participants found:', participantResult.participants.length);
console.log('Participants:', participantResult.participants.map(p => p.name));

// Test direct pattern detection
console.log('\n--- Pattern Detection Debug ---');
console.log('Happy Hour contains "cada um paga o que consumiu":', happyHourText.includes('cada um paga o que consumiu'));
console.log('Happy Hour contains "consumiu":', happyHourText.includes('consumiu'));
console.log('Happy Hour contains "consumo":', happyHourText.includes('consumo'));
console.log('Complex contains "cada um paga diferente":', complexText.includes('cada um paga diferente'));
console.log('Complex contains "diferente":', complexText.includes('diferente'));
console.log('Complex contains "paga diferente":', complexText.includes('paga diferente'));

// Test the actual text content
console.log('\n--- Text Content Analysis ---');
console.log('Happy Hour normalized:', happyHourText.toLowerCase());
console.log('Complex normalized:', complexText.toLowerCase());
console.log('Happy Hour contains "consumiu" (lowercase):', happyHourText.toLowerCase().includes('consumiu'));
console.log('Complex contains "diferente" (lowercase):', complexText.toLowerCase().includes('diferente'));
console.log('Complex contains "paga diferente" (lowercase):', complexText.toLowerCase().includes('paga diferente')); 