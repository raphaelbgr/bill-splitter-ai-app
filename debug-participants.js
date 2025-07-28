// Debug script for participant extraction
const { BrazilianNLPProcessor } = require('./lib/brazilian-nlp.ts');

const nlpProcessor = new BrazilianNLPProcessor();

async function debugParticipants() {
  const testText = 'Eu, você e ele vamos dividir a conta.';
  console.log('Test text:', testText);
  
  // Test the regex patterns directly
  const commaPatterns = [
    /(eu|você|voce|vc|ele|ela)\s*,\s*(você|voce|vc|ele|ela)\s*e\s*(ele|ela|você|voce|vc)/gi,
    /(eu|você|voce|vc|ele|ela)\s*,\s*(você|voce|vc|ele|ela)\s*,\s*(ele|ela)\s*e\s*(ela|ele)/gi,
    /(eu|você|voce|vc|ele|ela)\s*e\s*(você|voce|vc|ele|ela)/gi,
    /(nós|nos|vocês|voces|eles|elas)\s*,\s*(vocês|voces|eles|elas)\s*e\s*(eles|elas)/gi
  ];

  console.log('\n--- Testing Regex Patterns ---');
  for (let i = 0; i < commaPatterns.length; i++) {
    const pattern = commaPatterns[i];
    const matches = testText.matchAll(pattern);
    console.log(`Pattern ${i + 1}:`, pattern.source);
    
    for (const match of matches) {
      console.log('Match found:', match);
      console.log('Match groups:', match.slice(1));
    }
  }

  // Test individual pronoun patterns
  const pronounPatterns = [
    /\b(eu|você|voce|vc|ele|ela|nós|nos|vocês|voces|eles|elas)\b/gi,
    /\b(mim|ti|si|nós|nos|vós|vos|eles|elas)\b/gi
  ];

  console.log('\n--- Testing Individual Pronouns ---');
  for (let i = 0; i < pronounPatterns.length; i++) {
    const pattern = pronounPatterns[i];
    const matches = testText.matchAll(pattern);
    console.log(`Pronoun Pattern ${i + 1}:`, pattern.source);
    
    for (const match of matches) {
      console.log('Match found:', match[0]);
    }
  }

  // Test the actual processText method
  console.log('\n--- Testing processText ---');
  try {
    const result = await nlpProcessor.processText(testText);
    console.log('Participants found:', result.participants.length);
    console.log('Participants:', result.participants.map(p => ({ name: p.name, type: p.type, confidence: p.confidence })));
  } catch (error) {
    console.error('Error:', error);
  }
}

debugParticipants(); 