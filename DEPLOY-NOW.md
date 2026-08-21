# 🚀 DEPLOY NOW - 10 Minutes to Production

**Status:** All files created ✅  
**Next:** Deploy and test

---

## Step 1: Supabase Migration (3 min)

```bash
# Option A: Easiest - Supabase Dashboard

1. Go to: https://app.supabase.com
2. Click your Atlas project
3. Go to: SQL Editor
4. Click: "New Query"
5. Paste this:

---

-- Create decisions table for tracking Claude-driven decisions
create table if not exists decisions (
  id bigserial primary key,
  project_id text not null,
  agent_name text not null,
  decision_type text not null,
  action text not null,
  status text not null default 'approved',
  context jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_decisions_project_id on decisions(project_id);
create index if not exists idx_decisions_agent_name on decisions(agent_name);

alter table decisions enable row level security;

create policy "Enable read access for all users" on decisions
  for select using (true);

create policy "Enable insert access for all users" on decisions
  for insert with check (true);

---

6. Click: "Run"
7. Wait for ✅ Complete

---

# Option B: Via CLI (if installed)

supabase db push

---
```

✅ **Done:** Table `decisions` created in Supabase

---

## Step 2: Git Commit & Push (2 min)

```bash
cd "C:\Users\conta\OneDrive\Documents\Claude\Projects\Nouveau dossier"

# Add all changes
git add -A

# Commit
git commit -m "feat: Add Claude decision integration with re-brief pipeline

- Improved Claude prompt to suggest structured decisions
- Detect decision format [DECISION_NEEDED]...[/DECISION_NEEDED]
- Add decision buttons to chat UI with visual feedback
- Create /api/projects/:id/agent-rebrief endpoint
- Save all decisions to Supabase decisions table
- Add handlers for decision approval and agent re-briefing"

# Push (auto-deploys to Vercel)
git push origin main
```

✅ **Done:** Vercel deployment started

---

## Step 3: Wait for Vercel Build (2 min)

Go to: https://vercel.com/dashboard

You should see:
- Building... → ⏳ (1-2 min)
- Ready ✅ (green checkmark)

If it fails, check:
- Environment variables are set
- No build errors in logs

---

## Step 4: Test in Production (3 min)

### Test A: Simple Chat (No Decision)

1. Go to your project: `https://[your-vercel-url].vercel.app/products/[any-id]`
2. Send message: `"Describe the market opportunity for this product"`
3. Claude responds with analysis
4. ✅ No buttons (not a decision)

### Test B: Decision Prompt

1. Send message: `"Should we test $99/month pricing instead of $49?"`
2. Claude responds with analysis AND decision block
3. You see 2-3 buttons with options
4. ✅ Buttons appear

### Test C: Click a Button

1. Click one of the decision buttons
2. Loading state shows
3. Message appears: "✅ Décision enregistrée: [OPTION]"
4. ✅ No errors in console

### Test D: Verify Supabase

1. Go to Supabase Dashboard
2. Select Atlas project
3. Go to: Database → decisions table
4. You should see 1 row with your decision
5. ✅ Data saved

---

## Step 5: First Product Submission (2 min)

Once tests pass:

**Send email to CEO:**

```
TO: paperclip-ceo@[your-domain]
SUBJECT: PRODUCT: SocialSync | IDEA: Slack customer message consolidation | BUDGET: $15000

(Or however you've configured the trigger)
```

Or use the UI:
1. Click: "+ Nouvelle idée"
2. Fill in: Name, description, target, budget
3. Click: "Créer"

---

## ✅ Verification Checklist

```
[ ] Supabase table decisions created
[ ] Git push completed (main branch updated)
[ ] Vercel build successful (green checkmark)
[ ] Test A passed (simple chat works)
[ ] Test B passed (decision buttons appear)
[ ] Test C passed (button click saves decision)
[ ] Test D passed (data in Supabase)
[ ] First product submitted
```

---

## 🎯 You're Now Live!

Your Atlas system is now FULLY OPERATIONAL with:

✅ **13 Agents** — Market Research, PM, Brand, etc.  
✅ **CEO Orchestrator** — Coordinates Phase 1-5  
✅ **Claude Chat** — Strategic guidance per project  
✅ **Decision Pipeline** — Feedback loops to agents  
✅ **Supabase** — All data persisted  
✅ **Vercel** — Production-ready deployment

---

## What Happens Next?

**In Your Browser:**
1. Create new product idea
2. Chat with Claude about findings
3. Claude suggests improvements
4. Click decision button
5. CEO re-briefs affected agents
6. Agents adapt their work
7. Product launches better

**Example Timeline:**
- Day 1: Submit idea
- Days 2-5: Phase 1 validation
- Day 5-6: Chat with Claude, make decisions via buttons
- Days 7-11: Phase 2 architecture (improved based on decisions)
- Days 12-25: Phase 3 development
- Day 26: Launch
- Week 4: Revenue flowing

---

## Troubleshooting

### Vercel build failed
→ Check logs: https://vercel.com/dashboard  
→ Common: Missing env vars

### Supabase migration error
→ Copy exact SQL from create_decisions_table.sql  
→ Try running one section at a time

### Buttons don't appear
→ Send a clearer decision prompt  
→ Check browser console (F12) for errors  
→ Claude might need 1-2 messages to "learn" the format

### Decision not saved
→ Check Supabase table exists  
→ Check network tab (F12) for 500 errors  
→ Verify RLS policies (Security tab in Supabase)

---

## Need Help?

1. **Deployment issues?**  
   → Check Vercel logs: https://vercel.com/dashboard

2. **Supabase issues?**  
   → Check tables and RLS: https://app.supabase.com

3. **Claude not working?**  
   → Test prompt in Supabase SQL: `select count(*) from chat_messages`

4. **Everything broken?**  
   → Roll back: `git revert [commit-hash]` → `git push`

---

**You've got this! 🚀**

Deploy now. Test in 5 min. Ship your first product this week.

---

*Last updated: 2026-08-21*  
*Status: Ready for production*