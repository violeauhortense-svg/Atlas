const express = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    system: 'Atlas Product Orchestration + Claude Integration',
  });
});

// ============================================
// PROJECT CHAT ENDPOINT
// ============================================

app.post('/api/projects/:projectId/chat', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, validationResponse } = req.body;

    if (!message && !validationResponse) {
      return res.status(400).json({ error: 'Message or validationResponse required' });
    }

    // Load project metadata
    const projectPath = path.join(__dirname, 'projects', projectId, 'meta.json');
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: `Project ${projectId} not found` });
    }

    const projectMeta = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

    // Load project context documents
    const context = await loadProjectContext(projectId, projectMeta);

    // If user is validating a decision
    if (validationResponse) {
      await handleValidation(projectId, projectMeta, validationResponse);
    }

    // Call Claude with project context
    const response = await callClaudeWithContext(message, context, projectMeta);

    // Save chat to project history
    if (message) {
      await saveChatMessage(projectId, 'user', message);
      await saveChatMessage(projectId, 'assistant', response.message);
    }

    res.json({
      success: true,
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

    if (!decision) {
      return res.status(400).json({ error: 'Decision required' });
    }

    const projectPath = path.join(__dirname, 'projects', projectId, 'meta.json');
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: `Project ${projectId} not found` });
    }

    const projectMeta = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

    // Log decision
    const decisionRecord = {
      decision_id: `dec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: `${projectMeta.status}_validation`,
      decision: decision,
      reasoning: reasoning || 'User validated via chat interface',
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

    // Trigger agent tasks (in production, this would call your agent system)
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
// LIST PROJECTS
// ============================================

app.get('/api/projects', (req, res) => {
  try {
    const projectsDir = path.join(__dirname, 'projects');
    if (!fs.existsSync(projectsDir)) {
      return res.json({ projects: [] });
    }

    const projects = fs.readdirSync(projectsDir)
      .filter(dir => fs.existsSync(path.join(projectsDir, dir, 'meta.json')))
      .map(dir => {
        const metaPath = path.join(projectsDir, dir, 'meta.json');
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        return {
          id: dir,
          name: meta.name,
          status: meta.status,
          created_date: meta.created_date,
        };
      });

    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET PROJECT DETAILS
// ============================================

app.get('/api/projects/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(__dirname, 'projects', projectId, 'meta.json');

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectMeta = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
    res.json(projectMeta);
  } catch (error) {
    console.error('Get project error:', error);
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

  const basePath = path.join(__dirname, 'projects', projectId);

  // Load each doc type
  const docPaths = {
    marketData: '01-market-research/market-analysis.md',
    productBrief: '02-product-brief/brief.md',
    positioning: '03-brand/positioning-statement.md',
    metrics: '04-metrics/success-metrics.json',
  };

  for (const [key, docPath] of Object.entries(docPaths)) {
    const fullPath = path.join(basePath, docPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      context[key] = key === 'metrics' ? JSON.parse(content) : content;
    }
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
      content: userMessage || 'Please provide context about this product.',
    },
  ];

  // Add full context as context injection
  let contextString = '\n\n=== PROJECT CONTEXT ===\n';
  if (context.marketData) contextString += `\nMarket Data:\n${context.marketData.substring(0, 2000)}...`;
  if (context.productBrief) contextString += `\n\nProduct Brief:\n${context.productBrief.substring(0, 2000)}...`;
  if (context.positioning) contextString += `\n\nPositioning:\n${context.positioning.substring(0, 1000)}...`;
  if (context.metrics) contextString += `\n\nMetrics:\n${JSON.stringify(context.metrics, null, 2).substring(0, 1000)}...`;

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
  const needsValidation = content.text.includes('[✅') || content.text.includes('[🔄') || content.text.includes('[❌');

  return {
    message: content.text,
    validationRequired: needsValidation,
    options: needsValidation ? ['PROCEED', 'ITERATE', 'REJECT'] : [],
    dataSources: getDataSources(context),
  };
}

async function saveChatMessage(projectId, role, message) {
  const projectDir = path.join(__dirname, 'projects', projectId);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const chatPath = path.join(projectDir, 'chat.json');

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

async function handleValidation(projectId, projectMeta, validationResponse) {
  // Just log the validation
  console.log(`[${projectId}] Validation: ${JSON.stringify(validationResponse)}`);
}

function determineNextAction(projectMeta, decision) {
  const currentPhase = projectMeta.status;

  // Map decisions to next phases
  const phaseTransitions = {
    phase_1_validation: {
      PROCEED: {
        nextPhase: 'phase_2_architecture',
        action: 'trigger_phase_2_architecture_kickoff',
        tasks: ['fullstack_architecture', 'platform_engineer_infrastructure'],
      },
      PIVOT: {
        nextPhase: 'phase_1_validation',
        action: 'revalidate_with_new_positioning',
        tasks: ['market_research_revalidate'],
      },
      REJECT: {
        nextPhase: 'killed',
        action: 'kill_product',
        tasks: [],
      },
    },
    phase_2_architecture: {
      PROCEED: {
        nextPhase: 'phase_3_development',
        action: 'trigger_development_sprint',
        tasks: ['fullstack_development', 'platform_engineer_deployment', 'qa_setup'],
      },
      ITERATE: {
        nextPhase: 'phase_2_architecture',
        action: 'continue_architecture_refinement',
        tasks: ['architecture_refinement'],
      },
      REJECT: {
        nextPhase: 'phase_1_validation',
        action: 'pivot_back_to_validation',
        tasks: [],
      },
    },
    phase_3_development: {
      PROCEED: {
        nextPhase: 'phase_4_launch',
        action: 'trigger_launch_preparation',
        tasks: ['launch_coordinator', 'data_analyst_monitoring_setup'],
      },
      ITERATE: {
        nextPhase: 'phase_3_development',
        action: 'continue_development',
        tasks: ['continue_build'],
      },
      REJECT: {
        nextPhase: 'killed',
        action: 'kill_product',
        tasks: [],
      },
    },
    phase_4_launch: {
      PROCEED: {
        nextPhase: 'phase_5_post_launch',
        action: 'activate_all_systems',
        tasks: ['activate_features', 'enable_monitoring', 'start_emails', 'launch_social'],
      },
      HOLD: {
        nextPhase: 'phase_4_launch',
        action: 'delay_launch',
        tasks: [],
      },
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
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// ============================================
// SERVER
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Atlas Product Orchestration Server`);
  console.log(`   Listening on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Chat API: POST /api/projects/:projectId/chat`);
  console.log(`   Validate: POST /api/projects/:projectId/chat/validate`);
  console.log(`   Projects: GET /api/projects`);
  console.log(`\nDocs: See core/CLAUDE-INTEGRATION-SETUP.md`);
  console.log(`\nReady for production! 🎉\n`);
});

module.exports = app;
