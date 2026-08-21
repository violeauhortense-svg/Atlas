import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));

    // Fetch product
    const { data: product, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product status to VALIDATION (Phase 1)
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'VALIDATION',
        orchestrated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) throw updateError;

    // Log the orchestration start
    console.log(`✅ CEO Orchestrator started for project ${params.id}`);
    console.log(`📊 Product: ${product.name}`);
    console.log(`📅 Status: VALIDATION (Phase 1)`);
    console.log(`📍 Decisions received:`, body);

    return Response.json({
      success: true,
      message: '🚀 CEO Orchestrator has started!',
      phase: 'VALIDATION',
      product: product.name,
      decisions: body,
      nextSteps: [
        '📊 Phase 1: Market Validation (Days 1-5)',
        '🎨 Phase 2: Architecture & Design (Days 6-10)',
        '⚙️ Phase 3: Development (Days 11-20)',
        '🚀 Phase 4: Launch (Days 21-25)',
        '📈 Phase 5: Growth (Days 26-30)',
      ],
    });
  } catch (error) {
    console.error('Orchestration error:', error);
    return Response.json(
      {
        error: 'Failed to orchestrate',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
