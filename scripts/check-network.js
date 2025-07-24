#!/usr/bin/env node

const http = require('http');

const ips = [
  'localhost',
  '192.168.7.8',    // Ethernet
  '192.168.7.102'   // WiFi
];

const port = 3004;

console.log('🌐 Checking RachaAI Network Access...\n');

async function checkIP(ip) {
  return new Promise((resolve) => {
    const options = {
      hostname: ip,
      port: port,
      path: '/conversation-test',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${ip}:${port} - Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${ip}:${port} - Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${ip}:${port} - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkAPI(ip) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      message: 'Teste de rede',
      conversationId: '123e4567-e89b-12d3-a456-426614174000'
    });

    const options = {
      hostname: ip,
      port: port,
      path: '/api/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log(`✅ ${ip}:${port}/api/ai/chat - API Working`);
          } else {
            console.log(`⚠️  ${ip}:${port}/api/ai/chat - API Error: ${response.error}`);
          }
        } catch (e) {
          console.log(`❌ ${ip}:${port}/api/ai/chat - Invalid Response`);
        }
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${ip}:${port}/api/ai/chat - Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${ip}:${port}/api/ai/chat - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function runChecks() {
  console.log('🔍 Checking Web Interface...');
  for (const ip of ips) {
    await checkIP(ip);
  }

  console.log('\n🔍 Checking API Endpoints...');
  for (const ip of ips) {
    await checkAPI(ip);
  }

  console.log('\n📱 Network Access Summary:');
  console.log('• Localhost: http://localhost:3004/conversation-test');
  console.log('• Ethernet: http://192.168.7.8:3004/conversation-test');
  console.log('• WiFi: http://192.168.7.102:3004/conversation-test');
  console.log('\n🎯 Ready for mobile testing!');
}

runChecks().catch(console.error); 