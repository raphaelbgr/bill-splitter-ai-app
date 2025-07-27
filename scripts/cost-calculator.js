#!/usr/bin/env node

/**
 * Cost Calculator for RachaAI
 * Helps understand the pricing for different models and token counts
 */

require('dotenv').config({ path: '.env.local' });

const exchangeRate = parseFloat(process.env.USD_TO_BRL_EXCHANGE_RATE || '5.20');

const MODEL_PRICING = {
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku-20241022': { input: 0.00025, output: 0.00125 },
  'claude-3-opus-20240229': { input: 15.0, output: 75.0 }
};

function calculateCost(inputTokens, outputTokens, model) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new Error(`Model ${model} not found`);
  }
  
  const costUSD = (
    (inputTokens / 1000) * pricing.input +
    (outputTokens / 1000) * pricing.output
  );
  
  return {
    costUSD: costUSD,
    costBRL: costUSD * exchangeRate,
    inputCost: (inputTokens / 1000) * pricing.input * exchangeRate,
    outputCost: (outputTokens / 1000) * pricing.output * exchangeRate
  };
}

console.log('💰 RachaAI Cost Calculator');
console.log('========================');
console.log(`Exchange Rate: USD 1 = R$ ${exchangeRate}`);
console.log('');

// Example calculations
const examples = [
  {
    name: 'Simple bill split',
    input: 600,
    output: 100,
    model: 'claude-3-5-sonnet-20241022'
  },
  {
    name: 'Complex calculation with tips',
    input: 800,
    output: 200,
    model: 'claude-3-5-sonnet-20241022'
  },
  {
    name: 'Very simple query',
    input: 300,
    output: 50,
    model: 'claude-3-5-haiku-20241022'
  }
];

examples.forEach(example => {
  const cost = calculateCost(example.input, example.output, example.model);
  
  console.log(`📊 ${example.name}`);
  console.log(`   Model: ${example.model}`);
  console.log(`   Input tokens: ${example.input}`);
  console.log(`   Output tokens: ${example.output}`);
  console.log(`   Cost: R$ ${cost.costBRL.toFixed(4)} (USD $${cost.costUSD.toFixed(4)})`);
  console.log('');
});

console.log('💡 Cost Comparison:');
console.log('===================');
console.log('• Claude 3.5 Sonnet: ~R$ 0.02-0.05 per query');
console.log('• Claude 3.5 Haiku: ~R$ 0.01-0.02 per query');
console.log('• Claude 3 Opus: ~R$ 0.50-2.00 per query (expensive!)');
console.log('');
console.log('🎯 Recommendation: Use Claude 3.5 Sonnet for most queries');
console.log('   - Best balance of cost and quality');
console.log('   - Handles complex calculations well');
console.log('   - Very affordable for daily use'); 