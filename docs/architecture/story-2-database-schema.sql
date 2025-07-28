-- ============================================================================
-- RachaAI - Story 2: Database Foundation Schema
-- Brazilian AI-First Bill Splitter with LGPD Compliance
-- Designed by: Carlos Mendoza, AI Infrastructure Architect
-- ============================================================================

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
    role VARCHAR(20) DEFAULT 'member', -- admin, member, viewer
    permissions JSONB DEFAULT '{}',
    
    -- Member status
    status VARCHAR(20) DEFAULT 'active', -- pending, active, left, removed
    invited_by UUID REFERENCES user_profiles(id),
    
    -- Join/leave tracking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Notification preferences for this group
    notification_settings JSONB DEFAULT '{}',
    
    UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX idx_group_members_group_id ON group_members (group_id);
CREATE INDEX idx_group_members_user_id ON group_members (user_id);
CREATE INDEX idx_group_members_active ON group_members (group_id, user_id) WHERE status = 'active';

-- ============================================================================
-- 4. CONVERSATIONS (AI Chat History)
-- ============================================================================

-- Partitioned table for conversation scalability
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
    
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (Brazilian data retention compliance)
CREATE TABLE conversations_2024_01 PARTITION OF conversations
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE conversations_2024_02 PARTITION OF conversations
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Add more partitions as needed

-- Indexes
CREATE INDEX idx_conversations_group_id ON conversations (group_id);
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_updated_at ON conversations (updated_at);

-- ============================================================================
-- 5. MESSAGES (Conversation Messages)
-- ============================================================================

-- Partitioned table for message scalability
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint will be added after partition creation
    CONSTRAINT messages_conversation_fk 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE messages_2024_01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE messages_2024_02 PARTITION OF messages
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

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
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Expense metadata
    category VARCHAR(50), -- restaurant, transport, accommodation, groceries, etc.
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    
    -- Who paid initially
    paid_by UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Split configuration
    split_method VARCHAR(20) DEFAULT 'equal', -- equal, weighted, custom, percentage
    split_configuration JSONB DEFAULT '{}', -- Custom split rules
    
    -- AI assistance
    ai_suggested BOOLEAN DEFAULT FALSE,
    ai_categorized BOOLEAN DEFAULT FALSE,
    ai_metadata JSONB DEFAULT '{}',
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, settled, disputed
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_expenses_group_id ON expenses (group_id);
CREATE INDEX idx_expenses_paid_by ON expenses (paid_by);
CREATE INDEX idx_expenses_date ON expenses (expense_date);
CREATE INDEX idx_expenses_status ON expenses (status);
CREATE INDEX idx_expenses_amount ON expenses (total_amount);

-- ============================================================================
-- 7. EXPENSE PARTICIPANTS (Who participates in each expense)
-- ============================================================================

CREATE TABLE expense_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Participation details
    amount_owed DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(5,2), -- For percentage-based splits
    weight DECIMAL(5,2), -- For weighted splits
    
    -- Payment status
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, waived
    paid_amount DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(expense_id, user_id)
);

-- Indexes
CREATE INDEX idx_expense_participants_expense_id ON expense_participants (expense_id);
CREATE INDEX idx_expense_participants_user_id ON expense_participants (user_id);
CREATE INDEX idx_expense_participants_status ON expense_participants (payment_status);

-- ============================================================================
-- 8. SETTLEMENTS (Payment tracking between users)
-- ============================================================================

CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id),
    
    -- Settlement parties
    payer_id UUID NOT NULL REFERENCES user_profiles(id),
    payee_id UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Settlement details
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    description TEXT,
    
    -- Related expenses (many-to-many through junction table)
    settlement_method VARCHAR(30), -- pix, cash, bank_transfer, other
    reference_id VARCHAR(100), -- PIX key, transaction ID, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, rejected
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent self-payments
    CHECK (payer_id != payee_id)
);

-- Junction table for settlement-expense relationships
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

-- Consent management
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Consent details
    consent_type VARCHAR(50) NOT NULL, -- ai_processing, marketing, analytics, etc.
    consent_granted BOOLEAN NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Data access audit log
CREATE TABLE data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    
    -- Access details
    operation_type VARCHAR(50) NOT NULL, -- read, write, delete, export
    data_categories TEXT[] NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    purpose TEXT NOT NULL,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    accessed_by UUID REFERENCES user_profiles(id), -- Who performed the access
    
    -- Timestamps
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing records for LGPD Article 37
CREATE TABLE processing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Processing activity
    activity_name VARCHAR(200) NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    data_categories TEXT[] NOT NULL,
    
    -- Data subjects
    data_subject_categories TEXT[] NOT NULL,
    
    -- Recipients and transfers
    recipients TEXT[],
    international_transfers JSONB,
    
    -- Retention and security
    retention_period VARCHAR(100),
    security_measures TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. AI PERFORMANCE & COST TRACKING
-- ============================================================================

-- Daily cost tracking in BRL
CREATE TABLE daily_costs (
    date DATE PRIMARY KEY,
    
    -- Claude API costs
    claude_requests INTEGER DEFAULT 0,
    claude_tokens INTEGER DEFAULT 0,
    claude_cost_usd DECIMAL(10,4) DEFAULT 0,
    claude_cost_brl DECIMAL(10,4) DEFAULT 0,
    
    -- Supabase costs
    supabase_storage_gb DECIMAL(10,2) DEFAULT 0,
    supabase_bandwidth_gb DECIMAL(10,2) DEFAULT 0,
    supabase_cost_usd DECIMAL(10,4) DEFAULT 0,
    supabase_cost_brl DECIMAL(10,4) DEFAULT 0,
    
    -- Total costs
    total_cost_usd DECIMAL(10,4) DEFAULT 0,
    total_cost_brl DECIMAL(10,4) DEFAULT 0,
    
    -- Exchange rate used
    usd_brl_rate DECIMAL(6,4),
    
    -- Performance metrics
    average_response_time_ms INTEGER,
    cache_hit_rate DECIMAL(5,4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics for Brazilian users
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Operation details
    operation_type VARCHAR(50) NOT NULL,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    
    -- User context
    user_id UUID REFERENCES user_profiles(id),
    region VARCHAR(20) DEFAULT 'brasil',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Business context
    brazil_business_hours BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
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
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
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

-- User can only access their own profile
CREATE POLICY user_profiles_access ON user_profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id);

-- Group access: members can view, creators can modify
CREATE POLICY groups_view ON groups
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY groups_modify ON groups
    FOR ALL
    TO authenticated
    USING (created_by = auth.uid());

-- Group members: view if member, modify if admin
CREATE POLICY group_members_view ON group_members
    FOR SELECT
    TO authenticated
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Conversations: view if group member
CREATE POLICY conversations_access ON conversations
    FOR ALL
    TO authenticated
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        OR user_id = auth.uid()
    );

-- Messages: view if conversation participant
CREATE POLICY messages_access ON messages
    FOR ALL
    TO authenticated
    USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = auth.uid() 
            OR group_id IN (
                SELECT group_id FROM group_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Expenses: view if group member
CREATE POLICY expenses_access ON expenses
    FOR ALL
    TO authenticated
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Expense participants: view if participant or group member
CREATE POLICY expense_participants_access ON expense_participants
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        OR expense_id IN (
            SELECT id FROM expenses 
            WHERE group_id IN (
                SELECT group_id FROM group_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Settlements: view if payer or payee or group member
CREATE POLICY settlements_access ON settlements
    FOR ALL
    TO authenticated
    USING (
        payer_id = auth.uid()
        OR payee_id = auth.uid()
        OR group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- LGPD tables: users can only access their own data
CREATE POLICY consent_records_access ON consent_records
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY data_access_log_view ON data_access_log
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- 13. USEFUL VIEWS FOR APPLICATION
-- ============================================================================

-- User's group summary
CREATE VIEW user_groups_summary AS
SELECT 
    gm.user_id,
    g.id as group_id,
    g.name as group_name,
    g.group_type,
    gm.role,
    gm.joined_at,
    (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.status = 'active') as member_count,
    (SELECT COUNT(*) FROM expenses e WHERE e.group_id = g.id AND e.status != 'settled') as pending_expenses
FROM group_members gm
JOIN groups g ON gm.group_id = g.id
WHERE gm.status = 'active' AND g.status = 'active';

-- Group balance summary
CREATE VIEW group_balances AS
SELECT 
    g.id as group_id,
    g.name as group_name,
    up.id as user_id,
    up.display_name,
    COALESCE(
        (SELECT SUM(ep.amount_owed - ep.paid_amount) 
         FROM expense_participants ep 
         JOIN expenses e ON ep.expense_id = e.id 
         WHERE e.group_id = g.id AND ep.user_id = up.id),
        0
    ) as balance
FROM groups g
CROSS JOIN user_profiles up
JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = up.id
WHERE g.status = 'active' AND gm.status = 'active';

-- Recent AI conversations
CREATE VIEW recent_conversations AS
SELECT 
    c.id,
    c.title,
    c.conversation_type,
    g.name as group_name,
    up.display_name as user_name,
    c.total_tokens_used,
    c.total_cost_brl,
    c.updated_at,
    (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
FROM conversations c
LEFT JOIN groups g ON c.group_id = g.id
JOIN user_profiles up ON c.user_id = up.id
WHERE c.status = 'active'
ORDER BY c.updated_at DESC;

-- ============================================================================
-- 14. INITIAL DATA SETUP
-- ============================================================================

-- Insert default processing records for LGPD compliance
INSERT INTO processing_records (
    activity_name,
    purpose,
    legal_basis,
    data_categories,
    data_subject_categories,
    recipients,
    international_transfers,
    retention_period,
    security_measures
) VALUES 
(
    'RachaAI Conversational Assistant',
    'Provide AI-powered bill splitting assistance and group management',
    'Legitimate Interest',
    ARRAY['conversation_history', 'user_preferences', 'group_interactions'],
    ARRAY['RachaAI users', 'Group members'],
    ARRAY['Anthropic (Claude API)'],
    '{"transfers": [{"country": "United States", "adequacy": "Standard Contractual Clauses", "safeguards": ["encryption", "data_minimization"]}]}'::jsonb,
    '2 years or user deletion request',
    ARRAY['AES-256 encryption', 'TLS 1.3', 'Access controls', 'Audit logging']
),
(
    'Bill Splitting Calculations',
    'Calculate expense splits and manage group finances',
    'Contract Execution',
    ARRAY['expense_data', 'payment_information', 'split_preferences'],
    ARRAY['Group participants'],
    ARRAY[],
    '{}'::jsonb,
    '7 years (tax compliance)',
    ARRAY['Row Level Security', 'Data validation', 'Backup encryption']
);

-- ============================================================================
-- SCHEMA COMPLETE - Ready for Story 2 Implementation
-- ============================================================================ 