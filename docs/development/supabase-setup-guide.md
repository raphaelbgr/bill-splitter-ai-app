# Supabase Setup Guide for RachaAI

## Overview
This guide will help you set up Supabase for the RachaAI project with Brazilian region hosting and LGPD compliance.

## Step 1: Create Supabase Project

### 1.1 Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"

### 1.2 Project Configuration
- **Organization:** Your organization
- **Name:** `rachaai-brazilian-bill-splitter`
- **Database Password:** Generate a strong password (save it securely)
- **Region:** **São Paulo (Brazil)** - This is crucial for LGPD compliance
- **Pricing Plan:** Free tier (upgrade as needed)

### 1.3 Wait for Setup
- Database setup takes 2-3 minutes
- You'll receive an email when ready

## Step 2: Get Project Credentials

### 2.1 Access Project Settings
1. In your Supabase dashboard, go to your project
2. Navigate to **Settings** → **API**

### 2.2 Copy Credentials
You'll need these values for your `.env.local`:

```bash
# Replace these in your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Configure Database Schema

### 3.1 Access SQL Editor
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**

### 3.2 Run Database Schema
1. Copy the entire content from `docs/architecture/story-2-database-schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the schema

### 3.3 Verify Schema Creation
Check that these tables were created:
- `user_profiles`
- `groups`
- `group_members`
- `conversations`
- `messages`
- `expenses`
- `expense_participants`
- `settlements`
- `consent_records`
- `data_access_log`
- `processing_records`
- `daily_costs`
- `performance_metrics`

## Step 4: Configure Authentication

### 4.1 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates (optional)

### 4.2 Set Up Row Level Security
The schema already includes RLS policies, but verify they're enabled:
1. Go to **Authentication** → **Policies**
2. Ensure RLS is enabled on all tables

### 4.3 Configure Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize templates for Brazilian users:
   - **Confirm signup:** "Bem-vindo ao RachaAI! Confirme seu email."
   - **Magic link:** "Link de acesso para o RachaAI"
   - **Change email:** "Confirmação de alteração de email"

## Step 5: Test Authentication

### 5.1 Update Environment Variables
Replace the placeholder values in `.env.local`:

```bash
# Supabase Configuration (São Paulo Region)
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
SUPABASE_JWT_SECRET=your-actual-jwt-secret
```

### 5.2 Test the Application
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth-test`
3. Try creating a new account with Brazilian data
4. Test login/logout functionality
5. Test consent management features

## Step 6: Configure Backups (Optional)

### 6.1 Enable Point-in-Time Recovery
1. Go to **Settings** → **Database**
2. Enable **Point-in-Time Recovery** (available on Pro plan)

### 6.2 Set Up Automated Backups
1. Go to **Settings** → **Database**
2. Configure backup schedule (daily recommended)
3. Set retention period (30 days minimum for LGPD)

## Step 7: Monitor and Verify

### 7.1 Check Database Tables
1. Go to **Table Editor**
2. Verify all tables are created correctly
3. Check that RLS policies are active

### 7.2 Test User Registration
1. Use the auth test page
2. Create a test user with Brazilian data
3. Verify profile creation in database

### 7.3 Verify LGPD Compliance
1. Check consent records are created
2. Test data export functionality
3. Verify audit logging is working

## Troubleshooting

### Common Issues

**1. Connection Errors**
- Verify your environment variables are correct
- Check that the Supabase URL is accessible
- Ensure your IP is not blocked

**2. Authentication Errors**
- Verify email provider is enabled
- Check email templates are configured
- Ensure RLS policies are not blocking access

**3. Schema Errors**
- Check that all extensions are enabled
- Verify you have sufficient permissions
- Review error messages in SQL Editor

**4. Brazilian Region Issues**
- Ensure you selected São Paulo region during setup
- Verify data residency compliance
- Check latency from Brazilian locations

## Security Checklist

- [ ] Database password is strong and secure
- [ ] Environment variables are not committed to git
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is kept secure
- [ ] JWT secret is properly configured
- [ ] Email authentication is properly configured
- [ ] Backup procedures are in place

## LGPD Compliance Verification

- [ ] Data is stored in Brazilian region (São Paulo)
- [ ] Consent tracking is implemented
- [ ] Data export functionality works
- [ ] Account deletion works with audit trail
- [ ] Data retention policies are configured
- [ ] Audit logging is active

## Next Steps

After completing this setup:

1. **Test Story 2 functionality** - Verify all acceptance criteria
2. **Move to Story 3** - Basic conversation flow
3. **Configure monitoring** - Set up alerts and logging
4. **Performance testing** - Test with Brazilian users

## Support

If you encounter issues:
1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Test with the provided test pages
4. Verify all environment variables are set correctly 