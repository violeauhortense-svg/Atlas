export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    system: "Atlas Product Orchestration + Claude Integration",
  });
}
