# macOS Development Guide
## Minimal Setup for AI Bill Splitter Development

*Generated for Agent Contextualization*
*Created: December 2024*

---

## Quick Setup

### 1. Prerequisites
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (LTS)
brew install node

# Install Git
brew install git

# Install VS Code (optional)
brew install --cask visual-studio-code
```

### 2. Project Setup
```bash
# Clone repository
git clone <repository-url>
cd bill-splitter-ai-app

# Install dependencies
npm install

# Set up environment
cp env-example.txt .env.local
# Edit .env.local with your API keys
```

### 3. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

---

## Key Technologies

### Frontend
- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Claude AI** - Conversational interface

### Backend
- **Next.js API Routes** - Serverless functions
- **Anthropic Claude API** - AI processing
- **Supabase** - Database (optional)
- **Redis** - Caching (optional)

---

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# Test locally
npm run dev

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. AI Integration
- API endpoints in `pages/api/ai/`
- Claude client in `lib/claude-client.ts`
- Rate limiting in `lib/rate-limit.ts`

### 3. Testing
```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="chat"

# Run with coverage
npm test -- --coverage

# Run comprehensive test suite (includes integration tests)
npm run test:complete
```

**CRITICAL TESTING REQUIREMENTS:**
- 100% test coverage required for all new code
- All tests must pass before marking any task as complete
- Mock all external dependencies (databases, APIs, etc.) in tests
- After story completion, QA agent must validate test coverage
- Only proceed to next story after QA confirms 100% test pass rate

---

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_claude_api_key

# Optional
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
REDIS_URL=your_redis_url
```

---

## Common Issues

### 1. Port Conflicts
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### 2. Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 3. TypeScript Errors
```bash
# Check TypeScript
npx tsc --noEmit
```

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Local Production Build
```bash
npm run build
npm start
```

---

## Performance Tips

1. **Use Haiku model** for cost optimization
2. **Implement caching** for repeated requests
3. **Optimize images** with Next.js Image component
4. **Use React.memo** for expensive components
5. **Implement proper error boundaries**

---

## Security Checklist

- [ ] API keys in environment variables
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] HTTPS in production
- [ ] CORS properly configured
- [ ] No sensitive data in client code

## Testing & QA Workflow

- [ ] 100% test coverage for all new code
- [ ] All external dependencies properly mocked
- [ ] All tests pass before task completion
- [ ] QA agent validates test coverage after story completion
- [ ] Story marked with "X" only after QA confirms 100% test pass rate
- [ ] Completion status reflected across all tracking files
- [ ] Dev agent reactivated after successful QA validation

---

## Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List global packages
npm list -g --depth=0

# Update npm
npm install -g npm@latest

# Clear npm cache
npm cache clean --force
```

---

*This guide covers essential macOS development setup for the AI Bill Splitter project. For detailed architecture and API documentation, see other files in this directory.* 