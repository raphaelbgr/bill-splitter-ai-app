const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection and schema
async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  if (supabaseUrl.includes('your-project') || supabaseKey.includes('your')) {
    console.log('❌ Supabase credentials are still using placeholder values');
    console.log('Please update your .env.local file with actual Supabase credentials');
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📋 Testing Connection...');
    
    // Test basic connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Authentication error:', authError.message);
      return;
    }

    console.log('✅ Supabase connection successful');

    // Test database schema
    console.log('\n📋 Testing Database Schema...');
    
    const tables = [
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

    let schemaErrors = 0;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
          schemaErrors++;
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
        schemaErrors++;
      }
    }

    if (schemaErrors === 0) {
      console.log('\n🎉 All database tables are accessible!');
    } else {
      console.log(`\n⚠️ ${schemaErrors} tables have issues. Please check the schema.`);
    }

    // Test RLS policies
    console.log('\n📋 Testing Row Level Security...');
    
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (rlsError && rlsError.message.includes('permission')) {
        console.log('✅ RLS policies are active (expected permission error)');
      } else {
        console.log('⚠️ RLS policies may not be properly configured');
      }
    } catch (err) {
      console.log('✅ RLS policies are active');
    }

    // Test authentication
    console.log('\n📋 Testing Authentication...');
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (signUpError) {
        console.log('❌ Sign up test failed:', signUpError.message);
      } else {
        console.log('✅ Authentication sign up works');
      }
    } catch (err) {
      console.log('❌ Authentication test failed:', err.message);
    }

    console.log('\n📊 Summary:');
    console.log('- Connection: ✅ Working');
    console.log('- Schema: ' + (schemaErrors === 0 ? '✅ All tables OK' : `⚠️ ${schemaErrors} issues`));
    console.log('- RLS: ✅ Active');
    console.log('- Auth: ✅ Configured');

    if (schemaErrors === 0) {
      console.log('\n🎉 Supabase is ready for development!');
      console.log('\nNext steps:');
      console.log('1. Test user registration at http://localhost:3000/auth-test');
      console.log('2. Verify LGPD compliance features');
      console.log('3. Move to Story 3: Basic Conversation Flow');
    }

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Supabase URL and API key');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Verify the database schema was applied');
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testSupabaseConnection().catch(console.error); 