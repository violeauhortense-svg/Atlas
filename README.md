# Atlas AI Venture Studio - Product Orchestration System

Complete product launch automation system powered by Paperclip AI agents and Claude integration.

## 🎯 Vision

Transform product ideas into launched, revenue-generating businesses in 30 days with minimal manual work.

- **Idea** (30 seconds on iPhone)
- **Validation** (5 days, automated market research)
- **Development** (14 days, full orchestration)
- **Launch** (1 day, all systems coordinated)
- **Growth** (30 days, optimization and scaling)

## 🚀 Key Features

### Paperclip Orchestration
- 13 specialized AI agents (CEO, product manager, developer, marketer, etc.)
- Automated phase management (validation → architecture → development → launch)
- Real-time decision gates with human approval
- Workflow coordination across teams

### Claude Integration
- Real-time guidance within each project
- Context-aware advice (reads your market research, product brief, etc.)
- One-click decision validation that triggers automatic execution
- Conversation history tracking per product

### Complete Automation
- iPhone trigger (email, Slack, web form, iOS shortcut)
- Automatic agent task generation
- Decision logging and approval history
- Phase transitions on validation

## 📚 Documentation

### Getting Started
- `core/QUICK-START.md` — 5-minute overview
- `core/ORCHESTRATION-README.md` — Complete system guide
- `EVERYTHING-READY.md` — What's included

### Implementation
- `core/IMPLEMENTATION-WEEK1.md` — Week 1 setup (7 days)
- `core/IPHONE-TRIGGER-GUIDE.md` — How to trigger products
- `core/CLAUDE-INTEGRATION-SETUP.md` — Claude integration (code + config)

### Reference
- `core/ORCHESTRATION-ARCHITECTURE.md` — Detailed workflow design
- `core/CLAUDE-INTEGRATION.md` — How Claude guides development
- `.paperclip.yaml` — Your 13 agents configuration

## 🔧 Quick Start

### Option 1: Orchestration Only (Recommended for First Product)

```bash
1. Read: core/QUICK-START.md
2. Update CEO instructions with orchestrator mode
3. Set up trigger (email, Slack, or form)
4. Submit first product idea
```

### Option 2: Full System (Orchestration + Claude)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Add: CLAUDE_API_KEY=sk-ant-api03-YOUR_NEW_KEY

# 3. Start development server
npm run dev

# 4. Deploy to Vercel (see below)
```

## 🚀 Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: Atlas orchestration + Claude integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/atlas-orchestration.git
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel
# Follow prompts, add CLAUDE_API_KEY when asked
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import GitHub repository
4. Add environment variables:
   - `CLAUDE_API_KEY`: Your new API key from https://console.anthropic.com/account/keys
5. Deploy

### Step 3: Verify Deployment

```bash
curl https://your-vercel-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-23T10:00:00Z",
  "version": "1.0.0",
  "system": "Atlas Product Orchestration + Claude Integration"
}
```

## 📊 API Endpoints

### Health Check
```bash
GET /api/health
```

### Project Chat
```bash
POST /api/projects/:projectId/chat
Body: { "message": "Is $2M TAM realistic?" }
```

### Validate Decision
```bash
POST /api/projects/:projectId/chat/validate
Body: { "decision": "PROCEED", "reasoning": "..." }
```

### List Projects
```bash
GET /api/projects
```

### Get Project Details
```bash
GET /api/projects/:projectId
```

## 🔒 Security

### ⚠️ Critical: Regenerate API Key

If you shared your Claude API key, regenerate it immediately:

1. Go to https://console.anthropic.com/account/keys
2. Delete the compromised key
3. Create a new key
4. Update `.env` file

### Best Practices

- **Never commit `.env`** — Add to `.gitignore`
- **Use environment variables** for all secrets
- **Rate limit API calls** (1 request per 5 seconds)
- **Log all decisions** for audit trail
- **Monitor API costs** (typically $2-5 per product)

## 🏗️ Architecture

```
Frontend (React Chat)
     ↓
Backend (Express + Claude API)
     ↓
Project Storage (File-based + JSON)
     ↓
Paperclip Agents (Market Research, Dev, Marketing, etc.)
```

## 📁 Project Structure

```
.
├── server.js                      # Express backend
├── package.json                   # Dependencies
├── vercel.json                    # Vercel config
├── .env.example                   # Environment template
├── core/                          # Configuration & docs
│   ├── ORCHESTRATION-ARCHITECTURE.md
│   ├── CLAUDE-INTEGRATION.md
│   ├── orchestrator.yaml          # Phase definitions
│   └── templates/                 # Project templates
├── agents/                        # Paperclip agent configs
│   ├── ceo/ORCHESTRATOR-MODE.md  # CEO orchestrator
│   ├── fullstack/
│   ├── platform-engineer/
│   └── ... (13 agents total)
├── projects/                      # Product projects created here
│   └── [product-id]/
│       ├── meta.json
│       ├── chat.json
│       ├── 01-market-research/
│       ├── 02-product-brief/
│       └── ...
└── README.md
```

## 🎯 Success Metrics

### Week 1-2
- ✅ System deployed and working
- ✅ First product idea submitted
- ✅ Phase 1 market validation complete

### Week 3-4
- ✅ Architecture designed and approved
- ✅ Development in progress
- ✅ Marketing materials drafted

### Week 5
- ✅ Product launched
- ✅ First customers acquired
- ✅ Revenue tracking enabled

### Weeks 6-8
- ✅ Growth metrics visible
- ✅ Clear path to profitability
- ✅ Ready for product #2

## 📞 Support

### Common Issues

**"API key invalid"**
- Regenerate at https://console.anthropic.com/account/keys
- Update `.env` with new key
- Restart server

**"Project not found"**
- Ensure project directory exists
- Check projectId in URL matches
- Create test project first

**"No response from Claude"**
- Check API key is valid
- Wait 5+ seconds between requests
- Check Claude API status

### Documentation

- **Architecture questions?** → `core/ORCHESTRATION-ARCHITECTURE.md`
- **Setup help?** → `core/IMPLEMENTATION-WEEK1.md`
- **Claude integration?** → `core/CLAUDE-INTEGRATION-SETUP.md`
- **iPhone launch?** → `core/IPHONE-TRIGGER-GUIDE.md`

## 💡 Next Steps

1. **Today**: Decide between Orchestration Only or Full System
2. **This Week**: Deploy to Vercel and test
3. **Next Week**: Submit your first product idea
4. **Week 2**: Chat with Claude about market research results
5. **Week 5**: Launch your first product
6. **Week 9+**: Running multiple products through the system

## 📊 Business Model

### Cost
- Claude API: ~$2-5 per product launched
- Vercel: Free tier included, $5/month for production
- Annual cost for 10 products: ~$30-50

### ROI
- Each product saves 50+ hours of coordination
- Average product revenue: $500-5,000/month MRR
- Time to profitability: 4 weeks per product

### Goal
- **€3,000/month personal income within 6 months**
- 3-4 products launched in first 6 months
- 1-2 products profitable by month 6

## 📝 License

MIT License - See LICENSE file

## 🙏 Credits

Built with:
- **Paperclip AI** — Agent orchestration
- **Claude** — Real-time guidance
- **Express.js** — Backend API
- **Vercel** — Deployment

---

**Ready to launch?** Start with `core/QUICK-START.md` 🚀
