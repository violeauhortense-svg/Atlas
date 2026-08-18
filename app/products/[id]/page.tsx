"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getPhaseLabel, formatDate, getAgentsForPhase } from "@/lib/utils";
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
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
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
      const res = await fetch(`${apiUrl}/api/projects/${productId}/orchestrate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert("🚀 CEO Agent a lancé l'orchestration ! Les agents sont maintenant actifs !");
        fetchProduct();
      }
    } catch (err) {
      console.error("Erreur orchestration", err);
      alert("Erreur lors du lancement de l'orchestration");
    } finally {
      setLoading(false);
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
          <button
            onClick={launchOrchestration}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #00d9ff, #ff006e)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            🚀 {loading ? "Orchestration..." : "Lancer CEO"}
          </button>
        </div>
      </div>

      {/* Affiner le projet avant lancement */}
      <ProjectRefinement projectId={productId} projectName={product.name} />

      {/* Graphe des Agents */}
      <AgentGraph
        agents={getAgentsForPhase(product.status).map((agent, idx) => ({
          id: `agent-${idx}`,
          name: agent.name,
          role: agent.task,
          status: idx % 3 === 0 ? 'active' : idx % 3 === 1 ? 'completed' : 'idle',
          tasks: [agent.task],
          subAgents: []
        }))}
        projectName={product.name}
      />

      {/* Actions à Valider */}
      <ValidationPanel
        projectId={productId}
        actions={[
          {
            id: 'action-1',
            agent: 'Market Researcher',
            title: 'Validation de marché',
            description: 'Confirmation que le marché cible a été validé avec 10+ entretiens clients',
            status: 'pending',
            priority: 'high',
            createdAt: new Date().toLocaleDateString('fr-FR'),
            details: { interviews: 12, satisfaction: '92%' }
          }
        ]}
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
