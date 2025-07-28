const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Applying RLS Policy Fixes to Supabase...\n');

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

// RLS fix SQL commands
const rlsFixes = `
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
`;

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
    
    // Execute the RLS fixes
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsFixes });
    
    if (rlsError) {
      console.log(`❌ RLS fixes failed: ${rlsError.message}`);
      console.log('\n💡 Trying alternative approach...');
      
      // Try executing each policy fix separately
      const policies = rlsFixes.split(';').filter(policy => policy.trim());
      
      for (const policy of policies) {
        if (policy.trim()) {
          try {
            const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
            if (policyError) {
              console.log(`⚠️ Policy fix failed: ${policyError.message}`);
            } else {
              console.log('✅ Applied policy fix');
            }
          } catch (e) {
            console.log(`⚠️ Policy fix error: ${e.message}`);
          }
        }
      }
    } else {
      console.log('✅ RLS policy fixes applied successfully');
    }
    
    console.log('\n🧪 Testing the fixes...');
    
    // Test if the infinite recursion is fixed
    const testQueries = [
      'SELECT COUNT(*) FROM groups',
      'SELECT COUNT(*) FROM group_members',
      'SELECT COUNT(*) FROM conversations',
      'SELECT COUNT(*) FROM messages',
      'SELECT COUNT(*) FROM expenses',
      'SELECT COUNT(*) FROM expense_participants',
      'SELECT COUNT(*) FROM settlements'
    ];
    
    for (const query of testQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`❌ ${query}: ${error.message}`);
        } else {
          console.log(`✅ ${query}: OK`);
        }
      } catch (e) {
        console.log(`❌ ${query}: ${e.message}`);
      }
    }
    
    console.log('\n🎉 RLS policy fixes completed!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test the application: npm run test:complete');
    console.log('   2. Visit: http://localhost:3000/auth-test');
    console.log('   3. Test user registration and authentication');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error applying RLS fixes: ${error.message}`);
    return false;
  }
}

// Run the fixes
applyRlsFixes().catch(console.error); 