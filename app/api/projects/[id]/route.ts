import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!data) return Response.json({ error: 'Project not found' }, { status: 404 });

    return Response.json(data);
  } catch (error) {
    console.error('GET error:', error);
    return Response.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return Response.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
