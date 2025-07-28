# Environment Setup Guide

This guide helps you set up the development environment for RachaAI.

## Required Environment Variables

### 1. Supabase Configuration (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

### 2. Redis Configuration (Optional for Development)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```

### 3. Claude API Configuration (Required)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
CLAUDE_DEFAULT_MODEL=claude-3-sonnet-20240229
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7
CLAUDE_TIMEOUT_MS=30000
```

## Setup Instructions

### 1. Copy Environment Template
```bash
cp env-example.txt .env.local
```

### 2. Configure Required Variables
Edit `.env.local` and add your actual values for:
- Supabase project URL and keys
- Claude API key
- Redis configuration (optional)

### 3. Development Mode
The application will work in development mode even without Redis configuration. The performance optimizer will use mock clients when Redis is not available.

## Feature Availability

### With Full Configuration
- ✅ All features work normally
- ✅ Performance optimization active
- ✅ Caching enabled
- ✅ Analytics tracking

### With Minimal Configuration (Supabase + Claude only)
- ✅ Core conversation features
- ✅ Group management
- ✅ Payment tracking
- ✅ Authentication
- ⚠️ Performance optimization (limited)
- ⚠️ Caching (disabled)
- ⚠️ Analytics (limited)

## Troubleshooting

### Error: "supabaseUrl is required"
- Check that `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`
- Ensure the file is in the project root

### Error: "Redis connection failed"
- This is expected if Redis is not configured
- The app will work with mock Redis clients
- Add Redis configuration for full performance features

### Error: "Claude API key not found"
- Add your `ANTHROPIC_API_KEY` to `.env.local`
- Get your key from https://console.anthropic.com/

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access Application**
   - Home: http://localhost:3000
   - Main App: http://localhost:3000/app
   - Performance Test: http://localhost:3000/performance-test

3. **Test Features**
   - All test pages are available at `/test`, `/group-test`, etc.
   - Performance dashboard shows system status

## Production Deployment

For production deployment, ensure all environment variables are properly configured:

1. **Required for Production**
   - Supabase configuration
   - Claude API key
   - Redis configuration
   - Security keys

2. **Optional for Production**
   - Analytics keys
   - Monitoring services

## Security Notes

- Never commit `.env.local` to version control
- Use environment-specific configurations
- Rotate API keys regularly
- Monitor usage and costs

---

*Last updated: December 2024* 