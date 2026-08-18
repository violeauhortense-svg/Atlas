import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

const ORCHESTRATION_PROMPT = `You are Atlas CEO Agent - the master orchestrator of product launches.

Your role: Analyze the product and orchestrate a complete 30-day launch strategy by deploying specialized agents.

For each phase, you'll deploy agents:
- Phase 1 (Days 1-5): Market Validation
  * Deploy: Market Researcher, Competitive Analyst, Customer Interviewer
  * Task: Validate market demand, analyze competitors, conduct customer interviews

- Phase 2 (Days 6-10): Architecture & Design
  * Deploy: Product Architect, UX Designer, Tech Lead
  * Task: Design product, create wireframes, plan tech stack

- Phase 3 (Days 11-20): Development
  * Deploy: Backend Engineer, Frontend Engineer, DevOps Engineer, QA Engineer
  * Task: Build MVP, deploy infrastructure, run tests

- Phase 4 (Days 21-25): Launch
  * Deploy: Launch Manager, Marketing Lead, Community Manager
  * Task: Prepare launch campaign, engage community

- Phase 5 (Days 26-30): Growth
  * Deploy: Growth Hacker, Data Analyst, Product Manager
  * Task: Optimize acquisition, analyze metrics, iterate

Given the product below, create a detailed orchestration plan:
- Which agents to deploy in Phase 1
- Key milestones for each phase
- Success metrics
- Risk mitigation

Product Information:
{PRODUCT_INFO}

Respond in JSON format with the orchestration plan.`;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch product data
    const { data: product, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Initialize Claude
    const client = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    });

    // CEO Agent analyzes and creates orchestration plan
    const productInfo = `
Name: ${product.name}
Description: ${product.description}
Target Users: ${product.target_users}
Problem: ${product.problem}
    `.trim();

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: ORCHESTRATION_PROMPT.replace('{PRODUCT_INFO}', productInfo),
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const orchestrationPlan = content.text;

    // Parse the orchestration plan and create agents
    const agentNames = [
      'CEO Orchestrator',
      'Market Researcher',
      'Competitive Analyst',
      'Customer Interviewer',
      'Product Architect',
      'UX Designer',
      'Tech Lead',
      'Backend Engineer',
      'Frontend Engineer',
      'DevOps Engineer',
      'QA Engineer',
      'Launch Manager',
      'Marketing Lead',
    ];

    // Create CEO agent first
    const { data: ceoAgent, error: ceoError } = await supabase
      .from('agents')
      .insert([
        {
          project_id: params.id,
          name: 'CEO Orchestrator',
          role: 'Master Orchestrator - Coordinates all agents and phases',
          status: 'active',
          tasks: [
            'Analyze product requirements',
            'Create orchestration strategy',
            'Deploy specialized agents',
            'Monitor progress',
            'Make strategic decisions',
          ],
        },
      ])
      .select()
      .single();

    if (ceoError) throw ceoError;

    // Create Phase 1 agents
    const phase1Agents = [
      {
        project_id: params.id,
        name: 'Market Researcher',
        role: 'Validates market demand and opportunity size',
        status: 'active',
        tasks: ['Analyze market size', 'Identify TAM', 'Validate demand'],
      },
      {
        project_id: params.id,
        name: 'Competitive Analyst',
        role: 'Analyzes competitive landscape',
        status: 'active',
        tasks: ['Map competitors', 'Identify gaps', 'Analyze positioning'],
      },
      {
        project_id: params.id,
        name: 'Customer Interviewer',
        role: 'Conducts customer discovery interviews',
        status: 'active',
        tasks: [
          'Schedule interviews',
          'Conduct research',
          'Synthesize insights',
        ],
      },
    ];

    const { error: agentsError } = await supabase
      .from('agents')
      .insert(phase1Agents);

    if (agentsError) throw agentsError;

    // Create initial action items from the orchestration plan
    const { error: actionError } = await supabase
      .from('agent_actions')
      .insert([
        {
          project_id: params.id,
          agent_id: ceoAgent.id,
          title: 'Orchestration Plan Created',
          description: 'CEO has analyzed the product and created a 30-day launch orchestration plan',
          priority: 'high',
          status: 'approved',
          details: { plan: orchestrationPlan },
        },
        {
          project_id: params.id,
          agent_id: ceoAgent.id,
          title: 'Phase 1 Agents Deployed',
          description: 'Market Researcher, Competitive Analyst, and Customer Interviewer are now active',
          priority: 'high',
          status: 'approved',
          details: { agents: ['Market Researcher', 'Competitive Analyst', 'Customer Interviewer'] },
        },
      ]);

    if (actionError) throw actionError;

    return Response.json({
      success: true,
      ceoAgent,
      orchestrationPlan,
      message: 'CEO Agent has orchestrated the product launch strategy!',
    });
  } catch (error) {
    console.error('Orchestration error:', error);
    return Response.json(
      { error: 'Failed to orchestrate product launch' },
      { status: 500 }
    );
  }
}
