"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Decision {
  key: string;
  question: string;
  answer: string;
  timestamp: string;
}

interface TreeNode {
  id: string;
  question: string;
  description?: string;
  type: "choice" | "text" | "number";
  options?: { label: string; value: string }[];
  next?: (answer: string) => string | null;
  required?: boolean;
}

const DECISION_TREE: Record<string, TreeNode> = {
  pricing: {
    id: "pricing",
    question: "Quel modèle de tarification?",
    description: "Choisir la stratégie tarifaire pour le lancement",
    type: "choice",
    options: [
      { label: "🆓 Gratuit (freemium)", value: "FREE" },
      { label: "💰 Forfait unique ($49/mois)", value: "SINGLE_49" },
      { label: "📊 Forfaits multiples ($49 + $99)", value: "MULTI_TIER" },
      { label: "🎯 Paiement à l'usage", value: "PAY_PER_USE" },
    ],
    next: (answer) => "mvp_scope",
  },

  mvp_scope: {
    id: "mvp_scope",
    question: "Scope du MVP - Quelles features prioritaires?",
    description: "Limiter le scope pour lancer vite",
    type: "choice",
    options: [
      { label: "⚡ Minimal (1-3 features core)", value: "MINIMAL" },
      { label: "📦 Standard (5-7 features)", value: "STANDARD" },
      { label: "🎨 Complet (10+ features + UI polish)", value: "FULL" },
    ],
    next: (answer) => "launch_timeline",
  },

  launch_timeline: {
    id: "launch_timeline",
    question: "Timeline de lancement?",
    description: "Quand êtes-vous prêt à lancer?",
    type: "choice",
    options: [
      { label: "🔥 ASAP (7 jours)", value: "WEEK_1" },
      { label: "📅 2 semaines", value: "WEEK_2" },
      { label: "🎯 4 semaines", value: "WEEK_4" },
      { label: "🔧 Custom", value: "CUSTOM" },
    ],
    next: (answer) => (answer === "CUSTOM" ? "launch_custom_date" : "marketing_channel"),
  },

  launch_custom_date: {
    id: "launch_custom_date",
    question: "Date de lancement cible?",
    type: "text",
    next: () => "marketing_channel",
  },

  marketing_channel: {
    id: "marketing_channel",
    question: "Canal de lancement principal?",
    type: "choice",
    options: [
      { label: "🐦 Twitter/X", value: "TWITTER" },
      { label: "📧 Email list", value: "EMAIL" },
      { label: "👥 LinkedIn", value: "LINKEDIN" },
      { label: "🤝 Direct B2B", value: "B2B" },
      { label: "🌐 Launch page (Product Hunt style)", value: "LAUNCH_PAGE" },
    ],
    next: () => "target_revenue",
  },

  target_revenue: {
    id: "target_revenue",
    question: "Objectif revenue (premier mois)?",
    description: "€ ou $ ou nombre de clients",
    type: "text",
    next: () => "ready_to_launch",
  },

  ready_to_launch: {
    id: "ready_to_launch",
    question: "Êtes-vous prêt à lancer le CEO Orchestrator?",
    description: "Cela lancera la machine: Phase 1 (Validation) → Phase 2 (Architecture) → Phase 3 (Dev) → Phase 4 (Launch) → Phase 5 (Growth)",
    type: "choice",
    options: [
      { label: "✅ OUI - Lancez le CEO!", value: "YES_LAUNCH" },
      { label: "⏸️ Pas encore - Revoir les décisions", value: "NO_REVIEW" },
    ],
    next: null,
  },
};

export default function DecisionTree({
  projectId,
  onComplete,
}: {
  projectId: string;
  onComplete?: (decisions: Decision[]) => void;
}) {
  const [currentNodeId, setCurrentNodeId] = useState<string>("pricing");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  const currentNode = DECISION_TREE[currentNodeId];

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [currentNodeId]: value };
    setAnswers(newAnswers);

    const newDecision: Decision = {
      key: currentNodeId,
      question: currentNode.question,
      answer: value,
      timestamp: new Date().toISOString(),
    };

    const newDecisions = [...decisions, newDecision];
    setDecisions(newDecisions);

    // Save to database
    try {
      await fetch(`/api/projects/${projectId}/agent-rebrief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: "DecisionTree",
          action: `${currentNodeId}: ${value}`,
          context: {
            question: currentNode.question,
            answer: value,
            allDecisions: newDecisions,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to save decision:", err);
    }

    // Get next node
    if (currentNode.next) {
      const nextNodeId = currentNode.next(value);
      if (nextNodeId) {
        setCurrentNodeId(nextNodeId);
        setTextAnswer("");
      } else {
        // End of tree
        handleCompletion(newDecisions);
      }
    } else {
      handleCompletion(newDecisions);
    }
  };

  const handleTextSubmit = (value: string) => {
    if (value.trim()) {
      handleAnswer(value);
    }
  };

  const handleCompletion = async (finalDecisions: Decision[]) => {
    setCompleted(true);
    if (onComplete) {
      onComplete(finalDecisions);
    }
  };

  const handleLaunchCEO = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisions: answers,
          phase: "VALIDATION",
        }),
      });

      if (res.ok) {
        // Success - the CEO is launched
        window.location.reload();
      } else {
        alert("Erreur: impossible de lancer le CEO");
      }
    } catch (err) {
      console.error("Launch error:", err);
      alert("Erreur: vérifiez la console");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentNode) {
    return <div className="decision-error">Erreur: nœud non trouvé</div>;
  }

  if (completed) {
    return (
      <div className="decision-complete">
        <div className="decision-header">
          <h2>🎉 Toutes les décisions enregistrées!</h2>
        </div>

        <div className="decision-summary">
          {decisions.map((d, idx) => (
            <div key={idx} className="decision-item">
              <strong>{d.question}</strong>
              <div className="decision-answer">{d.answer}</div>
            </div>
          ))}
        </div>

        <div className="decision-actions">
          <button
            className="primary-button"
            onClick={handleLaunchCEO}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Lancement en cours..." : "🚀 Lancer le CEO Orchestrator"}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setCompleted(false);
              setCurrentNodeId("pricing");
              setAnswers({});
              setDecisions([]);
            }}
          >
            ⏮️ Revoir les décisions
          </button>
        </div>

        <style jsx>{`
          .decision-complete {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            color: white;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          .decision-header h2 {
            margin: 0 0 20px 0;
            font-size: 1.8rem;
          }

          .decision-summary {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
          }

          .decision-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }

          .decision-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }

          .decision-item strong {
            display: block;
            font-size: 0.95rem;
            opacity: 0.9;
            margin-bottom: 5px;
          }

          .decision-answer {
            font-weight: 600;
            font-size: 1.1rem;
            color: #fff;
          }

          .decision-actions {
            display: flex;
            gap: 10px;
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .primary-button {
            background: #fff;
            color: #667eea;
          }

          .primary-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .primary-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .secondary-button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          .secondary-button:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="decision-tree">
      <div className="decision-container">
        <div className="progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((decisions.length + 1) / 7) * 100}%`,
              }}
            />
          </div>
          <span className="progress-text">
            Étape {decisions.length + 1} / 7
          </span>
        </div>

        <div className="question-section">
          <h2>{currentNode.question}</h2>
          {currentNode.description && (
            <p className="description">{currentNode.description}</p>
          )}
        </div>

        <div className="answer-section">
          {currentNode.type === "choice" && currentNode.options && (
            <div className="options">
              {currentNode.options.map((opt) => (
                <button
                  key={opt.value}
                  className="option-button"
                  onClick={() => handleAnswer(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {currentNode.type === "text" && (
            <div className="text-input-group">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleTextSubmit(textAnswer);
                  }
                }}
                placeholder="Entrez votre réponse..."
                autoFocus
              />
              <button
                className="submit-button"
                onClick={() => handleTextSubmit(textAnswer)}
                disabled={!textAnswer.trim()}
              >
                ➜ Suivant
              </button>
            </div>
          )}

          {currentNode.type === "number" && (
            <div className="text-input-group">
              <input
                type="number"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleTextSubmit(textAnswer);
                  }
                }}
                placeholder="Entrez un nombre..."
                autoFocus
              />
              <button
                className="submit-button"
                onClick={() => handleTextSubmit(textAnswer)}
                disabled={!textAnswer.trim()}
              >
                ➜ Suivant
              </button>
            </div>
          )}
        </div>

        <div className="decisions-preview">
          <details>
            <summary>📋 Décisions enregistrées ({decisions.length})</summary>
            <div className="preview-list">
              {decisions.map((d, idx) => (
                <div key={idx} className="preview-item">
                  <span className="preview-label">{d.key}:</span>
                  <span className="preview-value">{d.answer}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      <style jsx>{`
        .decision-tree {
          padding: 20px 0;
        }

        .decision-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          max-width: 600px;
          margin: 0 auto;
        }

        .progress {
          margin-bottom: 30px;
        }

        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.85rem;
          color: #666;
        }

        .question-section {
          margin-bottom: 30px;
        }

        .question-section h2 {
          margin: 0 0 10px 0;
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .description {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
        }

        .answer-section {
          margin-bottom: 30px;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-button {
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          text-align: left;
          transition: all 0.2s ease;
        }

        .option-button:hover {
          border-color: #667eea;
          background: #f8f9ff;
          transform: translateX(4px);
        }

        .option-button:active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .text-input-group {
          display: flex;
          gap: 10px;
        }

        .text-input-group input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .text-input-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .submit-button {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #764ba2;
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .decisions-preview {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .decisions-preview details {
          cursor: pointer;
        }

        .decisions-preview summary {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .preview-list {
          margin-top: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          padding: 12px;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.85rem;
        }

        .preview-label {
          color: #666;
          font-weight: 500;
        }

        .preview-value {
          color: #1a1a1a;
          font-weight: 600;
        }

        .decision-error {
          padding: 20px;
          background: #fee;
          border-radius: 8px;
          color: #c00;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
