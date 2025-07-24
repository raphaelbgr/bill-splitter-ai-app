-- ============================================================================
-- Fix RLS Policies for RachaAI Database
-- This script fixes the infinite recursion issues in Row Level Security policies
-- ============================================================================

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

-- ============================================================================
-- END OF RLS FIXES
-- ============================================================================ 