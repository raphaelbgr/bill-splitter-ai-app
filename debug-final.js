// Final debug script for remaining issues
const testText = 'Eu, você e ele vamos dividir a conta.';
console.log('=== PARTICIPANT EXTRACTION DEBUG ===');
console.log('Test text:', testText);

// Test the specific regex pattern
const pattern = /(eu|você|voce|vc|ele|ela)\s*,\s*(você|voce|vc|ele|ela)\s*e\s*(ele|ela|você|voce|vc)/gi;
const matches = testText.matchAll(pattern);

console.log('\nRegex pattern:', pattern.source);
for (const match of matches) {
  console.log('Full match:', match[0]);
  console.log('Group 1:', match[1]);
  console.log('Group 2:', match[2]);
  console.log('Group 3:', match[3]);
  console.log('All groups:', match.slice(1));
}

// Test individual pronoun extraction
const individualPattern = /\b(eu|você|voce|vc|ele|ela)\b/gi;
const individualMatches = testText.matchAll(individualPattern);
console.log('\nIndividual pronouns found:');
for (const match of individualMatches) {
  console.log('-', match[0]);
}

// Test each pronoun individually
console.log('\nTesting each pronoun individually:');
const pronouns = ['eu', 'você', 'ele'];
for (const pronoun of pronouns) {
  const pattern = new RegExp(`\\b${pronoun}\\b`, 'gi');
  const matches = testText.matchAll(pattern);
  console.log(`"${pronoun}":`, Array.from(matches).map(m => m[0]));
}

// Simulate the participant extraction logic
console.log('\n=== SIMULATING PARTICIPANT EXTRACTION ===');
const participants = [];

// Step 1: Try comma-separated patterns
const commaPatterns = [
  /(eu|você|voce|vc|ele|ela)\s*,\s*(você|voce|vc|ele|ela)\s*e\s*(ele|ela|você|voce|vc)/gi,
  /(eu|você|voce|vc|ele|ela)\s*,\s*(você|voce|vc|ele|ela)\s*,\s*(ele|ela)\s*e\s*(ela|ele)/gi,
  /(eu|você|voce|vc|ele|ela)\s*e\s*(você|voce|vc|ele|ela)/gi,
  /(nós|nos|vocês|voces|eles|elas)\s*,\s*(vocês|voces|eles|elas)\s*e\s*(eles|elas)/gi
];

console.log('Testing comma patterns...');
for (let i = 0; i < commaPatterns.length; i++) {
  const pattern = commaPatterns[i];
  const matches = testText.matchAll(pattern);
  
  for (const match of matches) {
    console.log(`Pattern ${i + 1} matched:`, match[0]);
    const participantNames = [];
    for (let j = 1; j < match.length; j++) {
      if (match[j]) {
        const name = match[j].toLowerCase() === 'eu' ? 'Eu' : 
                    match[j].toLowerCase() === 'você' ? 'Você' : 
                    match[j].toLowerCase() === 'ele' ? 'Ele' : match[j];
        if (!participantNames.includes(name)) {
          participantNames.push(name);
        }
      }
    }
    console.log('Participants found:', participantNames);
    
    if (participantNames.length >= 2) {
      console.log('Returning early with participants:', participantNames);
      break;
    }
  }
} 