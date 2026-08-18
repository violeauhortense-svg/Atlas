"use client";

import { useState } from "react";

interface Action {
  id: string;
  agent: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: string;
  details?: Record<string, any>;
}

interface ValidationPanelProps {
  projectId: string;
  actions?: Action[];
}

export default function ValidationPanel({
  projectId,
  actions = [],
}: ValidationPanelProps) {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [validating, setValidating] = useState<string | null>(null);

  const handleApprove = async (actionId: string) => {
    setValidating(actionId);
    try {
      // TODO: Call API to approve action
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Action approuvée ✅");
    } finally {
      setValidating(null);
    }
  };

  const handleReject = async (actionId: string) => {
    setValidating(actionId);
    try {
      // TODO: Call API to reject action
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Action rejetée ❌");
    } finally {
      setValidating(null);
    }
  };

  const pendingCount = actions.filter((a) => a.status === "pending").length;
  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "var(--danger)";
      case "medium":
        return "var(--warning)";
      default:
        return "var(--text-light)";
    }
  };

  return (
    <div className="validation-panel">
      <div className="panel-header">
        <h3>📋 Actions à Valider</h3>
        {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
      </div>

      {actions.length === 0 ? (
        <div className="empty-state">
          <p>✅ Aucune action en attente</p>
        </div>
      ) : (
        <div className="actions-grid">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`action-card ${action.status} ${selectedAction?.id === action.id ? "selected" : ""}`}
              onClick={() => setSelectedAction(action)}
            >
              <div className="action-header">
                <div className="action-title">
                  <span className="agent-label">{action.agent}</span>
                  <h4>{action.title}</h4>
                </div>
                <span
                  className="priority-badge"
                  style={{ background: priorityColor(action.priority) }}
                >
                  {action.priority.toUpperCase()}
                </span>
              </div>

              <p className="action-description">{action.description}</p>

              <div className="action-meta">
                <span className="timestamp">{action.createdAt}</span>
                <span
                  className={`status-badge ${action.status}`}
                >
                  {action.status === "pending"
                    ? "⏳ En attente"
                    : action.status === "approved"
                      ? "✅ Approuvée"
                      : "❌ Rejetée"}
                </span>
              </div>

              {selectedAction?.id === action.id && action.status === "pending" && (
                <div className="action-buttons">
                  <button
                    className="btn-approve"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(action.id);
                    }}
                    disabled={validating === action.id}
                  >
                    {validating === action.id ? "..." : "✅ Approuver"}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(action.id);
                    }}
                    disabled={validating === action.id}
                  >
                    {validating === action.id ? "..." : "❌ Rejeter"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .validation-panel {
          background: var(--bg-alt);
          border: 2px solid var(--border-accent);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.3rem;
        }

        .badge-count {
          background: linear-gradient(135deg, var(--danger), var(--warning));
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 0 15px rgba(255, 56, 96, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--success);
          font-size: 1.1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .action-card {
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--text-light);
        }

        .action-card.pending::before {
          background: var(--warning);
        }

        .action-card.approved::before {
          background: var(--success);
        }

        .action-card.rejected::before {
          background: var(--danger);
        }

        .action-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 217, 255, 0.1);
        }

        .action-card.selected {
          border-color: var(--primary);
          background: var(--bg-elevated);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .action-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .agent-label {
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-title h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text);
        }

        .priority-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .action-description {
          font-size: 0.9rem;
          color: var(--text-light);
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .action-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-lighter);
          margin-bottom: 12px;
        }

        .timestamp {
          opacity: 0.7;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .status-badge.pending {
          background: rgba(255, 165, 0, 0.2);
          color: var(--warning);
        }

        .status-badge.approved {
          background: rgba(0, 245, 160, 0.2);
          color: var(--success);
        }

        .status-badge.rejected {
          background: rgba(255, 56, 96, 0.2);
          color: var(--danger);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          animation: slideUp 0.3s ease-out;
        }

        .btn-approve,
        .btn-reject {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .btn-approve {
          background: rgba(0, 245, 160, 0.2);
          color: var(--success);
          border: 1px solid var(--success);
        }

        .btn-approve:hover:not(:disabled) {
          background: var(--success);
          color: var(--bg);
          box-shadow: 0 0 15px rgba(0, 245, 160, 0.4);
        }

        .btn-reject {
          background: rgba(255, 56, 96, 0.2);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .btn-reject:hover:not(:disabled) {
          background: var(--danger);
          color: var(--bg);
          box-shadow: 0 0 15px rgba(255, 56, 96, 0.4);
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
