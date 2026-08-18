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
      .from('agents')
      .select('*')
      .eq('project_id', params.id);

    if (error) throw error;

    return Response.json({ agents: data || [] });
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
