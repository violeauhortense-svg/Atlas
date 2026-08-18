import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ projects: data || [] });
  } catch (error) {
    console.error('GET error:', error);
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, targetUsers, problem } = body;

    if (!name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          target_users: targetUsers,
          problem,
          status: 'validation',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
