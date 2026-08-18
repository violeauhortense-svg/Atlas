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

    // Find text content in response
    const textContent = response.content.find((c) => c.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      console.error('Invalid response content:', response.content);
      throw new Error(`Invalid response: ${JSON.stringify(response.content)}`);
    }

    const assistantMessage = textContent.text;

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
