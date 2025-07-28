const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Applying Simple RLS Policies Directly...\n');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySimpleRLS() {
  try {
    console.log('📋 Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    console.log('🔧 Since direct SQL execution is not available,');
    console.log('you need to apply the simple RLS fix manually:');
    console.log('\n1. 📊 Go to your Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/[your-project-id]');
    console.log('\n2. 🗂️ Navigate to SQL Editor');
    console.log('\n3. 📝 Copy and paste this SQL:');
    console.log('\n' + '='.repeat(60));
    console.log(`
-- Disable RLS temporarily
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE settlements DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can view conversations in their groups" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can view expenses in their groups" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expense participants" ON expense_participants;
DROP POLICY IF EXISTS "Users can view settlements in their groups" ON settlements;
DROP POLICY IF EXISTS "Users can create settlements" ON settlements;

-- Re-enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Create simple policies for development
CREATE POLICY "Enable all for authenticated users" ON groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON group_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON expense_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON settlements FOR ALL USING (auth.role() = 'authenticated');
`);
    console.log('='.repeat(60));
    console.log('\n4. ▶️ Click "Run" to execute');
    console.log('\n5. ✅ Test again: npm run test:complete');
    
    console.log('\n⚠️ What this does:');
    console.log('   - Temporarily disables RLS on problematic tables');
    console.log('   - Drops all complex policies causing recursion');
    console.log('   - Re-enables RLS with simple policies');
    console.log('   - Allows all authenticated users to access data');
    
    console.log('\n🚀 After applying this fix:');
    console.log('   npm run test:complete');
    console.log('   npm run dev');
    console.log('   Visit: http://localhost:3000/auth-test');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run the fix
applySimpleRLS().catch(console.error); 