# Deployment Guide: GitHub → Vercel

Your code is ready! Here's how to deploy it.

## ✅ What's Already Done

- ✅ Code initialized with git
- ✅ First commit created (2e8c2ff)
- ✅ `.gitignore` configured (secrets protected)
- ✅ `package.json` with dependencies
- ✅ `vercel.json` with configuration
- ✅ `server.js` with full Claude integration
- ✅ Documentation complete

## 🚀 Next: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `atlas-orchestration` (or whatever you prefer)
3. Description: "Product launch orchestration system with Claude integration"
4. Choose: **Public** or **Private**
5. Click **Create repository**

### Step 2: Push Your Code

```bash
cd "C:\Users\conta\OneDrive\Documents\Claude\Projects\Nouveau dossier"

# Add remote (replace USERNAME and REPO)
git remote add origin https://github.com/USERNAME/atlas-orchestration.git

# Rename branch to main (GitHub default)
git branch -M main

# Push code
git push -u origin main
```

**Expected output:**
```
Enumerating objects: 46, done.
Counting objects: 100% (46/46), done.
Delta compression using up to 8 threads
Compressing objects: 100% (44/44), done.
Writing objects: 100% (46/46), 290.45 KiB | 10.29 MiB/s, done.
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### Step 3: Verify on GitHub

- Go to https://github.com/USERNAME/atlas-orchestration
- See all files pushed ✓
- See commit message ✓
- Ready to deploy ✓

---

## 🚀 Deploy to Vercel

### Option A: Using Vercel CLI (Easiest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel (opens browser)
vercel login

# 3. Deploy
cd "C:\Users\conta\OneDrive\Documents\Claude\Projects\Nouveau dossier"
vercel

# 4. Answer questions
# - Set up and deploy? → Yes
# - Which scope? → Select your account
# - Link to existing project? → No
# - Project name? → atlas-orchestration
# - Which directory? → ./
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Click **Import Git Repository**
4. Select your `atlas-orchestration` repo
5. Click **Import**
6. Configure project:
   - **Framework:** Node.js
   - **Root Directory:** ./
7. Click **Environment Variables**
8. Add variables:
   ```
   CLAUDE_API_KEY: sk-ant-api03-YOUR_NEW_KEY
   NODE_ENV: production
   ```
9. Click **Deploy**

---

## 🔐 Add API Key to Vercel

### Step 1: Generate NEW Claude API Key

⚠️ **CRITICAL**: Use a NEW key, not the old one you shared

1. Go to https://console.anthropic.com/account/keys
2. Click **Create Key**
3. Copy the new key (starts with `sk-ant-api03-`)

### Step 2: Add to Vercel

**Via CLI:**
```bash
vercel env add CLAUDE_API_KEY
# Paste your NEW key when prompted
# Select: All environments (or just Production)
```

**Via Dashboard:**
1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Click **Add**
4. Name: `CLAUDE_API_KEY`
5. Value: `sk-ant-api03-YOUR_NEW_KEY`
6. Select: **Production** (and optionally Preview, Development)
7. Click **Save**

### Step 3: Redeploy

The environment variable change triggers redeployment automatically.

---

## ✅ Verify Deployment

### Check Health Endpoint

```bash
# Via curl
curl https://YOUR_VERCEL_DOMAIN.vercel.app/api/health

# Via browser
# Go to: https://YOUR_VERCEL_DOMAIN.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-23T10:00:00Z",
  "version": "1.0.0",
  "system": "Atlas Product Orchestration + Claude Integration"
}
```

### Find Your Vercel URL

After deployment, you'll see:
```
✓ Production: https://atlas-orchestration-abc123.vercel.app
```

Save this URL - you'll use it for API calls.

---

## 🧪 Test Your Deployment

### Test 1: Health Check
```bash
curl https://YOUR_VERCEL_URL/api/health
```

### Test 2: List Projects
```bash
curl https://YOUR_VERCEL_URL/api/projects
```

### Test 3: Chat with Claude
```bash
curl -X POST https://YOUR_VERCEL_URL/api/projects/test-001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Is $2M TAM realistic for a Slack competitor?"
  }'
```

### Test 4: Validate Decision
```bash
curl -X POST https://YOUR_VERCEL_URL/api/projects/test-001/chat/validate \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "PROCEED",
    "reasoning": "Claude convinced me the market is real"
  }'
```

---

## 🔒 Security Checklist

Before declaring live:

- [ ] Old Claude API key deleted? (https://console.anthropic.com/account/keys)
- [ ] New key created and in `.env`?
- [ ] `.env` NOT committed to git? (check `.gitignore`)
- [ ] API key in Vercel environment variables?
- [ ] `.env` file in `.gitignore`? ✓
- [ ] No secrets in code or documentation?
- [ ] No API keys in git history?
- [ ] HTTPS enforced on Vercel? ✓ (automatic)
- [ ] CORS configured for your domain?
- [ ] Rate limiting enabled?

---

## 📊 Monitoring & Logs

### View Vercel Logs

```bash
# Real-time logs
vercel logs

# Or via dashboard:
# Project → Deployments → Select deployment → Logs
```

### Monitor Claude API Usage

1. Go to https://console.anthropic.com/account/usage
2. Check daily/monthly usage
3. Set up billing alerts

### Alert on Errors

```bash
# View errors in Vercel dashboard
# Project → Monitoring → Functions
```

---

## 🔄 Continuous Deployment

Your setup is already configured for CD:

1. Push to `main` branch
2. Vercel automatically deploys
3. Takes ~30-60 seconds
4. See status in Vercel dashboard

To disable auto-deploy:
- Vercel Dashboard → Settings → Git → Uncheck "Automatically redeploy on push"

---

## 🚀 Local Development

### Run Locally Before Deploying

```bash
# 1. Install dependencies
npm install

# 2. Create .env
cp .env.example .env
# Add: CLAUDE_API_KEY=sk-ant-api03-YOUR_NEW_KEY

# 3. Start server
npm run dev

# 4. Test locally
curl http://localhost:3000/api/health

# 5. Test with data
curl -X POST http://localhost:3000/api/projects/test-001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'
```

---

## 💰 Cost Estimation

### Monthly Costs

| Service | Usage | Cost |
|---------|-------|------|
| Vercel | 2 products, 10 chat calls each | Free-$5 |
| Claude API | 20 projects × $2.50 avg | ~$50 |
| Domain (optional) | Custom domain | ~$10 |
| **Total** | | ~$60/month |

### Cost Optimization

- Use Vercel free tier (included)
- Monitor Claude usage weekly
- Set budget alerts
- Kill unprofitable products quickly

---

## 🐛 Troubleshooting

### "Deployment failed"
- Check: Vercel logs (`vercel logs`)
- Check: Environment variables set correctly
- Check: `package.json` has all dependencies

### "API key not found"
- Verify key in Vercel settings
- Re-add if missing
- Check: `CLAUDE_API_KEY` is exact variable name

### "Project not found"
- Projects must exist in `projects/` folder
- Create test project first
- Check: projectId in URL matches folder

### "Claude returns empty response"
- Check: API key is valid (test at console.anthropic.com)
- Check: Rate limiting (wait 5+ seconds)
- Check: Project has context files

---

## 📝 Next Steps

### Day 1 (Today)
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Verify health endpoint
- [ ] Save Vercel URL

### Day 2-3
- [ ] Configure environment variables
- [ ] Run tests against deployed API
- [ ] Document Vercel URL

### Day 4+
- [ ] Use in production
- [ ] Monitor logs and usage
- [ ] Set up billing alerts

---

## 🎉 You're Live!

Once verified:

```
✅ Code on GitHub
✅ API on Vercel
✅ Claude integration active
✅ Ready for first product
```

**Next:** Go back to `core/QUICK-START.md` and submit your first product idea! 🚀

---

## Support

### Common Questions

**"What's my Vercel URL?"**
→ Check email from Vercel or dashboard → Project settings → Domains

**"How do I redeploy?"**
→ Push to main branch, or click "Redeploy" in Vercel dashboard

**"Can I use a custom domain?"**
→ Yes, in Vercel settings → Domains. Then update DNS at registrar.

**"How do I roll back?"**
→ Vercel dashboard → Deployments → Select previous → Click "Promote to Production"

### Links

- GitHub: https://github.com/USERNAME/atlas-orchestration
- Vercel: https://vercel.com/dashboard
- Claude Console: https://console.anthropic.com
- Vercel CLI Docs: https://vercel.com/docs/cli

---

**Deployed successfully? Welcome to production! 🎊**
