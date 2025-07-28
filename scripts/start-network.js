#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '0.0.0.0'; // Fallback
}

const localIP = getLocalIP();
const port = 3004;

console.log('🌐 Starting RachaAI server with network access...');
console.log(`📍 Local IP: ${localIP}`);
console.log(`🔌 Port: ${port}`);
console.log(`🌍 Network URL: http://${localIP}:${port}`);
console.log(`💻 Local URL: http://localhost:${port}`);
console.log('');

// Start Next.js with network access
const nextProcess = spawn('npx', ['next', 'dev', '-p', port, '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    HOSTNAME: '0.0.0.0',
    PORT: port.toString(),
  }
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`\n🔌 Server stopped with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  nextProcess.kill('SIGTERM');
}); 