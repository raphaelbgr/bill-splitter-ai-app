# Database Schema Documentation

## Overview

This document provides comprehensive documentation for the RachaAI database schema, designed with LGPD compliance and Brazilian market requirements in mind.

## Database Architecture

### Technology Stack
- **Database:** PostgreSQL (via Supabase)
- **Region:** São Paulo, Brazil (for LGPD compliance)
- **Authentication:** Supabase Auth
- **Security:** Row Level Security (RLS)
- **Encryption:** At-rest encryption for sensitive data

### Schema Design Principles

1. **LGPD Compliance First**
   - User consent tracking for all data collection
   - Data retention policies with automatic cleanup
   - Right to portability (data export)
   - Right to be forgotten (data deletion)

2. **Brazilian Market Adaptation**
   - CPF/CNPJ support for user identification
   - Brazilian phone number format
   - Brazilian address format
   - Portuguese language support

3. **Security by Design**
   - Row Level Security (RLS) policies
   - Encrypted sensitive fields
   - Audit logging for data access
   - Secure authentication flow

## Core Tables

### 1. user_profiles

**Purpose:** Store user profile information with LGPD compliance

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT, -- Encrypted field
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  data_retention_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- CPF/CNPJ field for Brazilian user identification
- Consent tracking for LGPD compliance
- Data retention policy enforcement
- Brazilian phone number support

**RLS Policies:**
```sql
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. groups

**Purpose:** Manage bill splitting groups

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- Group management for bill splitting
- Creator tracking for accountability
- Flexible group naming and description

### 3. group_members

**Purpose:** Many-to-many relationship between users and groups

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

**Key Features:**
- Role-based access control
- Automatic cleanup on group/user deletion
- Join date tracking

### 4. conversations

**Purpose:** Store AI conversation history with retention policies

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  ai_response TEXT,
  processed_at TIMESTAMP DEFAULT NOW(),
  retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- 90-day retention policy for LGPD compliance
- AI response storage for context
- Automatic cleanup of expired conversations

### 5. messages

**Purpose:** Individual message storage for better conversation structure

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('user', 'ai')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- Structured message storage
- Message type differentiation (user vs AI)
- Automatic cleanup with conversation deletion

### 6. expenses

**Purpose:** Store bill splitting expenses

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  paid_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- Brazilian currency (BRL) support
- Group association for bill splitting
- Payer tracking for accountability

### 7. expense_participants

**Purpose:** Track who owes what in each expense

```sql
CREATE TABLE expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  amount_owed DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'settled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- Detailed debt tracking
- Payment status management
- Amount owed vs paid tracking

### 8. settlements

**Purpose:** Track debt settlements between users

```sql
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES user_profiles(id),
  to_user_id UUID REFERENCES user_profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  payment_method TEXT, -- 'pix', 'transfer', 'cash'
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- PIX payment method support
- Settlement status tracking
- Brazilian payment methods

## LGPD Compliance Tables

### 9. consent_records

**Purpose:** Track user consent for LGPD compliance

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  consent_type TEXT NOT NULL, -- 'data_processing', 'marketing', 'analytics'
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  purpose TEXT NOT NULL,
  retention_period_days INTEGER DEFAULT 90,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- Granular consent tracking
- Purpose limitation
- Retention period specification
- Consent revocation support

### 10. data_access_log

**Purpose:** Audit log for data access (LGPD transparency)

```sql
CREATE TABLE data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  access_type TEXT NOT NULL, -- 'view', 'export', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

**Key Features:**
- Complete audit trail
- IP address logging
- User agent tracking
- Access type categorization

### 11. processing_records

**Purpose:** Track AI processing activities (LGPD transparency)

```sql
CREATE TABLE processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  model_used TEXT NOT NULL, -- 'claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'
  tokens_used INTEGER NOT NULL,
  cost_brl DECIMAL(10,4) NOT NULL,
  processing_time_ms INTEGER,
  retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**
- AI model usage tracking
- Cost monitoring
- Performance metrics
- Retention policy enforcement

## Analytics Tables

### 12. daily_costs

**Purpose:** Track daily API costs for budget management

```sql
CREATE TABLE daily_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  date DATE NOT NULL,
  total_cost_brl DECIMAL(10,4) DEFAULT 0,
  haiku_cost_brl DECIMAL(10,4) DEFAULT 0,
  sonnet_cost_brl DECIMAL(10,4) DEFAULT 0,
  opus_cost_brl DECIMAL(10,4) DEFAULT 0,
  requests_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**Key Features:**
- Daily cost aggregation
- Model-specific cost tracking
- Request count monitoring
- Budget management support

### 13. performance_metrics

**Purpose:** Track application performance metrics

```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  user_id UUID REFERENCES user_profiles(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

**Key Features:**
- Flexible metric tracking
- User-specific metrics
- Metadata support for detailed analysis

## Indexes and Performance

### Primary Indexes
```sql
-- User profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_consent ON user_profiles(consent_given, consent_date);

-- Conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_retention ON conversations(retention_until);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Expenses
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);

-- Settlements
CREATE INDEX idx_settlements_from_user ON settlements(from_user_id);
CREATE INDEX idx_settlements_to_user ON settlements(to_user_id);
CREATE INDEX idx_settlements_status ON settlements(status);

-- LGPD Compliance
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_granted ON consent_records(granted, granted_at);
CREATE INDEX idx_data_access_log_user_id ON data_access_log(user_id);
CREATE INDEX idx_processing_records_user_id ON processing_records(user_id);
```

## Data Retention Policies

### Automatic Cleanup
```sql
-- Clean up expired conversations (90 days)
DELETE FROM conversations 
WHERE retention_until < NOW();

-- Clean up expired consent records (2 years for legal compliance)
DELETE FROM consent_records 
WHERE granted_at < NOW() - INTERVAL '2 years' 
AND revoked_at IS NULL;

-- Clean up old processing records (90 days)
DELETE FROM processing_records 
WHERE retention_until < NOW();

-- Clean up old data access logs (1 year)
DELETE FROM data_access_log 
WHERE accessed_at < NOW() - INTERVAL '1 year';
```

## Security Measures

### Row Level Security (RLS)
All tables have RLS policies to ensure users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Example RLS policy
CREATE POLICY "Users can access own data" ON user_profiles
  FOR ALL USING (auth.uid() = id);
```

### Data Encryption
Sensitive fields are encrypted at rest:
- CPF/CNPJ numbers
- Phone numbers
- Payment information

### Audit Logging
All data access is logged for transparency:
- User data exports
- Data deletions
- Consent changes
- AI processing activities

## Backup and Recovery

### Automated Backups
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup replication
- 30-day backup retention

### Recovery Procedures
1. **Data Export:** Users can export all their data
2. **Data Deletion:** Users can request complete data deletion
3. **Account Recovery:** Secure account recovery process
4. **Backup Restoration:** Automated backup restoration procedures

## Monitoring and Alerts

### Key Metrics
- Database performance (query times, connection count)
- Storage usage and growth
- Backup success/failure rates
- Security events and access patterns
- LGPD compliance metrics

### Alert Thresholds
- Storage usage > 80%
- Query response time > 2 seconds
- Failed backup attempts
- Unusual access patterns
- Consent policy violations

## Brazilian Market Adaptations

### Regional Considerations
- **São Paulo Region:** All data stored in Brazil for LGPD compliance
- **Portuguese Language:** All user-facing content in Portuguese
- **Brazilian Currency:** BRL as default currency
- **Local Payment Methods:** PIX integration support
- **Cultural Context:** Brazilian expense scenarios and social dynamics

### Compliance Features
- **CPF/CNPJ Support:** Brazilian tax ID validation
- **Phone Number Format:** Brazilian phone number validation
- **Address Format:** Brazilian address structure
- **Consent Management:** LGPD-compliant consent tracking
- **Data Sovereignty:** All data stays within Brazil

---

*This schema provides a robust foundation for RachaAI with full LGPD compliance and Brazilian market adaptation.* 