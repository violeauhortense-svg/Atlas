# Vercel Deployment: Your Atlas Orchestration System

## ✅ Status

- ✅ Code pushed to GitHub: https://github.com/violeauhortense-svg/Atlas
- ✅ Branch: `main`
- ✅ Ready to deploy to Vercel

## 🚀 Deploy Now (2 Options)

### Option 1: Via Vercel Dashboard (Easiest - 5 minutes)

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Click **Import Git Repository**
4. Select `violeauhortense-svg/Atlas`
5. Click **Import**

**Configure:**
- Framework: **Node.js**
- Root Directory: `./`
- Click **Environment Variables**

**Add Secret:**
```
CLAUDE_API_KEY: sk-ant-api03-YOUR_NEW_KEY
```

(Get new key: https://console.anthropic.com/account/keys)

6. Click **Deploy**
7. Wait ~2 minutes for deployment
8. Get your URL: `https://atlas-xxx.vercel.app`

### Option 2: Via Vercel CLI (5 minutes)

```bash
# 1. Install CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd "C:\Users\conta\OneDrive\Documents\Claude\Projects\Nouveau dossier"
vercel --prod

# 4. Answer questions:
# - Deploy? → Yes
# - Settings? → Yes
# - When asked for CLAUDE_API_KEY: paste sk-ant-api03-YOUR_NEW_KEY
```

---

## ✨ After Deployment

### Test Your API (Replace URL)

```bash
curl https://your-atlas-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-23T...",
  "version": "1.0.0",
  "system": "Atlas Product Orchestration + Claude Integration"
}
```

### Save Your Vercel URL

You'll need this for:
- API calls from projects
- Testing chat endpoints
- Calling validation endpoints
- Monitoring in Vercel dashboard

---

## 🔑 Important: Claude API Key

### ⚠️ Generate NEW Key (Critical!)

You shared your old key publicly. Generate a new one:

1. Go to https://console.anthropic.com/account/keys
2. Click **Create Key**
3. Copy new key (starts with `sk-ant-api03-`)
4. Paste into Vercel environment variables

**DO NOT** use the old key or any key you've shared.

---

## 📊 Test Endpoints (After Deployment)

Replace `YOUR-VERCEL-URL` with your actual URL:

### 1. Health Check
```bash
curl https://YOUR-VERCEL-URL/api/health
```

### 2. List Projects
```bash
curl https://YOUR-VERCEL-URL/api/projects
```

### 3. Test Chat (create test project first)
```bash
curl -X POST https://YOUR-VERCEL-URL/api/projects/test-001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Is $2M TAM realistic?"}'
```

---

## 📈 Next Steps

### ✅ Week 1: Verify Deployment
- [ ] Deploy to Vercel
- [ ] Test health endpoint
- [ ] Get Vercel URL
- [ ] Save for later use

### ✅ Week 2: First Product
- [ ] Read: `core/QUICK-START.md`
- [ ] Update CEO instructions
- [ ] Set up trigger (email/Slack/form)
- [ ] Submit first product idea

### ✅ Week 3: Start Using
- [ ] Phase 1 validation runs
- [ ] Chat with Claude via deployed API
- [ ] Validate decisions
- [ ] Phase 2 starts automatically

---

## 🔒 Security Checklist

Before considering "done":

- [ ] NEW Claude API key generated? (not the old shared one)
- [ ] API key in Vercel secrets (not in code)
- [ ] `.env` NOT committed (check `.gitignore`)
- [ ] No secrets in README or docs
- [ ] Vercel auto-deploy enabled
- [ ] Logs accessible in dashboard

---

## 💰 Costs

### Monthly Estimate

| Service | Cost |
|---------|------|
| Vercel | Free-$5 |
| Claude API | ~$5-10 per product |
| Total for 10 products | ~$60/month |

Monitor usage at:
- Vercel: https://vercel.com/dashboard (Project settings → Usage)
- Claude: https://console.anthropic.com/account/usage

---

## 🐛 If Deployment Fails

### Check Logs

**Via Dashboard:**
1. https://vercel.com/dashboard
2. Select your project
3. Click **Deployments**
4. Click **Failed**
5. View logs

**Via CLI:**
```bash
vercel logs
```

### Common Errors

**"Module not found"**
→ Run: `npm install` locally first, then commit

**"API key missing"**
→ Add `CLAUDE_API_KEY` to environment variables

**"Build failed"**
→ Check `server.js` for syntax errors
→ Run `node server.js` locally first

---

## 🎯 Success Checklist

✅ Code on GitHub  
✅ Deployed on Vercel  
✅ Health endpoint responding  
✅ Environment variables set  
✅ Claude API key added  
✅ Ready for first product

**You're live! 🎉**

---

## 📞 Need Help?

**GitHub:** https://github.com/violeauhortense-svg/Atlas  
**Vercel:** https://vercel.com/dashboard  
**Claude API:** https://console.anthropic.com  
**Docs:** See `core/` folder (QUICK-START.md, IMPLEMENTATION-WEEK1.md, etc.)

---

## 🚀 What's Next?

Now that your system is deployed:

1. **Submit your first product idea** (see `core/IPHONE-TRIGGER-GUIDE.md`)
2. **Let Phase 1 validation run** (5 days, automated)
3. **Chat with Claude about findings** (via deployed API)
4. **Click [✅ PROCEED]** to launch Phase 2
5. **Watch your first product get built** (14 days, automated)
6. **Launch on day 26** 🚀

---

**Your complete product factory is now online. Ready to build?**
