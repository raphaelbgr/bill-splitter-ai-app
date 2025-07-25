const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: GET request (should return 405)
  try {
    const { stdout } = await execAsync(`curl -s -w "%{http_code}" -o /dev/null ${baseUrl}/api/ai/chat`);
    console.log(`✅ GET /api/ai/chat: ${stdout === '405' ? 'PASS' : 'FAIL'} (Expected: 405, Got: ${stdout})`);
  } catch (error) {
    console.log('❌ GET /api/ai/chat: FAIL - Server not responding');
  }

  // Test 2: Invalid request (should return 400)
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/ai/chat -H "Content-Type: application/json" -d '{"message":"","conversationId":"invalid"}'`);
    const response = JSON.parse(stdout);
    console.log(`✅ Invalid request: ${response.success === false ? 'PASS' : 'FAIL'} (Expected: false, Got: ${response.success})`);
  } catch (error) {
    console.log('❌ Invalid request: FAIL - Server not responding');
  }

  // Test 3: Valid request (should return 200)
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/ai/chat -H "Content-Type: application/json" -d '{"message":"test","conversationId":"123e4567-e89b-12d3-a456-426614174000"}'`);
    const response = JSON.parse(stdout);
    console.log(`✅ Valid request: ${response.success === true ? 'PASS' : 'FAIL'} (Expected: true, Got: ${response.success})`);
    if (response.data && response.data.content) {
      console.log(`   📝 Response: ${response.data.content.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log('❌ Valid request: FAIL - Server not responding');
  }

  // Test 4: Brazilian cultural context
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/ai/chat -H "Content-Type: application/json" -d '{"message":"Dividir R$ 120 entre 4 pessoas","conversationId":"123e4567-e89b-12d3-a456-426614174000","culturalContext":{"region":"São Paulo","scenario":"restaurante","groupType":"amigos","timeOfDay":"jantar"},"userPreferences":{"language":"pt-BR","formalityLevel":"informal","region":"São Paulo","paymentPreference":"pix"}}'`);
    const response = JSON.parse(stdout);
    console.log(`✅ Brazilian context: ${response.success === true ? 'PASS' : 'FAIL'} (Expected: true, Got: ${response.success})`);
  } catch (error) {
    console.log('❌ Brazilian context: FAIL - Server not responding');
  }

  // Test 5: Check redirect
  try {
    const { stdout } = await execAsync(`curl -s -I ${baseUrl} | grep -i location`);
    console.log(`✅ Redirect test: ${stdout.includes('/conversation-test') ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log('❌ Redirect test: FAIL');
  }

  console.log('\n🎯 API Testing Complete!');
}

// Run the tests
testAPI().catch(console.error); 