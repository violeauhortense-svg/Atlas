"use client";

import { useEffect, useRef, useState } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  status?: "active" | "idle" | "completed" | "blocked";
  statusDynamic?: "active" | "idle" | "completed" | "blocked";
  tasks: string[];
  subAgents?: Agent[];
  progress?: {
    approved: number;
    rejected: number;
    total: number;
  };
}

interface AgentGraphProps {
  projectId: string;
  projectName: string;
  initialAgents?: Agent[];
}

export default function AgentGraph({ projectId, projectName, initialAgents = [] }: AgentGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  // Load agents from API
  useEffect(() => {
    loadAgents();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadAgents, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const loadAgents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/agents`);
      const data = await res.json();

      if (data.agents) {
        setAgents(data.agents);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Error loading agents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || agents.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(0, 217, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw agents
    const agentSize = 80;
    const spacing = 200;
    const startX = 50;
    const startY = 50;

    agents.forEach((agent, index) => {
      const x = startX + (index % 3) * spacing;
      const y = startY + Math.floor(index / 3) * spacing;

      // Use dynamic status if available
      const agentStatus = agent.statusDynamic || agent.status || "idle";

      // Draw agent node
      const statusColor =
        agentStatus === "active"
          ? "#00f5a0"
          : agentStatus === "completed"
            ? "#00d9ff"
            : agentStatus === "blocked"
              ? "#ff3860"
              : "#a0a8c4";

      ctx.fillStyle = statusColor + "30";
      ctx.fillRect(x - agentSize / 2, y - agentSize / 2, agentSize, agentSize);

      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - agentSize / 2, y - agentSize / 2, agentSize, agentSize);

      // Draw agent name
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 12px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(agent.name, x, y - 5);

      // Draw status indicator (pulsing if active)
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x + 30, y - 30, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw role
      ctx.fillStyle = "#a0a8c4";
      ctx.font = "400 10px Poppins";
      ctx.fillText(agent.role, x, y + 15);
    });
  }, [agents]);

  return (
    <div className="agent-graph-container">
      <div className="graph-header">
        <div>
          <h3>🤖 Graphe d'Agents - {projectName}</h3>
          {summary && (
            <div className="agent-summary">
              <span className="summary-stat">
                <span className="dot active"></span> {summary.active} Actifs
              </span>
              <span className="summary-stat">
                <span className="dot completed"></span> {summary.completed} Complétés
              </span>
              <span className="summary-stat">
                <span className="dot blocked"></span> {summary.blocked} Bloqués
              </span>
              <span className="summary-stat actions">
                ✅ {summary.actions.approved} approuvées
              </span>
            </div>
          )}
        </div>
        <div className="status-legend">
          <div className="legend-item">
            <span className="dot active"></span> Actif
          </div>
          <div className="legend-item">
            <span className="dot completed"></span> Complété
          </div>
          <div className="legend-item">
            <span className="dot blocked"></span> Bloqué
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des agents...</div>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          <p>Aucun agent n'a été déployé</p>
          <p style={{ fontSize: "0.9rem", marginTop: "8px", color: "var(--text-light)" }}>
            Validez des actions Claude et cliquez "Lancer CEO" pour déployer les agents
          </p>
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="agent-canvas"></canvas>
        </>
      )}

      <div className="agents-list">
        <h4>📋 Détails des Agents</h4>
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`agent-card ${selectedAgent?.id === agent.id ? "selected" : ""}`}
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="agent-header">
              <span className={`status-dot ${agent.status}`}></span>
              <span className="agent-name">{agent.name}</span>
              <span className="agent-role">{agent.role}</span>
            </div>
            {selectedAgent?.id === agent.id && (
              <div className="agent-details">
                <div className="tasks">
                  <h5>Tâches :</h5>
                  <ul>
                    {agent.tasks.map((task, idx) => (
                      <li key={idx}>✓ {task}</li>
                    ))}
                  </ul>
                </div>
                {agent.subAgents && agent.subAgents.length > 0 && (
                  <div className="sub-agents">
                    <h5>Sous-agents :</h5>
                    {agent.subAgents.map((sub) => (
                      <div key={sub.id} className="sub-agent-item">
                        {sub.name} ({sub.role})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .agent-graph-container {
          background: var(--bg-alt);
          border: 2px solid var(--border-accent);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }

        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 20px;
        }

        .graph-header > div:first-child {
          flex: 1;
        }

        .graph-header h3 {
          margin: 0 0 12px 0;
          font-size: 1.3rem;
        }

        .agent-summary {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
          flex-wrap: wrap;
        }

        .summary-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg);
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .summary-stat.actions {
          background: linear-gradient(135deg, rgba(0, 245, 160, 0.1), rgba(0, 217, 255, 0.1));
          border-color: var(--primary);
          color: var(--success);
          font-weight: 600;
        }

        .status-legend {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot.active {
          background: #00f5a0;
          box-shadow: 0 0 10px #00f5a0;
        }

        .dot.completed {
          background: #00d9ff;
          box-shadow: 0 0 10px #00d9ff;
        }

        .dot.blocked {
          background: #ff3860;
          box-shadow: 0 0 10px #ff3860;
        }

        .agent-canvas {
          width: 100%;
          height: 300px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 20px;
          background: var(--bg);
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text-light);
          font-size: 1rem;
        }

        .empty-state {
          color: var(--text-light);
        }

        .loading-state {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .agents-list {
          margin-top: 20px;
        }

        .agents-list h4 {
          margin: 0 0 12px 0;
          font-size: 1rem;
        }

        .agent-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .agent-card:hover {
          border-color: var(--primary);
          background: var(--bg-elevated);
        }

        .agent-card.selected {
          border-color: var(--primary);
          background: var(--bg-elevated);
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
        }

        .agent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-dot.active {
          background: #00f5a0;
          box-shadow: 0 0 8px #00f5a0;
        }

        .status-dot.completed {
          background: #00d9ff;
          box-shadow: 0 0 8px #00d9ff;
        }

        .status-dot.blocked {
          background: #ff3860;
          box-shadow: 0 0 8px #ff3860;
        }

        .status-dot.idle {
          background: #a0a8c4;
        }

        .agent-name {
          color: var(--text);
        }

        .agent-role {
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 400;
          margin-left: auto;
        }

        .agent-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          animation: slideDown 0.3s ease-out;
        }

        .tasks h5,
        .sub-agents h5 {
          margin: 8px 0 6px 0;
          font-size: 0.9rem;
          color: var(--primary);
        }

        .tasks ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tasks li {
          font-size: 0.85rem;
          color: var(--text-light);
          margin: 4px 0;
        }

        .sub-agent-item {
          font-size: 0.85rem;
          color: var(--text-light);
          padding: 4px 0;
          padding-left: 16px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
      `}</style>
    </div>
  );
}
