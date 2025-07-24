-- ============================================================================
-- RachaAI - Complete Database Reset and Setup
-- Brazilian AI-First Bill Splitter with LGPD Compliance
-- ============================================================================

-- Drop all existing tables and policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
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
DROP POLICY IF EXISTS "Users can view own consent records" ON consent_records;
DROP POLICY IF EXISTS "Users can view own data access log" ON data_access_log;
DROP POLICY IF EXISTS "Users can view own processing records" ON processing_records;

-- Drop all tables
DROP TABLE IF EXISTS settlement_expenses CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS expense_participants CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS consent_records CASCADE;
DROP TABLE IF EXISTS data_access_log CASCADE;
DROP TABLE IF EXISTS processing_records CASCADE;
DROP TABLE IF EXISTS daily_costs CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;

-- Drop views
DROP VIEW IF EXISTS user_groups_summary CASCADE;
DROP VIEW IF EXISTS group_balances CASCADE;
DROP VIEW IF EXISTS recent_conversations CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 1. USERS & AUTHENTICATION (LGPD Compliant)
-- ============================================================================

-- Enhanced user profiles with Brazilian market requirements
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic profile information
    display_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    
    -- Brazilian specific fields
    cpf VARCHAR(14) UNIQUE, -- Format: XXX.XXX.XXX-XX (encrypted)
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- User preferences
    notification_preferences JSONB DEFAULT '{}',
    ai_preferences JSONB DEFAULT '{}',
    
    -- LGPD compliance fields
    consent_version VARCHAR(20) DEFAULT '2024.1',
    marketing_consent BOOLEAN DEFAULT FALSE,
    ai_processing_consent BOOLEAN DEFAULT FALSE,
    data_retention_until TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete for LGPD compliance
    deleted_at TIMESTAMP WITH TIME ZONE,
    deletion_reason VARCHAR(100)
);

-- Index for performance
CREATE INDEX idx_user_profiles_cpf_hash ON user_profiles USING HASH (cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_user_profiles_active ON user_profiles (last_active_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_timezone ON user_profiles (timezone);

-- ============================================================================
-- 2. GROUPS (Bill Splitting Groups)
-- ============================================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Group information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(20) DEFAULT 'casual', -- casual, recurring, event, travel
    
    -- Group settings
    default_split_method VARCHAR(20) DEFAULT 'equal', -- equal, weighted, custom
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Group admin/ownership
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Group status
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    
    -- AI assistance settings
    ai_enabled BOOLEAN DEFAULT TRUE,
    ai_suggestions_enabled BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_groups_created_by ON groups (created_by);
CREATE INDEX idx_groups_status ON groups (status) WHERE status = 'active';
CREATE INDEX idx_groups_created_at ON groups (created_at);

-- ============================================================================
-- 3. GROUP MEMBERS (Many-to-Many Relationship)
-- ============================================================================

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Member role and permissions
    role VARCHAR(20) DEFAULT 'member', -- admin, member, guest
    permissions JSONB DEFAULT '{}',
    
    -- Member status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked
    
    -- Brazilian specific
    preferred_payment_method VARCHAR(50),
    pix_key VARCHAR(100),
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_members_group_id ON group_members (group_id);
CREATE INDEX idx_group_members_user_id ON group_members (user_id);
CREATE INDEX idx_group_members_active ON group_members (group_id, user_id) WHERE status = 'active';

-- ============================================================================
-- 4. CONVERSATIONS (AI Chat History)
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Conversation context
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Conversation metadata
    title VARCHAR(200),
    conversation_type VARCHAR(30) DEFAULT 'general', -- general, expense_split, group_admin, ai_help
    
    -- AI context preservation
    context_summary TEXT,
    ai_model_used VARCHAR(50),
    total_tokens_used INTEGER DEFAULT 0,
    total_cost_brl DECIMAL(10,4) DEFAULT 0,
    
    -- Brazilian localization
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    
    -- LGPD compliance
    contains_pii BOOLEAN DEFAULT FALSE,
    data_retention_until TIMESTAMP WITH TIME ZONE,
    
    -- Status and timestamps
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_group_id ON conversations (group_id);
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_updated_at ON conversations (updated_at);
CREATE INDEX idx_conversations_created_at ON conversations (created_at);

-- ============================================================================
-- 5. MESSAGES (Conversation Messages)
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message content
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    
    -- AI processing metadata
    tokens_used INTEGER,
    model_used VARCHAR(50),
    cost_brl DECIMAL(10,4),
    processing_time_ms INTEGER,
    
    -- Message metadata
    message_type VARCHAR(30) DEFAULT 'text', -- text, expense_suggestion, split_calculation
    metadata JSONB DEFAULT '{}',
    
    -- LGPD compliance
    contains_pii BOOLEAN DEFAULT FALSE,
    anonymized BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_created_at ON messages (created_at);
CREATE INDEX idx_messages_role ON messages (role);

-- ============================================================================
-- 6. EXPENSES (Bills to be Split)
-- ============================================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    
    -- Expense details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Payment information
    paid_by UUID NOT NULL REFERENCES user_profiles(id),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Brazilian specific
    category VARCHAR(50), -- food, transport, entertainment, etc.
    payment_method VARCHAR(50), -- pix, credit_card, cash, etc.
    receipt_url TEXT,
    
    -- Split configuration
    split_method VARCHAR(20) DEFAULT 'equal', -- equal, weighted, custom
    split_configuration JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, settled, cancelled
    
    -- AI processing
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_suggestions JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_expenses_group_id ON expenses (group_id);
CREATE INDEX idx_expenses_paid_by ON expenses (paid_by);
CREATE INDEX idx_expenses_date ON expenses (expense_date);
CREATE INDEX idx_expenses_status ON expenses (status);
CREATE INDEX idx_expenses_amount ON expenses (total_amount);

-- ============================================================================
-- 7. EXPENSE PARTICIPANTS (Who owes what)
-- ============================================================================

CREATE TABLE expense_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Amount details
    amount_owed DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Payment status
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid
    payment_method VARCHAR(50),
    
    -- Brazilian specific
    pix_key VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint
    UNIQUE(expense_id, user_id)
);

-- Indexes
CREATE INDEX idx_expense_participants_expense_id ON expense_participants (expense_id);
CREATE INDEX idx_expense_participants_user_id ON expense_participants (user_id);
CREATE INDEX idx_expense_participants_status ON expense_participants (payment_status);

-- ============================================================================
-- 8. SETTLEMENTS (Debt Resolution)
-- ============================================================================

CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    
    -- Settlement details
    payer_id UUID NOT NULL REFERENCES user_profiles(id),
    payee_id UUID NOT NULL REFERENCES user_profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Brazilian payment methods
    payment_method VARCHAR(50), -- pix, bank_transfer, cash
    pix_key VARCHAR(100),
    bank_account_info JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure payer != payee
    CONSTRAINT settlements_different_users CHECK (payer_id != payee_id)
);

-- Junction table for settlements and expenses
CREATE TABLE settlement_expenses (
    settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    PRIMARY KEY (settlement_id, expense_id)
);

-- Indexes
CREATE INDEX idx_settlements_group_id ON settlements (group_id);
CREATE INDEX idx_settlements_payer_id ON settlements (payer_id);
CREATE INDEX idx_settlements_payee_id ON settlements (payee_id);
CREATE INDEX idx_settlements_status ON settlements (status);

-- ============================================================================
-- 9. LGPD COMPLIANCE TABLES
-- ============================================================================

-- Consent records for LGPD compliance
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Consent details
    consent_type VARCHAR(50) NOT NULL, -- marketing, ai_processing, data_sharing
    consent_version VARCHAR(20) NOT NULL,
    granted BOOLEAN NOT NULL,
    
    -- Consent metadata
    ip_address INET,
    user_agent TEXT,
    consent_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint
    UNIQUE(user_id, consent_type, consent_version)
);

-- Data access log for LGPD compliance
CREATE TABLE data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Access details
    access_type VARCHAR(50) NOT NULL, -- view, export, delete, update
    table_name VARCHAR(50),
    record_id UUID,
    
    -- Access metadata
    ip_address INET,
    user_agent TEXT,
    request_details JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI processing records for LGPD compliance
CREATE TABLE processing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Processing details
    processing_type VARCHAR(50) NOT NULL, -- expense_parsing, split_calculation, ai_suggestion
    data_processed JSONB,
    
    -- AI model details
    model_used VARCHAR(50),
    tokens_used INTEGER,
    cost_brl DECIMAL(10,4),
    
    -- LGPD compliance
    legal_basis VARCHAR(100), -- consent, legitimate_interest, contract
    data_retention_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. PERFORMANCE & COST TRACKING
-- ============================================================================

-- Daily cost tracking
CREATE TABLE daily_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    
    -- Cost breakdown
    total_tokens INTEGER DEFAULT 0,
    total_cost_brl DECIMAL(10,4) DEFAULT 0,
    haiku_cost_brl DECIMAL(10,4) DEFAULT 0,
    sonnet_cost_brl DECIMAL(10,4) DEFAULT 0,
    opus_cost_brl DECIMAL(10,4) DEFAULT 0,
    
    -- Usage metrics
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(date)
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Metric details
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20),
    
    -- Context
    user_id UUID REFERENCES user_profiles(id),
    group_id UUID REFERENCES groups(id),
    conversation_id UUID REFERENCES conversations(id),
    
    -- Metadata
    tags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 12. SIMPLE RLS POLICIES (Development Ready)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_records ENABLE ROW LEVEL SECURITY;

-- Simple policies for development (allows authenticated users)
CREATE POLICY "Enable all for authenticated users" ON user_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON group_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON expense_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON settlements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON consent_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON data_access_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON processing_records FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 13. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- User groups summary view
CREATE VIEW user_groups_summary AS
SELECT 
    u.id as user_id,
    u.display_name,
    g.id as group_id,
    g.name as group_name,
    gm.role as member_role,
    g.created_at as joined_at
FROM user_profiles u
JOIN group_members gm ON u.id = gm.user_id
JOIN groups g ON gm.group_id = g.id
WHERE gm.status = 'active' AND g.status = 'active';

-- Group balances view
CREATE VIEW group_balances AS
SELECT 
    g.id as group_id,
    g.name as group_name,
    u.id as user_id,
    u.display_name,
    COALESCE(SUM(ep.amount_owed - ep.amount_paid), 0) as balance
FROM groups g
JOIN group_members gm ON g.id = gm.group_id
JOIN user_profiles u ON gm.user_id = u.id
LEFT JOIN expense_participants ep ON u.id = ep.user_id
LEFT JOIN expenses e ON ep.expense_id = e.id AND e.group_id = g.id
WHERE gm.status = 'active' AND g.status = 'active'
GROUP BY g.id, g.name, u.id, u.display_name;

-- Recent conversations view
CREATE VIEW recent_conversations AS
SELECT 
    c.id,
    c.title,
    c.conversation_type,
    c.created_at,
    c.last_message_at,
    g.name as group_name,
    u.display_name as user_name
FROM conversations c
JOIN groups g ON c.group_id = g.id
JOIN user_profiles u ON c.user_id = u.id
WHERE c.status = 'active'
ORDER BY c.last_message_at DESC;

-- ============================================================================
-- END OF RESET AND SETUP
-- ============================================================================ 