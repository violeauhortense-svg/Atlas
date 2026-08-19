import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true });

    if (agentsError) throw agentsError;

    // Fetch all actions to determine dynamic status
    const { data: actions, error: actionsError } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('project_id', params.id);

    if (actionsError) throw actionsError;

    // Calculate dynamic status based on actions
    const approvedCount = (actions || []).filter((a) => a.status === 'approved').length;
    const rejectedCount = (actions || []).filter((a) => a.status === 'rejected').length;
    const totalCount = (actions || []).length;

    // Enhance agents with dynamic status
    const enhancedAgents = (agents || []).map((agent: any, idx: number) => {
      let dynamicStatus: 'idle' | 'active' | 'completed' | 'blocked' = 'idle';

      // CEO is active if orchestration was triggered (any agent exists)
      if (agent.name.includes('CEO')) {
        dynamicStatus = agents && agents.length > 1 ? 'active' : 'idle';
      }
      // Phase 1 agents are active if user started validating
      else if (approvedCount > 0) {
        dynamicStatus = 'active';
      }
      // Mark as blocked if rejected actions related to this agent
      else if (rejectedCount > 0) {
        dynamicStatus = 'blocked';
      }

      return {
        ...agent,
        statusDynamic: dynamicStatus,
        progress: {
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalCount,
        },
      };
    });

    return Response.json({
      agents: enhancedAgents,
      summary: {
        total: agents?.length || 0,
        active: enhancedAgents.filter((a) => a.statusDynamic === 'active').length,
        completed: enhancedAgents.filter((a) => a.statusDynamic === 'completed').length,
        blocked: enhancedAgents.filter((a) => a.statusDynamic === 'blocked').length,
        actions: {
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return Response.json({ agents: [], error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, role, status, tasks } = body;

    const { data, error } = await supabase
      .from('agents')
      .insert([
        {
          project_id: params.id,
          name,
          role,
          status: status || 'idle',
          tasks: tasks || []
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return Response.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
