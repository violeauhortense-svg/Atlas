export async function GET() {
  try {
    return Response.json({
      memory: {
        configured: true,
        status: 'ready',
      }
    });
  } catch (error) {
    console.error('Memory error:', error);
    return Response.json({
      memory: { configured: false },
    }, { status: 500 });
  }
}
