# Claude Integration: In-App Product Guidance & Validation

## Vision

Transform each product project into an interactive workspace where:

1. **You discuss** your product idea with Claude directly in Paperclip
2. **Claude guides** you through strategy, design, market positioning
3. **You validate** ideas/improvements in the conversation
4. **System auto-launches** the corresponding phase/agent task

Result: Each project becomes a **collaborative development space** between you and Claude, with automatic execution.

---

## Architecture

### Three Components

**1. Claude API Integration** (Backend)
- Paperclip calls Claude API for each project
- Maintains conversation context per project
- Converts validated ideas → agent tasks

**2. Project Chat Interface** (Frontend)
- Interactive chat within each product project
- Shows project context (meta, timeline, current phase)
- Real-time Claude responses
- Validation buttons: ✅ Approve / ❌ Reject / 🔄 Iterate

**3. Validation → Execution Pipeline** (Orchestration)
- When you validate a decision: system creates agent task
- Automatically kicks off next phase or adjustment
- Logs decision in approval history
- Triggers relevant agents

---

## How It Works: End-to-End

### Scenario: First Product Submission

**Step 1: Submit Idea**
```
You (via email/Slack):
"PRODUCT: Slack Summary Bot | IDEA: Summarize threads | BUDGET: $10K"

Paperclip CEO receives → Creates project → Starts Phase 1
```

**Step 2: Chat with Claude About This Project**
```
URL: paperclip.app/projects/atlas-2026-Q3-001/chat

You: "I'm worried about the market size. Is this really a $2M TAM?"

Claude (context-aware, sees all project docs):
"Good question. Your market research found $2M based on:
- 50M Slack users globally
- 2% are 'power users' managing teams (1M)
- 30% would pay for summarization (300K)
- $80/month average price = $288M market

But realistic SAM for you: $5-10M (targeting US/EU, high-paying teams).

Risk: Superhuman already owns this niche. Differentiation:
- They're $99/month, you're $49/month
- They focus on inbox, you focus on Slack
- Unique: AI learns your team's decision-making style

Question: Ready to proceed with this positioning, or pivot to B2B email first?"

[✅ PROCEED] [🔄 PIVOT] [❌ REJECT]
```

**Step 3: You Click PROCEED**
```
System:
- Logs decision to project approval_history
- Updates product status → "phase_1_validated"
- Automatically triggers Phase 2 architecture kickoff
- CEO immediately delegates to fullstack + platform-engineer
- Creates tasks in project dashboard
```

---

## Data Model: Project + Chat

### Project Record (Enhanced)

```json
{
  "product_id": "atlas-2026-Q3-001",
  "name": "Slack Summary Bot",
  "status": "phase_2_architecture",
  "phases": {...},
  
  "chat": {
    "enabled": true,
    "model": "claude-opus-5",
    "conversation_history": [
      {
        "timestamp": "2026-08-23T10:30:00Z",
        "role": "user",
        "message": "I'm worried about market size...",
        "project_context_included": true
      },
      {
        "timestamp": "2026-08-23T10:31:00Z",
        "role": "assistant",
        "message": "Good question. Your market research found...",
        "validation_required": true,
        "options": ["PROCEED", "PIVOT", "REJECT"]
      }
    ],
    "context_sources": [
      "01-market-research/market-analysis.md",
      "02-product-brief/brief.md",
      "03-brand/positioning-statement.md"
    ]
  },

  "decisions": [
    {
      "decision_id": "dec-001",
      "timestamp": "2026-08-23T10:32:00Z",
      "type": "market_positioning_validation",
      "decision": "PROCEED with $49/month positioning vs Superhuman",
      "decided_by": "claude_suggestion + human_approval",
      "action_taken": "triggered_phase_2_architecture_kickoff",
      "triggered_agent_tasks": [
        "fullstack: UI/UX design for Slack integration",
        "platform-engineer: Slack API infrastructure"
      ]
    }
  ]
}
```

---

## The Chat Interface (Mockup)

```
┌─ Slack Summary Bot (Atlas Q3-001) ─────────────────────┐
│ Phase: 2 - Architecture (10% complete)                 │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Recent Project Docs:                                   │
│ • Market validation: GO ✓                              │
│ • TAM: $2M annually                                    │
│ • Positioning: Cheaper, AI-focused alternative         │
│ • Timeline: 14 days to architecture                    │
│                                                         │
├────────────────────────────────────────────────────────┤
│ CHAT HISTORY:                                          │
│                                                         │
│ You (10:30 AM):                                        │
│ "I'm worried about the market size. Is this really    │
│  a $2M TAM?"                                           │
│                                                         │
│ Claude (10:31 AM):                                     │
│ "Good question. Your market research found $2M based  │
│  on: [context from docs shown] ...                    │
│                                                         │
│  Ready to proceed with this positioning, or pivot?"   │
│                                                         │
│ [✅ PROCEED] [🔄 PIVOT] [❌ REJECT]                   │
│                                                         │
├────────────────────────────────────────────────────────┤
│ Type your question or feedback...                      │
│ [________________] [Send]                              │
│                                                         │
│ Quick prompts:                                         │
│ [Ask about pricing] [Review market] [Suggest feature] │
│ [Check timeline] [Discuss positioning]                │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Claude's Role in Each Phase

### Phase 1: Market Validation
```
You: "I think executives would pay more than $49/month"

Claude (sees market research data):
"You're right. Your research showed willingness to pay:
- 60% of interviewees said they'd pay $99+/month
- Competitors charge $99-299/month
- Your team is efficient (lower CAC than competitors)

Recommendation: Test $99/month tier first
→ Better margins, still competitive
→ Can always discount later

Decision: Adjust pricing hypothesis and re-validate with 5 customers?"

[✅ APPROVE PRICE CHANGE] [🔄 TEST BOTH TIERS] [❌ STICK WITH $49]
```

### Phase 2: Architecture
```
You: "Should we use AWS Lambda or traditional server?"

Claude (sees infrastructure spec):
"Your expected traffic: 50 users week 1, scaling to 5K by month 3.
Lambda costs: $0.02 per million requests
Traditional (Vercel): $20-100/month fixed

Recommendation: Start with Vercel (simpler, faster to MVP)
→ Scale to Lambda if you exceed 1M requests/month
→ Re-evaluate costs quarterly

This keeps you lean and deployable in days, not weeks.

Decision: Proceed with Vercel for MVP launch?"

[✅ PROCEED VERCEL] [🔄 HYBRID] [❌ GO FULL AWS]
```

### Phase 3: Development
```
You: "QA is finding edge cases in the summarization algorithm"

Claude (sees test results, QA reports):
"3 edge cases found:
1. Threads with >100 messages (5% of usage)
2. Threads with special characters/emojis (2% of usage)
3. Very long messages (30KB+) - 0.1% of usage

Impact: Low (affects 7% of threads)
Effort to fix: 2-4 hours per case

Recommendation: Ship with known limitations, document them
→ Add to help docs: "Current: max 80 messages, no special chars"
→ Fix in week 2 v1.1 update
→ Prioritize by frequency, not criticality

Decision: Launch with documented limitations?"

[✅ SHIP WITH LIMITS] [🔄 FIX 1 CASE FIRST] [❌ FIX ALL NOW]
```

### Phase 4: Launch
```
You: "Should we launch on Product Hunt on day 1?"

Claude (sees GTM strategy, marketing plan):
"Your growth plan targets: organic first, ads second.
Product Hunt timing:
- Pro: 5K-10K potential views, high-intent audience
- Con: Need 5-star reviews ready, can only launch once

Recommendation: YES, but wait for week 2 after you have:
- 50+ users with positive feedback
- At least 10 reviews (proof it works)
- Landing page fully optimized

This gives you better launch momentum and reviews.

Alternative: Ship quietly this week, prep PH launch for week 2?

Decision: Launch organically now, PH in week 2?"

[✅ QUIET LAUNCH NOW, PH WEEK 2] [🔄 WAIT, DO PH NOW] [❌ SKIP PH]
```

### Phase 5: Growth
```
You: "Retention is 35%, I want 50%"

Claude (sees weekly cohort data, usage patterns):
"Cohort analysis shows:
- Users who onboard with setup call: 60% retention
- Users with email nurture sequence: 45% retention
- Users with self-serve only: 20% retention

Biggest lever: Onboarding. You have 30 signups.

Recommendation: 1:1 setup calls with first 10 users
→ Time: 2 hours per week (manageable)
→ Expected retention: +15-20%
→ Bonus: Qualitative feedback for improvements

Do 10 calls this week, aim for 50% retention by week 4?"

[✅ DO 10 SETUP CALLS] [🔄 DO 5 CALLS + EMAIL] [❌ EMAIL ONLY]
```

---

## Implementation: Step-by-Step

### Week 1: Setup & Integration

**Day 1-2: API Integration**
```
1. Create Paperclip backend endpoint: /api/projects/:id/chat
2. Configure Claude API key (in secure env vars, NOT in code)
3. Set up conversation persistence (database stores chat history)
4. Build project context loader (reads project docs)
```

**Day 3-4: Chat Interface**
```
1. Build chat UI component (React)
2. Connect to /api/projects/:id/chat endpoint
3. Add quick prompt buttons
4. Add validation button set ([✅] [🔄] [❌])
```

**Day 5: Decision Pipeline**
```
1. When validation clicked: capture decision
2. Store in project approval_history
3. Trigger corresponding agent tasks
4. Update project status/phase
```

**Day 6-7: Testing**
```
1. Test end-to-end: chat → validation → agent task creation
2. Verify Claude has correct context
3. Verify decisions are logged
4. Verify agent tasks trigger correctly
```

### Week 2: Refinement

**Polish:**
- Add project context sidebar (shows current phase, timeline, risks)
- Add quick action buttons for common decisions
- Add decision history view (shows all past decisions)
- Add Claude "thinking" view (show reasoning)

---

## Claude's System Prompt (For Project Chat)

```markdown
# Claude: Project Development Guide

You are embedded in a product development app (Paperclip Atlas).
Your role: Help users build better products by providing strategic guidance,
analyzing project data, and validating decisions.

## Context Available to You

For each product project, you have access to:
- Market research (TAM, competitors, demand signals)
- Product brief (MVP scope, user stories, roadmap)
- Brand positioning (naming, tagline, tone)
- Success metrics (KPIs, growth model, unit economics)
- Development status (architecture, code, tests, bugs)
- Launch materials (landing page, emails, social content)
- Post-launch metrics (users, retention, revenue)
- All decisions made to date (approval history)

## Your Responsibilities

1. **Understand Context**: Read project docs automatically. Never give generic advice.
2. **Ask Clarifying Questions**: Before recommending, understand the user's specific situation.
3. **Provide Data-Backed Insights**: Reference project data. Show your reasoning.
4. **Suggest Clear Decisions**: Every major point should end with a decision prompt.
5. **Support Validation**: When user chooses [✅/🔄/❌], acknowledge and move forward.
6. **Track Reasoning**: Users can see why you recommended something, and disagree.

## Decision Format

Always end strategic guidance with clear options:

"Your situation: [Summary of data]

Analysis: [What this means]

Recommendation: [Suggested path]

Decision: [Your choice?]

[✅ OPTION A] [🔄 OPTION B] [❌ OPTION C]"

## Important Rules

- NEVER invent market data. Only use project research.
- ALWAYS reference the source of your data (which doc)
- NEVER recommend skipping approval gates or human decisions
- ALWAYS acknowledge when you're uncertain ("This depends on...you'll need to validate")
- ENCOURAGE user to override you ("Your instinct might be right, here's why I disagreed")

## When to Escalate

Flag to user if:
- Decision affects irreversible changes (pricing, positioning)
- User is 2+ weeks behind timeline
- You see conflicting data (market research says X, but user is doing Y)
- Risk level is high and data is uncertain
```

---

## Integration Code (Pseudocode)

### Backend Endpoint

```python
# /api/projects/:id/chat

POST /api/projects/:id/chat
{
  "message": "I'm worried about market size...",
  "validation_response": null  # Or { "decision": "PROCEED" } if validating
}

Response:
{
  "message": "Claude's response...",
  "validation_required": true,
  "options": ["PROCEED", "PIVOT", "REJECT"],
  "project_context": {
    "current_phase": "phase_1_validation",
    "data_sources": ["market-analysis.md", "brief.md"]
  }
}
```

### When User Validates

```python
POST /api/projects/:id/chat/validate
{
  "decision": "PROCEED",
  "reasoning": "Claude suggested this, I agree"
}

System:
1. Load project record
2. Log decision to approval_history
3. Based on phase + decision:
   - If Phase 1 GO: Trigger Phase 2 kickoff
   - If Phase 2 APPROVAL: Trigger development sprint
   - If Phase 3 APPROVAL: Trigger launch prep
   - If Phase 4 GO: Activate systems
4. Create agent tasks for next step
5. Update project status
6. Notify user: "✅ Decision logged. Phase 2 architects briefed."
```

---

## Security & API Key Management

### ✅ DO THIS:

1. **Store API Key in Environment Variable**
   ```
   CLAUDE_API_KEY=sk-ant-api03-...
   # In .env or secure vault, NEVER in code
   ```

2. **Use Server-Side API Calls**
   - Never expose API key to frontend
   - Backend calls Claude API
   - Frontend gets responses only

3. **Rate Limit**
   - 1 request per 5 seconds per project
   - Prevents accidental API spend
   - Costs tracked per project

4. **Log All Requests**
   - Every Claude call logged (for audit)
   - Every decision logged
   - Cost tracking per project

### ❌ DO NOT DO THIS:

- ❌ Expose API key in frontend code
- ❌ Commit API key to git
- ❌ Share API key in Slack/email
- ❌ Use same key across multiple systems
- ❌ Store key in database

---

## Cost Model

### Estimated Costs

**Per Project (4-week cycle):**
- Phase 1: 10 Claude calls × 3K tokens = ~$0.30
- Phase 2: 15 Claude calls × 4K tokens = ~$0.60
- Phase 3: 20 Claude calls × 5K tokens = ~$1.00
- Phase 4-5: 20 Claude calls × 3K tokens = ~$0.60
- **Total per product: ~$2.50**

**Per Year (10 products):**
- 10 products × $2.50 = $25
- Plus API overhead: ~$5
- **Total annual: ~$30**

(Assumes Claude Opus pricing: ~$0.00003 per input token, ~$0.0001 per output token)

### Set Budget Limits

```
CLAUDE_API_MONTHLY_BUDGET: $100  # Soft limit
CLAUDE_API_PROJECT_LIMIT: $10   # Per product max
```

---

## Quick Integration Checklist

### To Get Started Today:

- [ ] Store new Claude API key in `.env`
- [ ] Create `/api/projects/:id/chat` endpoint
- [ ] Build chat UI component
- [ ] Connect chat to endpoint
- [ ] Test: Chat → Validation → Agent Task

### By End of Week:

- [ ] Integrate project context into Claude prompts
- [ ] Test decision pipeline (validation → execution)
- [ ] Polish UI/UX
- [ ] Document usage in project guides

### By End of Month:

- [ ] Run 1 full product through with Claude guidance
- [ ] Refine prompts based on real usage
- [ ] Add decision analytics dashboard
- [ ] Scale to multiple simultaneous products

---

## Example Workflow

### Day 1: Product Submitted
```
You: "PRODUCT: Slack Summary Bot | IDEA: Summarize threads | BUDGET: $10K"

System: Creates project, starts Phase 1
```

### Day 2: Chat with Claude
```
You (in project chat):
"Market research seems pessimistic. Are we really only $2M TAM?"

Claude (context-aware):
"I see your market research found $2M based on [specific methodology].
That's actually solid - you're being conservative. Real opportunity:
[Shows reasoning with data]

Decision: Proceed with current market assumptions, or dig deeper?"

[✅ PROCEED] [🔄 RESEARCH MORE] [❌ PIVOT]
```

### Day 3: Validation → Execution
```
You click: [✅ PROCEED]

System automatically:
1. Logs decision to project record
2. Updates status: phase_1_validated → phase_2_architecture_starting
3. Sends briefing to fullstack: "Slack Summary Bot architecture..."
4. Sends briefing to platform-engineer: "Infrastructure setup..."
5. Updates project dashboard: "Phase 2 in progress"

You see: "✅ Phase 2 architecture kickoff. Team briefed."
```

### Day 8: Chat About Architecture
```
You (in project chat):
"Fullstack wants to use React for frontend. Thoughts?"

Claude (sees architecture docs):
"Good choice. Your requirements:
- Real-time updates (chat)
- Slack integration (webhooks)
- Mobile-responsive (executives on mobile)

React + WebSockets fits perfectly.
Alternative: Vue (lighter, still solid).

Decision: Stick with React, or explore Vue?"

[✅ STICK REACT] [🔄 TRY VUE] [❌ USE SVELTE]
```

### Day 10: Architecture Approval
```
You click: [✅ STICK REACT]

System:
1. Logs decision
2. Notifies fullstack: approved to proceed
3. Moves to Phase 3: Development
4. Triggers QA team briefing
5. Updates timeline: "Development starts today"
```

### Day 25: QA Issues
```
You (in project chat):
"QA found 3 edge cases. Should we fix before launch or ship anyway?"

Claude (sees test results):
"Edge cases affect 7% of usage, none are critical.
Impact on launch: Low
Effort to fix: 2-4 hours per case

Recommendation: Ship, document limitations, fix in v1.1

Decision: Launch with known limits, or delay 2 days to fix all?"

[✅ SHIP NOW] [🔄 FIX 1 CASE] [❌ FIX ALL]
```

### Day 26: Launch Day
```
You click: [✅ SHIP NOW]

System:
1. Logs "QA approved for launch"
2. Final approval check
3. Requests human confirmation: "Launch in 2 hours?"
4. Activates: features → monitoring → emails → ads
5. Updates status: LIVE

You see: "🚀 LIVE | Users: 12 | Conversion: 8%"
```

---

## Next: Building This

You have two paths:

**Path A: Use Paperclip's Native Integration** (If available)
- Paperclip may have built-in Claude support
- Check Paperclip dashboard → Integrations → Claude

**Path B: Custom Integration** (DIY)
- Build `/api/projects/:id/chat` endpoint
- Connect Claude API via backend
- Wire up validation pipeline

**Recommend: Path A first** (easier, faster)
**Fallback: Path B** (if Path A not available)

Want me to show you how to build Path B?
