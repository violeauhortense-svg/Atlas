import { Anthropic } from '@anthropic-ai/sdk';
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
      .from('chat_messages')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return Response.json({ messages: data || [] });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return Response.json({ messages: [] });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const client = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    });

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4000,
      system: `You are Claude, embedded in Atlas Product Orchestration System.
Your role: Help users build better products by providing strategic guidance and ALWAYS suggesting clear decisions.

⚠️ CRITICAL: You MUST end EVERY response with a decision block.

DECISION FORMAT (REQUIRED):
ALWAYS end your response with this exact format:

[DECISION_NEEDED]
Action: [Clear yes/no question or decision to make]
Options: OPTION_A | OPTION_B | OPTION_C
[/DECISION_NEEDED]

EXAMPLES (copy this style):
"Should we test $99 pricing?"
[DECISION_NEEDED]
Action: Test dual-tier pricing ($49 + $99)?
Options: YES_TEST_DUAL | STAY_49_ONLY | RESEARCH_MORE
[/DECISION_NEEDED]

"What about pivoting?"
[DECISION_NEEDED]
Action: Pivot from B2C to B2B focus?
Options: PIVOT_B2B | STAY_B2C | TEST_BOTH
[/DECISION_NEEDED]

"Complex features in MVP?"
[DECISION_NEEDED]
Action: Cut complex features for faster MVP?
Options: CUT_FOR_SPEED | KEEP_ALL_FEATURES | CUT_SPECIFIC
[/DECISION_NEEDED]

RULES:
1. ALWAYS include [DECISION_NEEDED] block at the END
2. Action = clear, specific question (not vague)
3. Options = 2-3 concrete choices with underscores
4. Be conversational before the decision block
5. Provide brief analysis, then the decision
6. Reference data when available
7. Options must be actionable (not "maybe" or "think about it")

REMEMBER:
- Users are waiting for decision guidance
- Every response must end with [DECISION_NEEDED]...[/DECISION_NEEDED]
- This is NOT optional`,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Find text content in response (ignore thinking blocks)
    const textContent = response.content.find((c) => c.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      console.error('Invalid response content:', response.content);
      throw new Error(`No text content in response`);
    }

    const assistantMessage = textContent.text;

    // Save to Supabase for persistence
    try {
      await supabase
        .from('chat_messages')
        .insert([
          {
            project_id: params.id,
            role: 'user',
            message,
          },
          {
            project_id: params.id,
            role: 'assistant',
            message: assistantMessage,
          },
        ]);
    } catch (dbError) {
      console.error('DB save error:', dbError);
      // Continue even if DB fails - still return the message
    }

    return Response.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Full error:', errorMsg);
    return Response.json(
      {
        success: false,
        error: 'Failed to process chat message',
        details: errorMsg.substring(0, 200),
      },
      { status: 500 }
    );
  }
}
