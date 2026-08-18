# Claude Integration: Implementation Guide

## Before You Start

⚠️ **Security First:**
1. Generate a NEW Claude API key at https://console.anthropic.com/account/keys
2. Delete the old key you shared
3. Save new key in `.env` file (never in code, never share)

---

## Option 1: Paperclip Native Integration (Easiest)

### Check If Available

In Paperclip dashboard:
1. Go to **Settings** → **Integrations**
2. Look for "Claude API" or "Anthropic"
3. If found:
   - Click **Connect**
   - Paste your NEW API key
   - Enable "Project Chat"
   - Save

**Done.** Claude chat is now available in each project.

---

## Option 2: Build Custom Integration (DIY)

Use this if Paperclip doesn't have native Claude support.

### Setup: Backend (Node.js + Express Example)

**1. Install Dependencies**

```bash
npm install express dotenv @anthropic-ai/sdk axios
```

**2. Create `.env` File** (NEVER commit this)

```env
# .env
CLAUDE_API_KEY=sk-ant-api03-YOUR_NEW_KEY_HERE
PAPERCLIP_API_KEY=your-paperclip-api-key
PORT=3000
```

**3. Create Backend Server** (`server.js`)

```javascript
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// ============================================
// PROJECT CHAT ENDPOINT
// ============================================

app.post('/api/projects/:projectId/chat', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, validationResponse } = req.body;

    // Load project metadata
    const projectPath = `projects/${projectId}/meta.json`;
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectMeta = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

    // Load project context documents
    const context = await loadProjectContext(projectId, projectMeta);

    // If user is validating a decision
    if (validationResponse) {
      await handleValidation(projectId, projectMeta, validationResponse);
    }

    // Call Claude with project context
    const response = await callClaudeWithContext(
      message,
      context,
      projectMeta
    );

    // Save chat to project history
    await saveChatMessage(projectId, 'user', message);
    await saveChatMessage(projectId, 'assistant', response.message);

    res.json({
      message: response.message,
      validationRequired: response.validationRequired,
      options: response.options,
      projectContext: {
        currentPhase: projectMeta.status,
        dataSources: response.dataSources,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VALIDATION HANDLER
// ============================================

app.post('/api/projects/:projectId/chat/validate', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { decision, reasoning } = req.body;

    const projectPath = `projects/${projectId}/meta.json`;
    const projectMeta = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

    // Log decision
    const decisionRecord = {
      decision_id: `dec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: `${projectMeta.status}_validation`,
      decision: decision,
      reasoning: reasoning,
      decided_by: 'human_with_claude_guidance',
    };

    if (!projectMeta.decisions) {
      projectMeta.decisions = [];
    }
    projectMeta.decisions.push(decisionRecord);

    // Trigger next phase based on decision
    const nextAction = determineNextAction(projectMeta, decision);
    decisionRecord.action_taken = nextAction.action;
    decisionRecord.triggered_agent_tasks = nextAction.tasks;

    // Update project
    projectMeta.status = nextAction.nextPhase;
    fs.writeFileSync(projectPath, JSON.stringify(projectMeta, null, 2));

    // Trigger agent tasks
    if (nextAction.tasks.length > 0) {
      await triggerAgentTasks(projectId, projectMeta, nextAction.tasks);
    }

    res.json({
      success: true,
      message: `✅ Decision logged: ${decision}`,
      nextPhase: nextAction.nextPhase,
      nextAction: nextAction.action,
      agentTasksTriggered: nextAction.tasks.length,
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function loadProjectContext(projectId, projectMeta) {
  const context = {
    productName: projectMeta.name,
    status: projectMeta.status,
    marketData: null,
    productBrief: null,
    positioning: null,
    metrics: null,
    developmentStatus: null,
    decisions: projectMeta.decisions || [],
  };

  const basePath = `projects/${projectId}`;

  // Load each doc type
  if (fs.existsSync(`${basePath}/01-market-research/market-analysis.md`)) {
    context.marketData = fs.readFileSync(
      `${basePath}/01-market-research/market-analysis.md`,
      'utf8'
    );
  }

  if (fs.existsSync(`${basePath}/02-product-brief/brief.md`)) {
    context.productBrief = fs.readFileSync(
      `${basePath}/02-product-brief/brief.md`,
      'utf8'
    );
  }

  if (fs.existsSync(`${basePath}/03-brand/positioning-statement.md`)) {
    context.positioning = fs.readFileSync(
      `${basePath}/03-brand/positioning-statement.md`,
      'utf8'
    );
  }

  if (fs.existsSync(`${basePath}/04-metrics/success-metrics.json`)) {
    context.metrics = JSON.parse(
      fs.readFileSync(`${basePath}/04-metrics/success-metrics.json`, 'utf8')
    );
  }

  return context;
}

async function callClaudeWithContext(userMessage, context, projectMeta) {
  // Build system prompt with project context
  const systemPrompt = `You are Claude, embedded in a product development app (Paperclip Atlas).

Your role: Help users build better products by providing strategic guidance based on project data.

## Current Project Context
- Product: ${context.productName}
- Phase: ${context.status}
- Previous Decisions: ${context.decisions.length}

## Available Project Data
- Market Research: ${context.marketData ? 'Available' : 'Not yet'}
- Product Brief: ${context.productBrief ? 'Available' : 'Not yet'}
- Positioning: ${context.positioning ? 'Available' : 'Not yet'}
- Success Metrics: ${context.metrics ? 'Available' : 'Not yet'}

## Your Instructions
1. Use project data to provide specific, data-backed guidance
2. Never invent data - only reference what exists in project docs
3. Always explain your reasoning with sources
4. When making recommendations, give user clear decision options
5. Format decisions as: [✅ OPTION A] [🔄 OPTION B] [❌ OPTION C]

## Important
- Be conversational but precise
- If data is missing, ask user to provide it
- Acknowledge when you're uncertain
- Support user overriding your recommendations`;

  const messages = [
    {
      role: 'user',
      content: userMessage,
    },
  ];

  // Add full context as assistant message (for Claude to understand)
  let contextString = '\n\n=== PROJECT CONTEXT ===\n';
  if (context.marketData) contextString += `\nMarket Data:\n${context.marketData}`;
  if (context.productBrief) contextString += `\nProduct Brief:\n${context.productBrief}`;
  if (context.positioning) contextString += `\nPositioning:\n${context.positioning}`;
  if (context.metrics) contextString += `\nMetrics:\n${JSON.stringify(context.metrics, null, 2)}`;

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1500,
    system: systemPrompt + contextString,
    messages: messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Check if response asks for decision
  const needsValidation = content.text.includes('[✅') || content.text.includes('[🔄');

  return {
    message: content.text,
    validationRequired: needsValidation,
    options: needsValidation
      ? ['PROCEED', 'ITERATE', 'REJECT']
      : [],
    dataSources: getDataSources(context),
  };
}

async function saveChatMessage(projectId, role, message) {
  const chatPath = `projects/${projectId}/chat.json`;

  let chat = [];
  if (fs.existsSync(chatPath)) {
    chat = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
  }

  chat.push({
    timestamp: new Date().toISOString(),
    role: role,
    message: message,
  });

  fs.writeFileSync(chatPath, JSON.stringify(chat, null, 2));
}

function determineNextAction(projectMeta, decision) {
  const currentPhase = projectMeta.status;

  // Map decisions to next phases
  const phaseTransitions = {
    phase_1_validation: {
      PROCEED: { nextPhase: 'phase_2_architecture', action: 'trigger_phase_2_architecture_kickoff', tasks: ['fullstack_architecture', 'platform_engineer_infrastructure'] },
      PIVOT: { nextPhase: 'phase_1_validation', action: 'revalidate_with_new_positioning', tasks: ['market_research_revalidate'] },
      REJECT: { nextPhase: 'killed', action: 'kill_product', tasks: [] },
    },
    phase_2_architecture: {
      PROCEED: { nextPhase: 'phase_3_development', action: 'trigger_development_sprint', tasks: ['fullstack_development', 'platform_engineer_deployment', 'qa_setup'] },
      ITERATE: { nextPhase: 'phase_2_architecture', action: 'continue_architecture_refinement', tasks: ['architecture_refinement'] },
      REJECT: { nextPhase: 'phase_1_validation', action: 'pivot_back_to_validation', tasks: [] },
    },
    phase_3_development: {
      PROCEED: { nextPhase: 'phase_4_launch', action: 'trigger_launch_preparation', tasks: ['launch_coordinator', 'data_analyst_monitoring_setup'] },
      ITERATE: { nextPhase: 'phase_3_development', action: 'continue_development', tasks: ['continue_build'] },
      REJECT: { nextPhase: 'killed', action: 'kill_product', tasks: [] },
    },
    phase_4_launch: {
      PROCEED: { nextPhase: 'phase_5_post_launch', action: 'activate_all_systems', tasks: ['activate_features', 'enable_monitoring', 'start_emails', 'launch_social'] },
      HOLD: { nextPhase: 'phase_4_launch', action: 'delay_launch', tasks: [] },
    },
  };

  const transition = phaseTransitions[currentPhase]?.[decision];
  if (!transition) {
    return { nextPhase: currentPhase, action: 'no_action', tasks: [] };
  }

  return transition;
}

async function triggerAgentTasks(projectId, projectMeta, tasks) {
  console.log(`[${projectId}] Triggering agent tasks:`, tasks);

  // For each task, create a briefing for the agent
  for (const task of tasks) {
    const briefing = generateAgentBriefing(task, projectMeta);
    console.log(`[${projectId}] → ${task}:`, briefing);
    // In real implementation, send this to Paperclip/agent system
  }
}

function generateAgentBriefing(task, projectMeta) {
  const briefings = {
    fullstack_architecture: `Design UI/UX and component architecture for ${projectMeta.name}. Coordinate API spec with platform-engineer.`,
    platform_engineer_infrastructure: `Design infrastructure and CI/CD for ${projectMeta.name}. Coordinate with fullstack on API contracts.`,
    qa_setup: `Prepare testing strategy and automation setup for ${projectMeta.name}.`,
    launch_coordinator: `Prepare launch sequence for ${projectMeta.name}. Coordinate all teams.`,
  };

  return briefings[task] || `Execute task: ${task}`;
}

function getDataSources(context) {
  const sources = [];
  if (context.marketData) sources.push('market-analysis.md');
  if (context.productBrief) sources.push('product-brief.md');
  if (context.positioning) sources.push('positioning-statement.md');
  if (context.metrics) sources.push('success-metrics.json');
  return sources;
}

// ============================================
// SERVER
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Project Chat Server running on port ${PORT}`);
  console.log(`Endpoint: POST /api/projects/:projectId/chat`);
  console.log(`Validation: POST /api/projects/:projectId/chat/validate`);
});
```

**4. Run the Server**

```bash
node server.js

# Output:
# Project Chat Server running on port 3000
# Endpoint: POST /api/projects/:projectId/chat
```

---

### Setup: Frontend (React Component Example)

**1. Create Chat Component** (`ProjectChat.jsx`)

```jsx
import React, { useState, useRef, useEffect } from 'react';
import './ProjectChat.css';

export default function ProjectChat({ projectId, projectData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationOptions, setValidationOptions] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call backend
      const response = await fetch(
        `/api/projects/${projectId}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await response.json();

      // Add Claude response
      const claudeMessage = {
        role: 'assistant',
        message: data.message,
      };
      setMessages((prev) => [...prev, claudeMessage]);

      // Show validation options if needed
      if (data.validationRequired) {
        setValidationOptions(data.options);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', message: 'Error: ' + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (decision) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/chat/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: decision,
            reasoning: 'User validated via chat interface',
          }),
        }
      );

      const data = await response.json();

      // Show confirmation
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          message: `✅ ${data.message}\n\n→ ${data.nextAction}\n→ ${data.agentTasksTriggered} agent tasks triggered`,
        },
      ]);

      setValidationOptions(null);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  return (
    <div className="project-chat">
      <div className="chat-header">
        <h2>{projectData.name}</h2>
        <p className="phase-badge">{projectData.status}</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        {loading && <div className="message assistant">Claude is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {validationOptions && (
        <div className="validation-options">
          {validationOptions.map((option) => (
            <button
              key={option}
              className={`validation-btn ${option.toLowerCase()}`}
              onClick={() => handleValidation(option)}
            >
              {option === 'PROCEED' && '✅'}
              {option === 'ITERATE' && '🔄'}
              {option === 'REJECT' && '❌'}
              {' '}
              {option}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Claude about this project..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

**2. Add Styling** (`ProjectChat.css`)

```css
.project-chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background: #f9f9f9;
}

.chat-header h2 {
  margin: 0;
  font-size: 16px;
}

.phase-badge {
  font-size: 12px;
  color: #666;
  margin: 5px 0 0 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin: 10px 0;
  padding: 10px 12px;
  border-radius: 6px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  background: #007bff;
  color: white;
  margin-left: 20%;
}

.message.assistant {
  background: #f0f0f0;
  color: #333;
  margin-right: 20%;
}

.message.system {
  background: #e7f3e7;
  color: #2d5016;
  margin-right: 0;
  border-left: 3px solid #2d5016;
}

.validation-options {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
}

.validation-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.validation-btn.proceed {
  border-color: #28a745;
  color: #28a745;
}

.validation-btn.proceed:hover {
  background: #28a745;
  color: white;
}

.validation-btn.iterate {
  border-color: #ffc107;
  color: #ffc107;
}

.validation-btn.reject {
  border-color: #dc3545;
  color: #dc3545;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.chat-input button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## Testing Your Integration

### Test 1: Send a Message

```bash
curl -X POST http://localhost:3000/api/projects/atlas-2026-Q3-001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am worried about market size. Is $2M TAM realistic?"
  }'
```

Expected response:
```json
{
  "message": "Claude's data-backed analysis...",
  "validationRequired": true,
  "options": ["PROCEED", "ITERATE", "REJECT"],
  "projectContext": {
    "currentPhase": "phase_1_validation",
    "dataSources": ["market-analysis.md", "brief.md"]
  }
}
```

### Test 2: Validate a Decision

```bash
curl -X POST http://localhost:3000/api/projects/atlas-2026-Q3-001/chat/validate \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "PROCEED",
    "reasoning": "Claude convinced me the market is real"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "✅ Decision logged: PROCEED",
  "nextPhase": "phase_2_architecture",
  "nextAction": "trigger_phase_2_architecture_kickoff",
  "agentTasksTriggered": 2
}
```

---

## Deployment

### Option A: Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Create vercel.json
cat > vercel.json << 'EOF'
{
  "env": {
    "CLAUDE_API_KEY": "@claude_api_key"
  }
}
EOF

# 3. Deploy
vercel

# 4. Add secrets
vercel env add CLAUDE_API_KEY
# Paste your NEW API key
```

### Option B: Deploy to Heroku

```bash
# 1. Create app
heroku create your-atlas-chat

# 2. Set secrets
heroku config:set CLAUDE_API_KEY=sk-ant-api03-...

# 3. Deploy
git push heroku main
```

---

## Security Checklist

Before going live:

- [ ] API key stored in `.env`, NOT in code
- [ ] `.env` added to `.gitignore`
- [ ] No API key in logs or error messages
- [ ] Rate limiting enabled (1 req/5s per project)
- [ ] API calls use HTTPS only
- [ ] Decision logging enabled
- [ ] Cost tracking per project
- [ ] Monthly budget limit set ($100)
- [ ] Access logs stored for audit
- [ ] Error handling doesn't expose secrets

---

## Next Steps

1. **Today:** Set up Option 1 or 2 (whichever you choose)
2. **Test:** Send a message to Claude via your project
3. **Validate:** Click a decision button and watch it trigger Phase 2
4. **Monitor:** Watch project status update automatically
5. **Scale:** Add to all projects in your portfolio

---

## Troubleshooting

**"API key invalid"**
→ Generate a NEW key at https://console.anthropic.com/account/keys
→ Update `.env` file
→ Restart server

**"Project not found"**
→ Ensure `projects/{projectId}/meta.json` exists
→ Check projectId is correct

**"No response from Claude"**
→ Check API key is valid
→ Check rate limiting (wait 5+ seconds between requests)
→ Check Claude API status: https://status.anthropic.com

**"Decision not triggering agent tasks"**
→ Check `determineNextAction()` maps your phase + decision
→ Add the mapping if missing
→ Restart server

---

You're ready to build a collaborative product development system where Claude and you work together in real-time! 🚀
