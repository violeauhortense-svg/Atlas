"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getPhaseLabel, formatDate } from "@/lib/utils";
import AgentGraph from "@/components/AgentGraph";
import ValidationPanel from "@/components/ValidationPanel";
import ProjectRefinement from "@/components/ProjectRefinement";

interface Message {
  role: "user" | "assistant";
  message: string;
  timestamp?: string;
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

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [validatedActions, setValidatedActions] = useState<number>(0);
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
      
      const assistantMessage: Message = {
        role: "assistant",
        message: data.message,
        timestamp: new Date().toISOString(),
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
              <div className={`message-content`}>
                {msg.message}
              </div>
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
      `}</style>
    </div>
  );
}
