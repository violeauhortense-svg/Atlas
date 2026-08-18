import { Anthropic } from '@anthropic-ai/sdk';

export async function GET() {
  return Response.json({ messages: [] });
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
      max_tokens: 1500,
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

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const assistantMessage = content.text;

    // TODO: Save to Supabase once RLS is fixed
    // For now, just return the message

    return Response.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
