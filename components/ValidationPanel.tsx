"use client";

import { useState, useEffect } from "react";

interface Action {
  id: string;
  agent?: string;
  title: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  created_at?: string;
  user_feedback?: string;
  details?: Record<string, any>;
  action_type?: string;
}

interface ValidationPanelProps {
  projectId: string;
  actions?: Action[];
  onActionValidated?: (actionId: string, status: string) => void;
}

export default function ValidationPanel({
  projectId,
  actions: initialActions = [],
  onActionValidated,
}: ValidationPanelProps) {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [validating, setValidating] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState("");
  const [loadingActions, setLoadingActions] = useState(false);

  useEffect(() => {
    loadActions();
  }, [projectId]);

  const loadActions = async () => {
    setLoadingActions(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/actions`);
      const data = await res.json();
      if (data.actions) {
        setActions(data.actions);
      }
    } catch (err) {
      console.error("Error loading actions:", err);
    } finally {
      setLoadingActions(false);
    }
  };

  const handleApprove = async (actionId: string) => {
    setValidating(actionId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(
        `${apiUrl}/api/projects/${projectId}/actions/${actionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            userFeedback: userFeedback || "Approuvée par l'utilisateur",
          }),
        }
      );

      const data = await res.json();
      if (data.success || data.action) {
        setActions((prev) =>
          prev.map((a) =>
            a.id === actionId
              ? { ...a, status: "approved", user_feedback: userFeedback }
              : a
          )
        );
        setUserFeedback("");
        if (onActionValidated) {
          onActionValidated(actionId, "approved");
        }
      }
    } catch (err) {
      console.error("Error approving action:", err);
      alert("❌ Erreur lors de l'approbation");
    } finally {
      setValidating(null);
    }
  };

  const handleReject = async (actionId: string) => {
    setValidating(actionId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(
        `${apiUrl}/api/projects/${projectId}/actions/${actionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rejected",
            userFeedback: userFeedback || "Rejetée par l'utilisateur",
          }),
        }
      );

      const data = await res.json();
      if (data.success || data.action) {
        setActions((prev) =>
          prev.map((a) =>
            a.id === actionId
              ? { ...a, status: "rejected", user_feedback: userFeedback }
              : a
          )
        );
        setUserFeedback("");
        if (onActionValidated) {
          onActionValidated(actionId, "rejected");
        }
      }
    } catch (err) {
      console.error("Error rejecting action:", err);
      alert("❌ Erreur lors du rejet");
    } finally {
      setValidating(null);
    }
  };

  const pendingCount = actions.filter((a) => a.status === "pending").length;
  const approvedCount = actions.filter((a) => a.status === "approved").length;

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Récemment";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  return (
    <div className="validation-panel">
      <div className="panel-header">
        <h3>📋 Actions à Valider</h3>
        <div className="stats">
          {pendingCount > 0 && <span className="badge-pending">{pendingCount} En attente</span>}
          {approvedCount > 0 && <span className="badge-approved">{approvedCount} Approuvées</span>}
        </div>
      </div>

      {loadingActions ? (
        <div className="loading-state">
          <p>Chargement des actions...</p>
        </div>
      ) : actions.length === 0 ? (
        <div className="empty-state">
          <p>✅ Aucune action en attente</p>
          <p style={{ fontSize: "0.9rem", marginTop: "8px", color: "var(--text-light)" }}>
            Les propositions de Claude apparaîtront ici
          </p>
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
                  {action.agent && <span className="agent-label">{action.agent}</span>}
                  {action.action_type === "claude_suggestion" && (
                    <span className="agent-label">🤖 CLAUDE</span>
                  )}
                  <h4>{action.title}</h4>
                </div>
                <span
                  className="priority-badge"
                  style={{ background: priorityColor(action.priority) }}
                >
                  {action.priority.toUpperCase()}
                </span>
              </div>

              {action.description && (
                <p className="action-description">{action.description}</p>
              )}

              <div className="action-meta">
                <span className="timestamp">{formatDate(action.created_at)}</span>
                <span className={`status-badge ${action.status}`}>
                  {action.status === "pending"
                    ? "⏳ En attente"
                    : action.status === "approved"
                      ? "✅ Approuvée"
                      : "❌ Rejetée"}
                </span>
              </div>

              {selectedAction?.id === action.id && (
                <div className="action-details">
                  {action.user_feedback && (
                    <div className="feedback-section">
                      <h5>💬 Votre feedback</h5>
                      <p>{action.user_feedback}</p>
                    </div>
                  )}

                  {action.status === "pending" && (
                    <div className="action-input">
                      <textarea
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        placeholder="Ajoutez un commentaire (optionnel)..."
                        rows={2}
                      />
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
                    </div>
                  )}
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

        .stats {
          display: flex;
          gap: 12px;
        }

        .badge-pending,
        .badge-approved {
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 0 10px;
        }

        .badge-pending {
          background: linear-gradient(135deg, var(--warning), #ff6b35);
          box-shadow: 0 0 10px rgba(255, 165, 0, 0.3);
        }

        .badge-approved {
          background: linear-gradient(135deg, var(--success), #00ff88);
          box-shadow: 0 0 10px rgba(0, 245, 160, 0.3);
        }

        .empty-state,
        .loading-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-light);
          font-size: 1.1rem;
        }

        .empty-state {
          color: var(--success);
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

        .action-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          animation: slideDown 0.3s ease-out;
        }

        .feedback-section {
          background: var(--bg-elevated);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          border-left: 3px solid var(--primary);
        }

        .feedback-section h5 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: var(--primary);
        }

        .feedback-section p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text);
          font-style: italic;
        }

        .action-input {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideUp 0.3s ease-out;
        }

        .action-input textarea {
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.3s ease;
        }

        .action-input textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
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
