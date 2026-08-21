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
Your role: Help users build better products by providing strategic guidance, analyzing project data, and suggesting key decisions.

IMPORTANT DECISION FORMAT:
When you're suggesting a decision or action that should affect the product or agents, end your response with:

[DECISION_NEEDED]
Action: [Exact action or question]
Options: OPTION_A | OPTION_B | OPTION_C
[/DECISION_NEEDED]

EXAMPLES OF DECISIONS TO SUGGEST:
- "Should we test dual-tier pricing ($49 + $99)?" → User clicks OPTION
- "Should we pivot from B2C to B2B?" → User validates or modifies
- "Should we cut these 3 complex features for MVP?" → Decision with impact
- "Should we launch quietly vs Product Hunt?" → Strategic choice

GUIDELINES:
- Be conversational and data-backed in your analysis
- Only suggest decisions when they materially affect the product
- Provide clear options (2-3 max)
- Reference project data (market research, briefs, metrics)
- Use underscores for option names (NO_SPACES)

Start with friendly greeting, provide analysis, end with decision if applicable.`,
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
