import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// GET - récupérer une action
export async function GET(
  req: Request,
  { params }: { params: { id: string; actionId: string } }
) {
  try {
    const { data, error } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('id', params.actionId)
      .eq('project_id', params.id)
      .single();

    if (error || !data) {
      return Response.json({ error: 'Action not found' }, { status: 404 });
    }

    return Response.json(data);
  } catch (err) {
    console.error('Error fetching action:', err);
    return Response.json({ error: 'Failed to fetch action' }, { status: 500 });
  }
}

// PATCH - approuver/rejeter une action
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; actionId: string } }
) {
  try {
    const { status, userFeedback } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return Response.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('agent_actions')
      .update({
        status,
        user_feedback: userFeedback || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.actionId)
      .eq('project_id', params.id)
      .select()
      .single();

    if (error || !data) {
      return Response.json({ error: 'Action not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      action: data,
      message: status === 'approved' ? '✅ Action approuvée' : '❌ Action rejetée',
    });
  } catch (err) {
    console.error('Error updating action:', err);
    return Response.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}
