"use client";

import { useEffect, useRef, useState } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "completed" | "blocked";
  tasks: string[];
  subAgents?: Agent[];
}

interface AgentGraphProps {
  agents: Agent[];
  projectName: string;
}

export default function AgentGraph({ agents, projectName }: AgentGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

      // Draw agent node
      const statusColor =
        agent.status === "active"
          ? "#00f5a0"
          : agent.status === "completed"
            ? "#00d9ff"
            : agent.status === "blocked"
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

      // Draw status indicator
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
        <h3>🤖 Graphe d'Agents - {projectName}</h3>
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

      <canvas ref={canvasRef} className="agent-canvas"></canvas>

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
          align-items: center;
          margin-bottom: 20px;
        }

        .graph-header h3 {
          margin: 0;
          font-size: 1.3rem;
        }

        .status-legend {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
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
