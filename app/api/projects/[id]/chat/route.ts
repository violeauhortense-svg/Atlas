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
      system: `You are Claude, embedded in Atlas Product Orchestration.
Your role: Help users build better products by providing strategic guidance based on project data.

Be conversational, precise, and data-backed.`,
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
