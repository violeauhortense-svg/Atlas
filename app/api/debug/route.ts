export async function GET() {
  return Response.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ set" : "❌ missing",
    supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ set" : "❌ missing",
    claude_key: process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? "✅ set" : "❌ missing",
  });
}
