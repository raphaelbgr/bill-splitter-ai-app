# RachaAI - Brazilian Bill Splitter AI

A conversational AI-powered bill splitting application designed specifically for the Brazilian market, featuring advanced Portuguese NLP, cultural context awareness, and B2B features.

## 🚀 Current Status

### ✅ **Core Features Ready for Deployment**
- **B2B Features** (Story 15) - ✅ All 13 tests passing
- **Payment System** - ✅ All tests passing  
- **Internationalization** - ✅ All tests passing
- **Brazilian NLP** - ✅ All tests passing
- **Basic UI Components** - ✅ All tests passing

### 📊 Test Status
- **Total Test Suites**: 29
- **Passed**: 20 suites ✅
- **Failed**: 9 suites ❌
- **Total Tests**: 604
- **Passed Tests**: 507 ✅ (84% pass rate)
- **Failed Tests**: 97 ❌

**Overall Progress**: 5 out of 9 major feature areas are fully tested and working (55% completion)

## 🎯 Key Features

### ✅ **Fully Implemented & Tested**

#### B2B Features (Story 15)
- **Restaurant Dashboard**: Complete restaurant management interface
- **Event Organizer**: Event planning and expense management
- **Bulk Expense Management**: Mass expense processing
- **Partnership Dashboard**: B2B partnership management

#### Payment System
- Brazilian payment methods integration
- Multi-currency support
- Secure transaction processing
- Payment history tracking

#### Internationalization
- Multi-language support (Portuguese, Spanish, English)
- Regional variations for Brazilian Portuguese
- Cultural context awareness
- Currency formatting

#### Brazilian NLP
- Advanced Portuguese text processing
- Regional dialect detection
- Cultural context understanding
- Amount extraction and validation

### 🔄 **In Progress**
- Claude API integration (timeout issues)
- Performance optimization (incomplete implementation)
- Supabase integration (network configuration)
- PWA features (incomplete)
- Mobile features (incomplete)

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Caching**: Redis
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/rachaai.git
cd rachaai

# Install dependencies
npm install

# Set up environment variables
cp env-example.txt .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key

# Redis Configuration (optional)
REDIS_URL=your_redis_url
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# B2B Features (all passing)
npm test -- --testNamePattern="B2B Features"

# Payment System (all passing)
npm test -- --testNamePattern="Payment System"

# Brazilian NLP (all passing)
npm test -- --testNamePattern="Brazilian NLP"
```

### Test Status by Feature

#### ✅ **Fully Tested & Working**
- B2B Features: 13/13 tests passing
- Payment System: All tests passing
- Internationalization: All tests passing
- Brazilian NLP: All tests passing
- Basic UI Components: All tests passing

#### ⚠️ **Partially Tested**
- Claude Integration: 0% passing (timeout issues)
- Performance Optimization: 0% passing (incomplete)
- Supabase Integration: 0% passing (network issues)

## 📁 Project Structure

```
rachaai/
├── components/          # React components
├── lib/                # Core libraries
├── pages/              # Next.js pages
├── tests/              # Test files
├── docs/               # Documentation
├── scripts/            # Setup scripts
└── public/             # Static assets
```

## 🎯 Development Roadmap

### Phase 1: Core Features ✅ **COMPLETED**
- [x] B2B Features (Story 15)
- [x] Payment System
- [x] Internationalization
- [x] Brazilian NLP
- [x] Basic UI Components

### Phase 2: Advanced Features 🔄 **IN PROGRESS**
- [ ] Claude API Integration
- [ ] Performance Optimization
- [ ] Supabase Integration
- [ ] PWA Features
- [ ] Mobile Features

### Phase 3: Enterprise Features 📋 **PLANNED**
- [ ] Advanced Analytics
- [ ] Memory Context UI
- [ ] API Endpoints
- [ ] Conversation Flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@rachaai.com or join our Slack channel.

## 📊 Performance Metrics

- **Test Coverage**: 84% pass rate (507/604 tests)
- **Core Features**: 100% tested and working
- **Deployment Ready**: Core functionality complete
- **Brazilian Market Ready**: Cultural context and NLP implemented

---

**RachaAI** - Making bill splitting intelligent and culturally aware for Brazil 🇧🇷 