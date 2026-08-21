import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

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

    // Log decision to Supabase
    const { data: decision, error: dbError } = await supabase
      .from("decisions")
      .insert([
        {
          project_id: params.id,
          agent_name: agentName,
          decision_type: "claude_feedback",
          action: action,
          status: "approved",
          context: context,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to log decision" },
        { status: 500 }
      );
    }

    // TODO: Send re-brief to agent via Paperclip orchestration
    // For now, log it and return success
    console.log("Re-brief created:", {
      project_id: params.id,
      agent: agentName,
      action,
      decision_id: decision?.id,
      timestamp: new Date().toISOString(),
    });

    // Generate re-brief message for CEO
    const reBriefMessage = generateReBriefMessage(agentName, action, context);

    return NextResponse.json({
      success: true,
      message: `Agent ${agentName} re-briefé avec: ${action}`,
      taskId: `task-${decision?.id || Date.now()}`,
      reBriefMessage,
      decisionId: decision?.id,
    });
  } catch (error) {
    console.error("Re-brief error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create re-brief", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("project_id", params.id)
      .eq("decision_type", "claude_feedback")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      decisions: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching decisions:", error);
    return NextResponse.json({ decisions: [], count: 0 });
  }
}

// Helper: Generate re-brief message for CEO agent
function generateReBriefMessage(
  agentName: string,
  action: string,
  context: any
): string {
  const agentMessages: { [key: string]: string } = {
    "product-manager": `Re-brief: Product Manager needs to re-analyze product scope based on user feedback: "${action}". Update product-brief.md and pricing-model.json accordingly.`,
    "market-research": `Re-brief: Market Research should expand analysis based on: "${action}". Update market-analysis.md with new findings.`,
    brand: `Re-brief: Brand should reconsider positioning based on: "${action}". Update brand-guidelines.md accordingly.`,
    "content-agent": `Re-brief: Content needs to adapt messaging based on: "${action}". Update landing-page-copy.md and email sequences.`,
    "social-media": `Re-brief: Social Media strategy needs to pivot: "${action}". Update content-calendar.json accordingly.`,
    fullstack: `Re-brief: Fullstack Developer should adjust implementation based on: "${action}". Update architecture and component design.`,
  };

  return (
    agentMessages[agentName] ||
    `Re-brief ${agentName}: ${action}`
  );
}
