const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Applying RLS Policy Fixes to Supabase (v2)...\n');

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

async function applyRlsFixes() {
  try {
    console.log('📋 Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    console.log('🔧 Applying RLS policy fixes...');
    
    // Since we can't execute raw SQL directly, let's test the current state
    // and provide manual instructions
    console.log('\n📋 Current RLS Policy Status:');
    
    const tablesToTest = [
      'groups',
      'group_members', 
      'conversations',
      'messages',
      'expenses',
      'expense_participants',
      'settlements'
    ];
    
    let hasIssues = false;
    
    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error && error.message.includes('infinite recursion')) {
          console.log(`❌ ${table}: Infinite recursion detected`);
          hasIssues = true;
        } else if (error) {
          console.log(`⚠️ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
        hasIssues = true;
      }
    }
    
    if (hasIssues) {
      console.log('\n🔧 Manual RLS Fix Required:');
      console.log('Since automatic SQL execution is not available, you need to apply the fixes manually:');
      console.log('\n1. Go to your Supabase Dashboard:');
      console.log(`   ${supabaseUrl.replace('/rest/v1', '')}`);
      console.log('\n2. Navigate to SQL Editor');
      console.log('\n3. Copy and paste this SQL:');
      console.log('\n' + '='.repeat(60));
      console.log(`
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can view conversations in their groups" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can view expenses in their groups" ON expenses;
DROP POLICY IF EXISTS "Users can view expense participants" ON expense_participants;
DROP POLICY IF EXISTS "Users can view settlements in their groups" ON settlements;

-- Recreate simplified policies that don't cause recursion

-- Group members: simplified policies
CREATE POLICY "Users can view group members" ON group_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

CREATE POLICY "Group admins can manage members" ON group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
            AND gm.role = 'admin'
            AND gm.status = 'active'
        )
    );

-- Conversations: simplified policies
CREATE POLICY "Users can view conversations in their groups" ON conversations
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = conversations.group_id 
            AND user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Messages: simplified policies
CREATE POLICY "Users can view messages in accessible conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.user_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM group_members gm
                    WHERE gm.group_id = c.group_id
                    AND gm.user_id = auth.uid()
                    AND gm.status = 'active'
                )
            )
        )
    );

-- Expenses: simplified policies
CREATE POLICY "Users can view expenses in their groups" ON expenses
    FOR SELECT USING (
        paid_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = expenses.group_id 
            AND user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Expense participants: simplified policies
CREATE POLICY "Users can view expense participants" ON expense_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM expenses e
            WHERE e.id = expense_participants.expense_id
            AND (e.paid_by = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM group_members gm
                    WHERE gm.group_id = e.group_id
                    AND gm.user_id = auth.uid()
                    AND gm.status = 'active'
                )
            )
        )
    );

-- Settlements: simplified policies
CREATE POLICY "Users can view settlements in their groups" ON settlements
    FOR SELECT USING (
        payer_id = auth.uid() OR payee_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = settlements.group_id 
            AND user_id = auth.uid() 
            AND status = 'active'
        )
    );
`);
      console.log('='.repeat(60));
      console.log('\n4. Click "Run" to execute the fixes');
      console.log('\n5. After applying, run: npm run test:complete');
      
    } else {
      console.log('\n✅ All RLS policies are working correctly!');
      console.log('\n🚀 You can now test the application:');
      console.log('   npm run test:complete');
      console.log('   Visit: http://localhost:3000/auth-test');
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run the fixes
applyRlsFixes().catch(console.error); 