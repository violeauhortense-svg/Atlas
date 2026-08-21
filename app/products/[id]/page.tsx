"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getPhaseLabel, formatDate } from "@/lib/utils";
import AgentGraph from "@/components/AgentGraph";
import ValidationPanel from "@/components/ValidationPanel";
import ProjectRefinement from "@/components/ProjectRefinement";

interface Decision {
  action: string;
  options: string[];
}

interface Message {
  role: "user" | "assistant";
  message: string;
  timestamp?: string;
  hasDecision?: boolean;
  decision?: Decision;
  messageId?: string;
}

interface ProductData {
  id: string;
  name: string;
  status: string;
  created_at: string;
  description?: string;
  target_users?: string;
  problem?: string;
}

function extractDecision(message: string): Decision | null {
  // Match the decision block - handle both single line and multiline
  const match = message.match(/\[DECISION_NEEDED\](.*?)\[\/DECISION_NEEDED\]/is);
  if (!match) {
    console.log("❌ No decision block found");
    return null;
  }

  const content = match[1];
  console.log("🔍 Found decision block:", content.substring(0, 100));

  // Extract Action - more flexible regex
  const actionMatch = content.match(/Action:\s*([^\n\|]+?)(?:\s*\||$)/i);
  if (!actionMatch) {
    console.log("❌ No action found in:", content);
    return null;
  }

  // Extract Options - handle them being on same line or multiple lines
  // Options come after "Options:" and before "[/DECISION_NEEDED]"
  const optionsMatch = content.match(/Options:\s*(.+?)(?:\[\/DECISION_NEEDED\]|$)/is);
  if (!optionsMatch) {
    console.log("❌ No options found");
    return null;
  }

  const optionsText = optionsMatch[1].trim();
  const options = optionsText
    .split("|")
    .map((o) => o.trim())
    .filter((o) => o.length > 0 && !o.includes("["));

  console.log("✅ Extracted decision:", {
    action: actionMatch[1].trim(),
    optionsCount: options.length,
    options,
  });

  if (options.length === 0) {
    console.log("❌ No options extracted");
    return null;
  }

  return {
    action: actionMatch[1].trim(),
    options,
  };
}

function stripDecisionFromMessage(message: string): string {
  // Remove the decision block entirely
  const cleaned = message.replace(/\[DECISION_NEEDED\].*?\[\/DECISION_NEEDED\]/is, "").trim();
  console.log("📝 Cleaned message (removed decision block)");
  return cleaned;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [validatedActions, setValidatedActions] = useState<number>(0);
  const [decidingMessageId, setDecidingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchProduct();
    fetchMessages();
  }, [productId]);

  const fetchMessages = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${productId}/chat`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Échec du chargement des messages", err);
    }
  };

  const launchOrchestration = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";

      // Fetch current actions to check if any are validated
      const actionsRes = await fetch(`${apiUrl}/api/projects/${productId}/actions`);
      const actionsData = await actionsRes.json();
      const approvedCount = (actionsData.actions || []).filter(
        (a: any) => a.status === "approved"
      ).length;

      if (approvedCount === 0 && validatedActions === 0) {
        alert(
          "⚠️ Aucune action validée par Claude\n\nAffinez d'abord votre produit avec Claude et validez ses recommandations avant de lancer le CEO."
        );
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/api/projects/${productId}/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validatedActions: approvedCount,
          fromClaude: approvedCount > 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          "🚀 CEO Agent a lancé l'orchestration !\n\nLes agents spécialisés sont maintenant actifs et travaillent sur votre produit."
        );
        fetchProduct();
      } else {
        alert(`❌ Erreur: ${data.error || "Impossible de lancer l'orchestration"}`);
      }
    } catch (err) {
      console.error("Erreur orchestration", err);
      alert("Erreur lors du lancement de l'orchestration");
    } finally {
      setLoading(false);
    }
  };

  const handleActionValidated = (actionId: string, status: string) => {
    if (status === "approved") {
      setValidatedActions((prev) => prev + 1);
    }
  };

  const handleDecision = async (messageId: string, option: string) => {
    try {
      setDecidingMessageId(messageId);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";

      const res = await fetch(`${apiUrl}/api/projects/${productId}/agent-rebrief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: "product-manager",
          action: option,
          context: {
            userDecision: option,
            messageId,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Add confirmation message
        const confirmMessage: Message = {
          role: "assistant",
          message: `✅ Décision enregistrée: **${option.replace(/_/g, " ")}**\n\nLe CEO va re-briefer les agents concernés avec cette nouvelle direction.`,
          timestamp: new Date().toISOString(),
          messageId: `confirm-${Date.now()}`,
        };
        setMessages((prev) => [...prev, confirmMessage]);
      }
    } catch (err) {
      console.error("Decision error:", err);
      alert("❌ Erreur lors de la validation de la décision");
    } finally {
      setDecidingMessageId(null);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${productId}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Échec du chargement du produit", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const messageText = input;
    const userMessage: Message = {
      role: "user",
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${productId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      // Extract decision from message if present
      const decision = extractDecision(data.message);
      const cleanMessage = stripDecisionFromMessage(data.message);

      const assistantMessage: Message = {
        role: "assistant",
        message: cleanMessage,
        timestamp: new Date().toISOString(),
        hasDecision: !!decision,
        decision: decision || undefined,
        messageId: `msg-${Date.now()}`,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Échec de l'envoi du message", err);
      const errorMessage: Message = {
        role: "assistant",
        message: "Désolé, je n'ai pas pu traiter votre message. Veuillez réessayer.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement du produit...</div>;
  if (!product) return <div className="error">Produit non trouvé</div>;

  return (
    <div className="product-page">
      <div className="product-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>{product.name}</h1>
            <div className="phase-info">
              <span className="phase">{getPhaseLabel(product.status)}</span>
              <span className="date">Créé : {formatDate(product.created_at)}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {validatedActions > 0 && (
              <p style={{
                fontSize: "0.85rem",
                color: "var(--success)",
                margin: "0",
                textAlign: "right",
              }}>
                ✅ {validatedActions} action{validatedActions > 1 ? "s" : ""} validée{validatedActions > 1 ? "s" : ""}
              </p>
            )}
            <button
              onClick={launchOrchestration}
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: validatedActions > 0
                  ? "linear-gradient(135deg, #00f5a0, #00d9ff)"
                  : "linear-gradient(135deg, #00d9ff, #ff006e)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                opacity: loading ? 0.6 : 1,
              }}
            >
              🚀 {loading ? "Orchestration..." : "Lancer CEO"}
            </button>
          </div>
        </div>
      </div>

      {/* Affiner le projet avant lancement */}
      <ProjectRefinement
        projectId={productId}
        projectName={product.name}
        description={product.description}
        targetUsers={product.target_users}
        problem={product.problem}
      />

      {/* Graphe des Agents - En Temps Réel */}
      <AgentGraph
        projectId={productId}
        projectName={product.name}
      />

      {/* Actions à Valider */}
      <ValidationPanel
        projectId={productId}
        onActionValidated={handleActionValidated}
      />

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Bienvenue ! Discutez avec Claude à propos de ce produit.</p>
              <p>Demandez une validation du marché, un retour sur la conception, ou toute décision sur laquelle vous avez besoin de conseils.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className={`message-content`}>{msg.message}</div>
              {msg.hasDecision && msg.decision && (
                <div className="decision-box">
                  <p className="decision-action">
                    <strong>❓ {msg.decision.action}</strong>
                  </p>
                  <div className="decision-buttons">
                    {msg.decision.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          handleDecision(msg.messageId || `msg-${idx}`, opt)
                        }
                        disabled={decidingMessageId === msg.messageId}
                        className={`decision-btn ${opt.toLowerCase()}`}
                      >
                        {decidingMessageId === msg.messageId ? "⏳..." : opt.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {chatLoading && (
            <div className="message assistant">
              <div className="message-content">Claude réfléchit...</div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question à Claude..."
            disabled={chatLoading}
          />
          <button type="submit" className="primary" disabled={chatLoading || !input.trim()}>
            {chatLoading ? "..." : "Envoyer"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .product-page {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 150px);
        }

        .product-header {
          margin-bottom: 20px;
        }

        .product-header h1 {
          margin-bottom: 10px;
        }

        .phase-info {
          display: flex;
          gap: 20px;
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .phase {
          background-color: var(--bg-alt);
          padding: 5px 12px;
          border-radius: 20px;
          font-weight: 600;
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          background-color: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .welcome-message {
          text-align: center;
          color: var(--text-light);
          padding: 40px 20px;
        }

        .message {
          display: flex;
          margin-bottom: 10px;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 8px;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .message.user .message-content {
          background-color: var(--primary);
          color: white;
        }

        .message.assistant .message-content {
          background-color: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .chat-form {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-top: 1px solid var(--border);
        }

        .chat-form input {
          flex: 1;
          margin-bottom: 0;
        }

        .chat-form button {
          padding: 10px 20px;
        }

        .decision-box {
          margin-top: 12px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(0, 245, 160, 0.1), rgba(0, 217, 255, 0.1));
          border: 2px solid var(--primary);
          border-radius: 8px;
          margin-left: -4px;
        }

        .decision-action {
          margin: 0 0 10px 0;
          font-size: 0.95rem;
          color: var(--text);
        }

        .decision-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .decision-btn {
          padding: 10px 16px;
          border: 1px solid var(--primary);
          border-radius: 6px;
          background: transparent;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          text-transform: capitalize;
        }

        .decision-btn:hover:not(:disabled) {
          background: var(--primary);
          color: white;
          transform: translateX(4px);
        }

        .decision-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .decision-btn.oui_test_99:hover:not(:disabled),
        .decision-btn.yes_test_99:hover:not(:disabled) {
          background: linear-gradient(135deg, #00f5a0, #00d9ff);
          border-color: #00f5a0;
        }

        .decision-btn.continuer_49_seul:hover:not(:disabled),
        .decision-btn.continue_49_only:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff006e, #ff0080);
          border-color: #ff006e;
        }
      `}</style>
    </div>
  );
}
