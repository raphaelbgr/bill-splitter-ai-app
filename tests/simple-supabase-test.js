const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
async function testSupabase() {
  console.log('🔧 Simple Supabase Test...\n');

  const supabaseUrl = 'https://znfpaemebwlpcxdnftyr.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZnBhZW1lYndscGN4ZG5mdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDgxODEsImV4cCI6MjA2ODc4NDE4MX0.Q8Ol8oWvWTOdOf4r_kgQKV5M3Sjk5hdKDWcgL-lvmfc';

  console.log('📋 Configuration:');
  console.log(`✅ URL: ${supabaseUrl}`);
  console.log(`✅ Key: ${supabaseAnonKey.substring(0, 20)}...`);

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('\n🔗 Testing Supabase Connection...');
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Connection Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
    } else {
      console.log('✅ Supabase Connection: WORKING');
    }

    // Test 2: Try to sign up with a simple email
    console.log('\n👤 Testing Signup...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@test.com',
      password: 'testpass123'
    });

    if (authError) {
      console.log(`❌ Signup Error: ${authError.message}`);
      console.log(`   Code: ${authError.code}`);
      console.log(`   Status: ${authError.status}`);
    } else {
      console.log('✅ Signup: WORKING');
      console.log(`   User ID: ${authData.user?.id}`);
    }

  } catch (error) {
    console.log(`❌ Unexpected Error: ${error.message}`);
  }

  console.log('\n💡 Next Steps:');
  console.log('1. If connection fails: Check Supabase project status');
  console.log('2. If signup fails: Check Authentication settings in Supabase dashboard');
  console.log('3. Try disabling email confirmation in Supabase Auth settings');
  
  console.log('\n🎯 Test Complete!');
}

// Run the test
testSupabase().catch(console.error); 