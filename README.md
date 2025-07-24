# RachaAI - Brazilian AI-First Bill Splitter

A sophisticated AI-powered expense splitting application designed specifically for the Brazilian market, featuring Portuguese language support, LGPD compliance, and cultural adaptation.

## 🎯 Project Overview

RachaAI revolutionizes expense splitting by combining artificial intelligence with natural language processing, allowing users to simply describe their expenses in Portuguese and automatically categorize, split, and manage shared costs.

## ✨ Key Features

- **🤖 Claude AI Integration**: Intelligent expense processing using Anthropic's Claude
- **🇧🇷 Brazilian Market Focus**: Portuguese language support with cultural context
- **⚖️ LGPD Compliant**: Full compliance with Brazilian data protection laws
- **💰 Cost-Optimized**: Smart model routing (70% Haiku, 25% Sonnet, 5% Opus)
- **📱 Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **🔄 Real-time Processing**: Instant expense categorization and splitting
- **💳 Intelligent Categorization**: AI-powered expense type detection
- **👥 Group Management**: Easy creation and management of expense groups
- **📊 Smart Analytics**: Insights into spending patterns and group dynamics

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **AI**: Anthropic Claude API (Haiku, Sonnet, Opus models)
- **Database**: Supabase PostgreSQL with Vector Store
- **Caching**: Redis for performance optimization
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended) or Docker
- **Monitoring**: Built-in cost tracking and performance metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key
- Redis instance (optional, for caching)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lipkin10/bill-splitter-ai-app.git
   cd bill-splitter-ai-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp env-example.txt .env.local
   ```
   
   Update `.env.local` with your actual API keys and configuration.

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
rachaai/
├── components/          # React components
├── pages/              # Next.js pages and API routes
├── lib/                # Utility functions and API clients
├── docs/               # Project documentation
│   ├── architecture/   # System architecture and database schema
│   ├── development/    # Frontend prompts, API docs, and user flows
│   ├── operations/     # Deployment, monitoring, and performance
│   ├── product/        # Epics and product planning
│   ├── testing/        # Accessibility and testing deliverables
│   └── ux/             # UX deliverables and wireframes
├── supabase/           # Database migrations and config
├── public/             # Static assets
└── styles/             # CSS and styling
```

## 🔧 Configuration

### Claude API Setup

The application uses intelligent model routing to optimize costs:

- **Haiku (70%)**: Fast, cost-effective for simple categorization
- **Sonnet (25%)**: Balanced performance for complex scenarios  
- **Opus (5%)**: Premium model for challenging edge cases

### Brazilian Market Features

- **Language**: Full Portuguese support with Brazilian slang recognition
- **Currency**: Real (R$) formatting and calculations
- **Cultural Context**: Understanding of Brazilian social dynamics
- **LGPD Compliance**: Data protection and privacy controls
- **Local Hosting**: Support for Brazilian data residency requirements

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

Test the application using the built-in test interface at `/test`.

## 📊 Performance Targets

- **Response Time**: <1s for Haiku, <2.5s for Sonnet
- **Daily Budget**: R$ 100 cost tracking
- **Availability**: 99.9% uptime target
- **LGPD Compliance**: 100% data protection adherence

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main**

### Docker

```bash
# Build image
docker build -t rachaai .

# Run container
docker run -p 3000:3000 --env-file .env.local rachaai
```

## 🤝 Development Methodology

This project was developed using **BMAD (BMad-Method)** - an AI-assisted development framework that provides structured workflows and specialized AI agents for different development roles.

**BMAD Tools Location**: The BMAD development framework files have been separated to `../bmad-development-tools/` to maintain clean repository structure while preserving the development methodology that created this application.

**Why BMAD?**: 
- Systematic AI-assisted development process
- Specialized agents for PM, Architecture, Development, QA roles  
- Cost-effective development with intelligent AI model usage
- Brazilian market optimization and LGPD compliance focus

Learn more about BMAD at: [BMad-Method GitHub](https://github.com/bmad-method/bmad-method)

## 📋 Current Status

### ✅ Story 1: Basic Claude Integration (COMPLETED)
- Claude API integration with intelligent model routing
- Portuguese natural language processing
- Cost tracking and optimization
- Basic expense categorization
- Performance targets achieved

### ✅ Architecture Foundation (COMPLETED)
- **System Architecture**: `docs/architecture/rachaai-architecture.md`
- **Database Schema**: `docs/architecture/story-2-database-schema.sql`
- **Legacy Architecture**: `docs/architecture/ai-bill-splitter-architecture.md`

### ✅ Development Foundation (COMPLETED)
- **AI Frontend Prompts**: `docs/development/rachaai-ai-frontend-prompts.md`
- **API Documentation**: `docs/development/rachaai-api-documentation.md`
- **Component Interactions**: `docs/development/rachaai-component-interactions.md`
- **User Onboarding Flows**: `docs/development/rachaai-user-onboarding.md`

### ✅ Operations Foundation (COMPLETED)
- **Deployment Automation**: `docs/operations/rachaai-deployment-automation.md`
- **Monitoring Dashboards**: `docs/operations/rachaai-monitoring-dashboards.md`
- **Performance Optimization**: `docs/operations/rachaai-performance-optimization.md`

### ✅ Testing Foundation (COMPLETED)
- **Accessibility Testing**: `docs/testing/rachaai-accessibility-testing.md`
- **Automated Testing Scripts**: `docs/testing/rachaai-accessibility-testing-scripts.md`

### ✅ Product Foundation (COMPLETED)
- **Epics and Roadmap**: `docs/product/rachaai-epics.md`

### ✅ UX Design Foundation (COMPLETED)
- **Core Conversational Wireframes**: `docs/ux/rachaai-conversational-wireframes.md`
- **Interactive Prototypes**: `docs/ux/rachaai-interactive-prototypes.md`
- **User Journey Maps**: `docs/ux/rachaai-user-journey-maps.md`
- **Mobile App Wireframes**: `docs/ux/rachaai-mobile-app-wireframes.md`
- **Analytics Dashboard Design**: `docs/ux/rachaai-analytics-dashboard-design.md`
- **B2B Features UX**: `docs/ux/rachaai-b2b-features-ux.md`

### 🚧 Story 2: Supabase Foundation (IN PROGRESS)
- Database schema implementation
- User authentication system
- Data persistence layer
- LGPD compliance implementation

### 📅 Upcoming Stories
- Group management and sharing
- Advanced analytics and reporting
- Mobile app development
- Premium features and monetization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic**: For the powerful Claude AI models
- **Supabase**: For the excellent backend-as-a-service platform
- **Vercel**: For seamless deployment and hosting
- **BMad-Method**: For the AI-assisted development methodology
- **Brazilian Developer Community**: For feedback and cultural insights

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Lipkin10/bill-splitter-ai-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Lipkin10/bill-splitter-ai-app/discussions)
- **Email**: [Your Contact Email]

---

**Made with ❤️ for the Brazilian market by AI-powered development**

*Revolutionizing expense splitting through artificial intelligence and cultural understanding.* 