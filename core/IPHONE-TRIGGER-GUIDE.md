# iPhone Trigger Guide: Launch Products from Anywhere

## Vision
You're on a walk, in a coffee shop, in a meeting. An idea hits. You whip out your iPhone and **in 30 seconds, you've kicked off a full product cycle that Paperclip orchestrates for 4 weeks.**

---

## Option 1: Simple Email Trigger (Easiest)

### Setup (5 min, one-time)

1. **Create an email address for Paperclip** (or reuse existing)
   - Example: `atlas-products@paperclip.ai` (or your actual Paperclip inbox)

2. **Set as contact in iPhone**
   - Add to Contacts as "Paperclip CEO"

3. **Done!** That's it.

### Usage

**When you have an idea:**

1. Open Mail app on iPhone
2. Compose new email to "Paperclip CEO"
3. Subject line format (important):
   ```
   PRODUCT: [Product Name] | IDEA: [One sentence] | BUDGET: $[amount]
   ```
4. Body (optional details):
   ```
   Target users: [who?]
   Problem: [what pain point?]
   Timeline: 4 weeks preferred
   ```
5. Send

**Example:**

```
TO: Paperclip CEO
SUBJECT: PRODUCT: Slack Summary Bot | IDEA: Summarizes channel threads so busy people don't miss context | BUDGET: $5000

TARGET USERS: Busy tech leads, engineering managers
PROBLEM: Channels move too fast, people miss important decisions
TIMELINE: 4 weeks

That's all we need.
```

### How CEO Agent Processes It

1. Email lands in Paperclip inbox
2. CEO reads and parses it automatically
3. Creates product record in `projects/[id]/`
4. Sends back a confirming email within 1 hour:
   ```
   ✅ Got it: "Slack Summary Bot"
   
   I'm starting market validation. Timeline: 5 days to decision.
   
   Meanwhile:
   - Validate 5 people actually want this
   - Note any technical constraints
   
   Status update by Aug 23.
   ```
5. CEO orchestrates Phase 1 in background
6. Sends you approval memo in 5 days

---

## Option 2: Slack Trigger (Fastest if in Workspace)

### Setup (10 min)

1. Add Paperclip as Slack app in your workspace
2. Create private channel: `#product-ideas`
3. Make Paperclip bot a member

### Usage

**When you have an idea:**

```
/msg paperclip-ceo PRODUCT: [Name] | IDEA: [concept] | BUDGET: $[X]
```

Or just in the channel:

```
@paperclip-ceo PRODUCT: AI Note Taker | IDEA: Records meetings and writes agendas | BUDGET: $10000

Target: Product managers, meeting-heavy teams
Problem: Meetings create action items but nobody writes them down
```

### How It Works

1. Paperclip bot reads Slack message
2. Parses the product brief
3. Responds immediately:
   ```
   ✅ Parsed: "AI Note Taker"
   Market validation: 5 days
   Decision memo: By Aug 23
   Status updates: In-thread
   ```
4. Provides updates in Slack thread (faster feedback loop)

---

## Option 3: Web Form Trigger (Most Polished)

### Setup (30 min)

Create a simple landing page form and host it:

**URL:** `atlas-products.vercel.app` (or your domain)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Atlas - New Product Idea</title>
    <style>
        body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
        form { display: flex; flex-direction: column; gap: 15px; }
        label { font-weight: bold; }
        input, textarea, select { padding: 10px; font-size: 16px; }
        button { padding: 12px; background: #000; color: white; border: none; cursor: pointer; font-size: 16px; }
    </style>
</head>
<body>
    <h1>🚀 New Product Idea</h1>
    <p>Tell Atlas about your product idea. We'll launch it in 4 weeks.</p>
    
    <form action="https://api.paperclip.ai/webhooks/new-product" method="POST">
        <div>
            <label>Product Name *</label>
            <input type="text" name="product_name" required placeholder="e.g., Slack Summary Bot">
        </div>
        
        <div>
            <label>Core Idea *</label>
            <textarea name="idea" required placeholder="One sentence describing what it does" rows="2"></textarea>
        </div>
        
        <div>
            <label>Target Users *</label>
            <input type="text" name="target_users" required placeholder="e.g., Busy tech leads">
        </div>
        
        <div>
            <label>Problem Solved *</label>
            <textarea name="problem" required placeholder="What pain point does this solve?" rows="2"></textarea>
        </div>
        
        <div>
            <label>Budget Estimate *</label>
            <select name="budget" required>
                <option value="">-- Select --</option>
                <option value="5000">$5,000</option>
                <option value="10000">$10,000</option>
                <option value="20000">$20,000</option>
                <option value="50000">$50,000+</option>
            </select>
        </div>
        
        <div>
            <label>Timeline Preference</label>
            <select name="timeline">
                <option value="4-weeks">4 weeks (aggressive)</option>
                <option value="8-weeks">8 weeks (relaxed)</option>
                <option value="flexible">Flexible</option>
            </select>
        </div>
        
        <div>
            <label>Additional Notes (Optional)</label>
            <textarea name="notes" placeholder="Anything else we should know?" rows="3"></textarea>
        </div>
        
        <button type="submit">Submit Idea → Paperclip</button>
    </form>
</body>
</html>
```

### How It Works

1. Fill form on iPhone (or desktop)
2. Submit → Paperclip webhook receives it
3. Webhook parses and creates product record
4. Immediate redirect to status page:
   ```
   ✅ Product submitted: "Slack Summary Bot"
   
   Status: Market validation starting
   Next update: Aug 23 (5 days)
   
   Track progress: [Link to Paperclip dashboard]
   ```
5. Subsequent updates via email/Slack

---

## Option 4: Apple Shortcuts (iPhone-Native)

### Setup (15 min, advanced)

1. Open **Shortcuts** app on iPhone
2. Create new shortcut
3. Add steps:
   ```
   1. Ask for "Product name"
   2. Ask for "Your idea (one sentence)"
   3. Ask for "Target users"
   4. Ask for "Budget" with options ($5K, $10K, $20K, $50K+)
   5. Send email to paperclip-ceo@yourdomain.com
      Subject: PRODUCT: [name] | IDEA: [concept] | BUDGET: [amount]
   ```

4. Name it "💡 New Atlas Product"
5. Add to home screen icon

### Usage

- Tap the icon
- Answer 4 quick questions (30 seconds)
- Email sends to Paperclip
- Done!

---

## Monitoring Progress via iPhone

### Option A: Email Updates

CEO sends status emails at key milestones:
- **Day 5:** Phase 1 decision memo
- **Day 10:** Phase 2 architecture review
- **Day 25:** Launch readiness checklist
- **Day 26:** Launch confirmation
- **Ongoing:** Weekly growth updates

Just check email.

### Option B: Slack Notifications

```
@you Status: Market Validation Phase (30% complete)
- Market research: ✓ Complete
- Product brief: ⏳ In progress
- Brand positioning: ⏳ In progress
- Metrics KPIs: ⏳ In progress

Next update: Tomorrow
```

### Option C: Paperclip Dashboard

Paperclip has a mobile-optimized dashboard:
1. Open Paperclip on iPhone
2. View → Products
3. See all active products:
   ```
   Slack Summary Bot
   Phase: Validation (60% complete)
   Status: On track
   Next decision: Aug 23
   
   Previous Product
   Phase: Launch (100%)
   Users: 245
   MRR: $1,240
   ```

---

## Best Practices

### 1. **Capture Ideas Immediately**
When inspiration hits, don't wait. Fire off the email/shortcut right then.
- Market research starts immediately
- 5 days of validation runs in background
- You've already moved on to next idea

### 2. **Be Specific in Initial Brief**
Better input = better market research. Avoid:
- ❌ "An AI tool" (too vague)
- ✅ "AI tool that summarizes Slack threads for busy engineering leads"

### 3. **Set Realistic Budget**
Think: "What would I comfortably spend to validate this idea?"
- $5K = Lean MVP, minimal marketing
- $10K = Solid MVP, targeted ads
- $20K+ = Larger scope, stronger go-to-market

### 4. **Trust the Orchestration**
Don't try to "help" or micromanage the agents.
- Market research doesn't need your input (they have data)
- Product manager will reach out IF they need validation
- Trust the process

### 5. **Check In Weekly, Not Daily**
- Too much checking wastes mental cycles
- Status updates come automatically
- Only intervene if something is blocked

---

## Workflow Example: Start to Finish

**Day 1 (Tuesday, 11am)**
- ☕ Coffee shop, new idea strikes
- 🔥 Tap "💡 New Atlas Product" shortcut on iPhone
- ⏱️ 30 seconds to answer questions
- 📧 Email sent to Paperclip CEO

**Day 1 (Tuesday, 12pm)**
- 📬 Paperclip receives email
- 🤖 CEO creates product record
- 📤 Sends confirmation email back
- ✅ Phase 1 kickoff (4 agents start)

**Days 1-5 (Tue-Sat)**
- 🔬 Market research, product manager, brand, data analyst work in parallel
- 🤐 You don't hear anything (it's working)
- 📊 CEO orchestrating, monitoring, collecting outputs

**Day 5 (Saturday, 4pm)**
- 📧 CEO sends decision memo: **GO**
- 🟢 Market validation shows strong demand
- ✅ Product approved for Phase 2

**Day 6 (Sunday)**
- 👨‍💼 Human reviews memo, approves starting Phase 2
- 🏗️ Fullstack and platform-engineer begin architecture

**Days 6-12 (Sun-Sat)**
- 🎨 Design, infrastructure planning, marketing preparation
- 🎬 Marketing team writes content, designs landing page
- 🤖 CEO manages dependencies, gates approvals

**Day 12 (Saturday, 3pm)**
- 📊 Architecture review complete
- ✅ Human approves proceeding to build

**Days 13-25 (Sun-Fri)**
- 🔨 Fullstack and platform-engineer build MVP
- 🧪 QA intensive testing
- 📈 Marketing materials finalized
- 📊 Data analyst sets up monitoring

**Day 25 (Friday)**
- ✅ Product ready for launch
- 🔴 CEO asks for final human approval

**Day 26 (Saturday, 9am)**
- 🚀 LAUNCH DAY
- ⚡ All systems activate simultaneously
- 🎉 Product live

**Days 27-56 (Next 4 weeks)**
- 📊 Track metrics (conversions, retention)
- 🚀 Growth agents optimize and scale
- 💰 Monitor revenue progress toward profitability

**You've done ~5 hours of actual work. Paperclip did ~500 hours.**

---

## Troubleshooting

### "I submitted an idea but haven't heard back in 2 hours"

**Paperclip may be:**
- Processing the initial market research
- Waiting for clarification on budget/timeline
- Experiencing high load (many ideas submitted)

**Action:** Check Slack or email in 12 hours, should have confirmation.

### "Phase 1 decision seems wrong"

**Options:**
1. Reply to the decision memo with your feedback
2. Ask CEO to reconsider specific data point
3. Reject and pivot (don't launch a bad product)

CEO will escalate to you if there's disagreement with market data.

### "Product is launched but metrics are bad"

**CEO's next move:**
- Recommend pivot (try different positioning)
- Recommend invest more (double ads budget)
- Recommend kill (learnings saved, next product)

Your role: Approve one of these directions by end of week 4.

---

## Next: Actually Do It

1. **Pick your trigger method:** Email (simplest) or Web Form (best UX)
2. **Try it once:** Submit a real product idea
3. **Watch Phase 1 complete:** Takes 5 days
4. **Approve Phase 2:** Takes 2 hours of your time
5. **Let it run:** Takes 3 weeks while you do other things
6. **Launch:** Takes 1 day
7. **Scale it:** Takes 4 weeks to profitable

**That's it. That's the entire system.**

You're now running a **product factory** that orchestrates itself.
