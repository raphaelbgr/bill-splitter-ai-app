const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testAllAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Comprehensive API Testing...\n');

  const results = [];

  // Test 1: Chat API - GET (should return 405)
  try {
    const { stdout } = await execAsync(`curl -s -w "%{http_code}" -o /dev/null ${baseUrl}/api/ai/chat`);
    const passed = stdout === '405';
    results.push({ test: 'Chat API - GET', passed, expected: '405', got: stdout });
    console.log(`✅ Chat API - GET: ${passed ? 'PASS' : 'FAIL'} (Expected: 405, Got: ${stdout})`);
  } catch (error) {
    results.push({ test: 'Chat API - GET', passed: false, error: 'Server not responding' });
    console.log('❌ Chat API - GET: FAIL - Server not responding');
  }

  // Test 2: Chat API - Invalid request
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/ai/chat -H "Content-Type: application/json" -d '{"message":"","conversationId":"invalid"}'`);
    const response = JSON.parse(stdout);
    const passed = response.success === false;
    results.push({ test: 'Chat API - Invalid request', passed, expected: false, got: response.success });
    console.log(`✅ Chat API - Invalid request: ${passed ? 'PASS' : 'FAIL'} (Expected: false, Got: ${response.success})`);
  } catch (error) {
    results.push({ test: 'Chat API - Invalid request', passed: false, error: 'Server not responding' });
    console.log('❌ Chat API - Invalid request: FAIL - Server not responding');
  }

  // Test 3: Chat API - Valid request
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/ai/chat -H "Content-Type: application/json" -d '{"message":"test","conversationId":"123e4567-e89b-12d3-a456-426614174000"}'`);
    const response = JSON.parse(stdout);
    const passed = response.success === true;
    results.push({ test: 'Chat API - Valid request', passed, expected: true, got: response.success });
    console.log(`✅ Chat API - Valid request: ${passed ? 'PASS' : 'FAIL'} (Expected: true, Got: ${response.success})`);
    if (response.data && response.data.content) {
      console.log(`   📝 Response: ${response.data.content.substring(0, 100)}...`);
    }
  } catch (error) {
    results.push({ test: 'Chat API - Valid request', passed: false, error: 'Server not responding' });
    console.log('❌ Chat API - Valid request: FAIL - Server not responding');
  }

  // Test 4: Signup API - GET (should return 405)
  try {
    const { stdout } = await execAsync(`curl -s -w "%{http_code}" -o /dev/null ${baseUrl}/api/auth/signup`);
    const passed = stdout === '405';
    results.push({ test: 'Signup API - GET', passed, expected: '405', got: stdout });
    console.log(`✅ Signup API - GET: ${passed ? 'PASS' : 'FAIL'} (Expected: 405, Got: ${stdout})`);
  } catch (error) {
    results.push({ test: 'Signup API - GET', passed: false, error: 'Server not responding' });
    console.log('❌ Signup API - GET: FAIL - Server not responding');
  }

  // Test 5: Signup API - Invalid request
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/auth/signup -H "Content-Type: application/json" -d '{"email":"invalid","password":"123"}'`);
    const response = JSON.parse(stdout);
    const passed = response.success === false;
    results.push({ test: 'Signup API - Invalid request', passed, expected: false, got: response.success });
    console.log(`✅ Signup API - Invalid request: ${passed ? 'PASS' : 'FAIL'} (Expected: false, Got: ${response.success})`);
  } catch (error) {
    results.push({ test: 'Signup API - Invalid request', passed: false, error: 'Server not responding' });
    console.log('❌ Signup API - Invalid request: FAIL - Server not responding');
  }

  // Test 6: Signup API - Valid request (with Supabase issues)
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/auth/signup -H "Content-Type: application/json" -d '{"email":"rapahelbgr@gmail.com","password":"tjq5uxt3","display_name":"Raphael Bernardo","phone":"(21) 98885-6697","cpf":"12946691764"}'`);
    const response = JSON.parse(stdout);
    const passed = response.success === true;
    results.push({ test: 'Signup API - Valid request', passed, expected: true, got: response.success, error: response.error });
    console.log(`✅ Signup API - Valid request: ${passed ? 'PASS' : 'FAIL'} (Expected: true, Got: ${response.success})`);
    if (response.error) {
      console.log(`   ⚠️  Error: ${response.error}`);
    }
  } catch (error) {
    results.push({ test: 'Signup API - Valid request', passed: false, error: 'Server not responding' });
    console.log('❌ Signup API - Valid request: FAIL - Server not responding');
  }

  // Test 7: Signin API - GET (should return 405)
  try {
    const { stdout } = await execAsync(`curl -s -w "%{http_code}" -o /dev/null ${baseUrl}/api/auth/signin`);
    const passed = stdout === '405';
    results.push({ test: 'Signin API - GET', passed, expected: '405', got: stdout });
    console.log(`✅ Signin API - GET: ${passed ? 'PASS' : 'FAIL'} (Expected: 405, Got: ${stdout})`);
  } catch (error) {
    results.push({ test: 'Signin API - GET', passed: false, error: 'Server not responding' });
    console.log('❌ Signin API - GET: FAIL - Server not responding');
  }

  // Test 8: Signin API - Invalid request
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/auth/signin -H "Content-Type: application/json" -d '{"email":"invalid","password":""}'`);
    const response = JSON.parse(stdout);
    const passed = response.success === false;
    results.push({ test: 'Signin API - Invalid request', passed, expected: false, got: response.success });
    console.log(`✅ Signin API - Invalid request: ${passed ? 'PASS' : 'FAIL'} (Expected: false, Got: ${response.success})`);
  } catch (error) {
    results.push({ test: 'Signin API - Invalid request', passed: false, error: 'Server not responding' });
    console.log('❌ Signin API - Invalid request: FAIL - Server not responding');
  }

  // Test 9: Redirect test
  try {
    const { stdout } = await execAsync(`curl -s -I ${baseUrl} | grep -i location`);
    const passed = stdout.includes('/conversation-test');
    results.push({ test: 'Redirect test', passed, expected: '/conversation-test', got: stdout });
    console.log(`✅ Redirect test: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    results.push({ test: 'Redirect test', passed: false, error: 'Redirect failed' });
    console.log('❌ Redirect test: FAIL');
  }

  // Test 10: Brazilian cultural context
  try {
    const { stdout } = await execAsync(`curl -s -X POST ${baseUrl}/api/ai/chat -H "Content-Type: application/json" -d '{"message":"Dividir R$ 120 entre 4 pessoas","conversationId":"123e4567-e89b-12d3-a456-426614174000","culturalContext":{"region":"São Paulo","scenario":"restaurante","groupType":"amigos","timeOfDay":"jantar"},"userPreferences":{"language":"pt-BR","formalityLevel":"informal","region":"São Paulo","paymentPreference":"pix"}}'`);
    const response = JSON.parse(stdout);
    const passed = response.success === true;
    results.push({ test: 'Brazilian cultural context', passed, expected: true, got: response.success });
    console.log(`✅ Brazilian cultural context: ${passed ? 'PASS' : 'FAIL'} (Expected: true, Got: ${response.success})`);
  } catch (error) {
    results.push({ test: 'Brazilian cultural context', passed: false, error: 'Server not responding' });
    console.log('❌ Brazilian cultural context: FAIL - Server not responding');
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  console.log('\n🔍 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.test}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Issues found
  const issues = results.filter(r => !r.passed);
  if (issues.length > 0) {
    console.log('\n🚨 Issues Found:');
    issues.forEach(issue => {
      console.log(`• ${issue.test}: ${issue.error || `Expected ${issue.expected}, got ${issue.got}`}`);
    });
  }

  console.log('\n🎯 Testing Complete!');
}

// Run the tests
testAllAPIs().catch(console.error); 