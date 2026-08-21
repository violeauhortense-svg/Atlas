export async function GET() {
  try {
    const skills = [
      { name: 'market-research', description: 'Market Research' },
      { name: 'product-design', description: 'Product Design' },
      { name: 'development', description: 'Development' },
      { name: 'launch', description: 'Launch' },
      { name: 'growth', description: 'Growth' },
    ];

    return Response.json({ skills });
  } catch (error) {
    console.error('Skills error:', error);
    return Response.json({ skills: [], error: 'Failed to load skills' }, { status: 500 });
  }
}
