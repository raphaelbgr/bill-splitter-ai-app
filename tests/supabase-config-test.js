const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testSupabaseConfig() {
  console.log('🔧 Testing Supabase Configuration...\n');

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  console.log('📋 Environment Variables Check:');
  for (const envVar of requiredEnvVars) {
    try {
      const { stdout } = await execAsync(`grep -o "${envVar}=[^\\n]*" .env.local 2>/dev/null || echo "NOT_FOUND"`);
      const isSet = !stdout.includes('NOT_FOUND') && stdout.trim().length > 0;
      console.log(`${isSet ? '✅' : '❌'} ${envVar}: ${isSet ? 'Set' : 'Not set'}`);
      if (isSet) {
        const value = stdout.split('=')[1];
        console.log(`   Value: ${value.substring(0, 20)}...`);
      }
    } catch (error) {
      console.log(`❌ ${envVar}: Error checking`);
    }
  }

  // Test Supabase connection
  console.log('\n🔗 Supabase Connection Test:');
  try {
    const { stdout } = await execAsync(`curl -s -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass123","display_name":"Test User"}'`);
    const response = JSON.parse(stdout);
    
    if (response.error && response.error.includes('Configuração do Supabase')) {
      console.log('❌ Supabase Configuration: INVALID');
      console.log(`   Error: ${response.error}`);
    } else if (response.error && response.error.includes('invalid')) {
      console.log('⚠️  Supabase Configuration: PARTIALLY WORKING');
      console.log(`   Error: ${response.error}`);
      console.log('   Note: This might be due to email validation or other Supabase settings');
    } else {
      console.log('✅ Supabase Configuration: WORKING');
    }
  } catch (error) {
    console.log('❌ Supabase Configuration: CANNOT TEST (Server not responding)');
  }

  console.log('\n💡 Recommendations:');
  console.log('1. Check if .env.local exists and contains Supabase credentials');
  console.log('2. Verify Supabase project is active and accessible');
  console.log('3. Ensure email confirmation is disabled for testing (if needed)');
  console.log('4. Check Supabase project settings for email validation rules');
  
  console.log('\n🎯 Configuration Test Complete!');
}

// Run the test
testSupabaseConfig().catch(console.error); 