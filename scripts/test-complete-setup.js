const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🧪 RachaAI Complete Setup Test\n');

// Test 1: Environment Variables
console.log('📋 Test 1: Environment Variables');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY'
];

let envVarsOk = true;
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ Missing: ${varName}`);
    envVarsOk = false;
  } else {
    console.log(`✅ Found: ${varName}`);
  }
});

if (!envVarsOk) {
  console.log('\n⚠️ Some environment variables are missing. Please check your .env.local file.');
  process.exit(1);
}

console.log('\n✅ All required environment variables are present\n');

// Test 2: Supabase Connection
console.log('📋 Test 2: Supabase Connection');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Supabase connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log(`❌ Supabase connection error: ${error.message}`);
    return false;
  }
}

// Test 3: Database Schema
async function testDatabaseSchema() {
  console.log('\n📋 Test 3: Database Schema');
  
  const requiredTables = [
    'user_profiles',
    'groups',
    'group_members',
    'conversations',
    'messages',
    'expenses',
    'expense_participants',
    'settlements',
    'consent_records',
    'data_access_log',
    'processing_records',
    'daily_costs',
    'performance_metrics'
  ];
  
  let allTablesOk = true;
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`);
        allTablesOk = false;
      } else {
        console.log(`✅ Table ${tableName}: OK`);
      }
    } catch (error) {
      console.log(`❌ Table ${tableName}: ${error.message}`);
      allTablesOk = false;
    }
  }
  
  return allTablesOk;
}

// Test 4: Authentication Configuration
async function testAuthentication() {
  console.log('\n📋 Test 4: Authentication Configuration');
  
  try {
    // Test if auth is properly configured
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message.includes('JWT')) {
      console.log('✅ Authentication is configured (no user logged in, which is expected)');
      return true;
    } else if (error) {
      console.log(`❌ Authentication error: ${error.message}`);
      return false;
    } else {
      console.log('✅ Authentication is working');
      return true;
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    return false;
  }
}

// Test 5: Claude API
async function testClaudeAPI() {
  console.log('\n📋 Test 5: Claude API Integration');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ Claude API key not found');
    return false;
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      })
    });
    
    if (response.ok) {
      console.log('✅ Claude API connection successful');
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Claude API error: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Claude API connection failed: ${error.message}`);
    return false;
  }
}

// Test 6: Application Endpoints
async function testApplicationEndpoints() {
  console.log('\n📋 Test 6: Application Endpoints');
  
  try {
    // Test if the dev server is running
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      console.log('✅ Development server is running');
      return true;
    } else {
      console.log(`❌ Development server error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Development server not accessible: ${error.message}`);
    console.log('💡 Make sure to run: npm run dev');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...\n');
  
  const results = {
    envVars: envVarsOk,
    supabase: await testSupabaseConnection(),
    schema: await testDatabaseSchema(),
    auth: await testAuthentication(),
    claude: await testClaudeAPI(),
    endpoints: await testApplicationEndpoints()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Environment Variables: ${results.envVars ? '✅' : '❌'}`);
  console.log(`Supabase Connection: ${results.supabase ? '✅' : '❌'}`);
  console.log(`Database Schema: ${results.schema ? '✅' : '❌'}`);
  console.log(`Authentication: ${results.auth ? '✅' : '❌'}`);
  console.log(`Claude API: ${results.claude ? '✅' : '❌'}`);
  console.log(`Application Endpoints: ${results.endpoints ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! RachaAI is ready to use.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Visit: http://localhost:3000/auth-test');
    console.log('   2. Test user registration and login');
    console.log('   3. Test the AI chat functionality');
    console.log('   4. Create your first group and expense');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('   - Apply RLS policy fixes: npm run fix:rls');
    console.log('   - Start dev server: npm run dev');
    console.log('   - Check environment variables in .env.local');
  }
  
  return allPassed;
}

// Run the tests
runAllTests().catch(console.error); 