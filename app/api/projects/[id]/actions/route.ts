import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ actions: data || [] });
  } catch (error) {
    console.error('Error fetching actions:', error);
    return Response.json({ actions: [], error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { agent_id, title, description, priority, details } = body;

    const { data, error } = await supabase
      .from('agent_actions')
      .insert([
        {
          project_id: params.id,
          agent_id,
          title,
          description,
          priority: priority || 'medium',
          status: 'pending',
          details: details || {}
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating action:', error);
    return Response.json({ error: 'Failed to create action' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { actionId, status } = body;

    const { data, error } = await supabase
      .from('agent_actions')
      .update({ status })
      .eq('id', actionId)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error updating action:', error);
    return Response.json({ error: 'Failed to update action' }, { status: 500 });
  }
}
