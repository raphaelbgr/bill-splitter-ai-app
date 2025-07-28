// Simple debug script for regex patterns
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

// Test the specific failing case
console.log('\n--- Testing Specific Case ---');
const specificPattern = /(eu|você|voce|vc|ele|ela)\s*,\s*(você|voce|vc|ele|ela)\s*e\s*(ele|ela|você|voce|vc)/gi;
const specificMatches = testText.matchAll(specificPattern);
console.log('Specific pattern:', specificPattern.source);

for (const match of specificMatches) {
  console.log('Specific match:', match);
  console.log('Groups:', match.slice(1));
  console.log('Group 1:', match[1]);
  console.log('Group 2:', match[2]);
  console.log('Group 3:', match[3]);
} 