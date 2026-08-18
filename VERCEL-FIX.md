# ⚠️ Fix Vercel Deployment

Your API is deployed but showing the old static site. Need to fix the Vercel config.

## Issue
Vercel deployed the old `vercel.json` config (static site) instead of the new Node.js server.

## Solution (3 minutes)

### Option 1: Via Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select **atlas** project
3. Click **Settings** → **Git**
4. Uncheck **Automatically deploy on push**
5. Go to **Deployments**
6. Find any deployment, click the 3 dots
7. Click **Promote to Production**
8. Or: Redeploy by clicking **Redeploy**

Wait 2-3 minutes...

Then test:
```bash
curl https://atlas-1-b9wfyeo0h-contact-3101s-projects.vercel.app/api/health
```

Should return JSON, not HTML.

### Option 2: Via Vercel CLI

```bash
cd "C:\Users\conta\OneDrive\Documents\Claude\Projects\Nouveau dossier"
vercel --prod --force
```

This forces a fresh redeployment with the new config.

### Option 3: Redeploy via Git

```bash
cd "C:\Users\conta\OneDrive\Documents\Claude\Projects\Nouveau dossier"
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

---

## Expected Result After Fix

```bash
curl https://your-vercel-url/api/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2026-08-23T...",
#   "version": "1.0.0",
#   "system": "Atlas Product Orchestration + Claude Integration"
# }
```

---

## Why This Happened

The original repo had:
```json
// Old config - static site
{
  "buildCommand": "echo 'Static site'",
  "outputDirectory": "public"
}
```

We updated it to:
```json
// New config - Node.js server
{
  "version": 2,
  "buildCommand": "npm run build",
  "routes": [{"src": "/(.*)", "dest": "server.js"}]
}
```

Vercel sometimes caches old config. A redeploy fixes it.

---

## Try Now

```bash
# Test your deployed API
curl https://atlas-1-b9wfyeo0h-contact-3101s-projects.vercel.app/api/health

# If it returns JSON: ✅ SUCCESS
# If it returns HTML: Follow fix above
```

Let me know the result!
