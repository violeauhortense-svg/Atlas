import { NextRequest, NextResponse } from "next/server";

// Simple in-memory store for decisions (temporary)
// In production, this would be in Supabase
const decisionsStore = new Map<string, any[]>();

interface ReBriefRequest {
  agentName: string;
  action: string;
  context: {
    userDecision: string;
    messageId?: string;
    timestamp?: string;
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ReBriefRequest = await req.json();
    const { agentName, action, context } = body;

    if (!agentName || !action) {
      return NextResponse.json(
        { error: "agentName and action are required" },
        { status: 400 }
      );
    }

    // Create decision object
    const decision = {
      id: `decision-${Date.now()}`,
      project_id: params.id,
      agent_name: agentName,
      decision_type: "claude_feedback",
      action: action,
      status: "approved",
      context: context,
      created_at: new Date().toISOString(),
    };

    // Store in memory (and optionally Supabase)
    if (!decisionsStore.has(params.id)) {
      decisionsStore.set(params.id, []);
    }
    decisionsStore.get(params.id)?.push(decision);

    // Try to save to Supabase (non-blocking)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/decisions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(decision),
        }).catch((err) => {
          console.warn("Supabase save failed (non-blocking):", err);
        });
      }
    } catch (err) {
      console.warn("Supabase attempt failed:", err);
    }

    console.log("✅ Decision stored:", {
      id: decision.id,
      action,
      agentName,
      timestamp: decision.created_at,
    });

    return NextResponse.json({
      success: true,
      message: `✅ Décision enregistrée: ${action}`,
      taskId: decision.id,
      decision,
    });
  } catch (error) {
    console.error("❌ Re-brief error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create decision", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get from memory first
    const memoryDecisions = decisionsStore.get(params.id) || [];

    // Also try Supabase
    let supabaseDecisions: any[] = [];
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/decisions?project_id=eq.${params.id}`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        if (response.ok) {
          supabaseDecisions = await response.json();
        }
      }
    } catch (err) {
      console.warn("Supabase fetch failed:", err);
    }

    // Combine and deduplicate
    const allDecisions = [
      ...memoryDecisions,
      ...supabaseDecisions.filter(
        (s) => !memoryDecisions.find((m) => m.id === s.id)
      ),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    console.log(`✅ Fetched ${allDecisions.length} decisions for project ${params.id}`);

    return NextResponse.json({
      decisions: allDecisions,
      count: allDecisions.length,
      source: memoryDecisions.length > 0 ? "memory+supabase" : "supabase",
    });
  } catch (error) {
    console.error("❌ Error fetching decisions:", error);
    return NextResponse.json(
      { decisions: [], count: 0, error: String(error) },
      { status: 500 }
    );
  }
}
