export async function GET() {
  return Response.json({
    projects: [],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const projectId = `atlas-${Date.now()}`;
    const newProject = {
      id: projectId,
      name: body.name,
      status: "phase_1_validation",
      created_date: new Date().toISOString(),
    };

    return Response.json(newProject, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create project" },
      { status: 400 }
    );
  }
}
