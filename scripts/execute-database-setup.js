const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🗄️ Executing RachaAI Database Setup via Supabase Client...\n');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeDatabaseSetup() {
  try {
    console.log('📋 Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    console.log('🗑️ Starting database reset and setup...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'reset-and-setup-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    console.log(`📊 File size: ${sqlContent.length} characters`);
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n🚀 Executing SQL statements...\n');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          // Execute the statement using Supabase's REST API
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // If exec_sql doesn't exist, try alternative approach
            console.log(`⚠️ Statement ${i + 1}: ${error.message}`);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1}: Success`);
            successCount++;
          }
        } catch (e) {
          console.log(`❌ Statement ${i + 1}: ${e.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Execution Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📋 Total: ${statements.length}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ Some statements failed. This is expected if:');
      console.log('   - The exec_sql function is not available');
      console.log('   - Some tables already exist');
      console.log('   - Some policies already exist');
      
      console.log('\n🔧 Alternative approach:');
      console.log('Since automatic SQL execution has limitations, you can:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy the content from: scripts/reset-and-setup-database.sql');
      console.log('4. Paste and execute it manually');
    } else {
      console.log('\n🎉 Database setup completed successfully!');
    }
    
    console.log('\n🧪 Testing the setup...');
    
    // Test if tables are accessible
    const testTables = [
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
    
    let accessibleTables = 0;
    
    for (const table of testTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
          accessibleTables++;
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }
    
    console.log(`\n📊 Table Accessibility: ${accessibleTables}/${testTables.length}`);
    
    if (accessibleTables === testTables.length) {
      console.log('\n🎉 All tables are accessible! Database setup is complete.');
      console.log('\n🚀 Next steps:');
      console.log('   npm run test:complete');
      console.log('   npm run dev');
      console.log('   Visit: http://localhost:3000/auth-test');
    } else {
      console.log('\n⚠️ Some tables are not accessible. Please check the setup.');
    }
    
    return accessibleTables === testTables.length;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run the setup
executeDatabaseSetup().catch(console.error); 