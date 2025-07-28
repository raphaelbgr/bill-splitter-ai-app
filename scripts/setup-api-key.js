#!/usr/bin/env node

/**
 * Setup script for Anthropic API Key
 * This script helps users configure their API key for the RachaAI chat functionality
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 RachaAI API Key Setup');
console.log('========================');
console.log('');
console.log('Para usar a IA completa do RachaAI, você precisa configurar sua chave da API da Anthropic.');
console.log('');
console.log('1. Acesse: https://console.anthropic.com/');
console.log('2. Crie uma conta ou faça login');
console.log('3. Vá para "API Keys"');
console.log('4. Crie uma nova chave de API');
console.log('5. Copie a chave (começa com "sk-ant-api03-")');
console.log('');

rl.question('Cole sua chave da API da Anthropic aqui: ', (apiKey) => {
  if (!apiKey || !apiKey.startsWith('sk-ant-api03-')) {
    console.log('❌ Chave inválida. A chave deve começar com "sk-ant-api03-"');
    rl.close();
    return;
  }

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add the API key
  if (envContent.includes('ANTHROPIC_API_KEY=')) {
    envContent = envContent.replace(
      /ANTHROPIC_API_KEY=.*/,
      `ANTHROPIC_API_KEY=${apiKey}`
    );
  } else {
    envContent += `\n# Claude API Configuration\nANTHROPIC_API_KEY=${apiKey}\n`;
  }

  // Write the updated .env.local file
  fs.writeFileSync(envPath, envContent);

  console.log('');
  console.log('✅ Chave da API configurada com sucesso!');
  console.log('');
  console.log('Para aplicar as mudanças:');
  console.log('1. Reinicie o servidor de desenvolvimento');
  console.log('2. Teste a funcionalidade de chat');
  console.log('');
  console.log('Agora o RachaAI usará a IA completa da Claude para responder suas mensagens! 🚀');

  rl.close();
}); 