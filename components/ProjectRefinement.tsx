"use client";

import { useState, useEffect } from "react";

interface RefinementProps {
  projectId: string;
  projectName: string;
  description?: string;
  targetUsers?: string;
  problem?: string;
  onRefined?: (refinedBrief: string) => void;
}

export default function ProjectRefinement({
  projectId,
  projectName,
  description,
  targetUsers,
  problem,
  onRefined,
}: RefinementProps) {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refinedBrief, setRefinedBrief] = useState("");

  // Load chat history on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
        const res = await fetch(`${apiUrl}/api/projects/${projectId}/chat`);
        const data = await res.json();

        if (data.messages && Array.isArray(data.messages)) {
          const formattedMessages = data.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.message,
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    loadMessages();
  }, [projectId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `PROJECT DETAILS:
Name: ${projectName}
Description: ${description || 'Not provided'}
Target Users: ${targetUsers || 'Not provided'}
Problem Solved: ${problem || 'Not provided'}

USER FEEDBACK: ${userMessage}

INSTRUCTIONS: Respond with a SHORT, STRUCTURED synthesis (max 150 words). Format:
- Key insight (1 line)
- 3 actionable recommendations
- One critical question to clarify`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "claude", content: data.message },
        ]);
        setRefinedBrief(data.message);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "claude",
            content: `❌ Erreur: ${data.details || data.error}`,
          },
        ]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "claude",
          content: "❌ Erreur de communication avec Claude",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refinement-panel">
      <div className="refinement-header">
        <h3>💬 Affiner le projet avec Claude</h3>
        <p>Discutez avec Claude pour améliorer votre brief produit avant de lancer le CEO</p>
      </div>

      <div className="refinement-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>💡 Posez vos questions à Claude :</p>
            <ul>
              <li>Comment améliorer cette idée ?</li>
              <li>Quel est le marché cible idéal ?</li>
              <li>Quels features sont essentielles ?</li>
              <li>Comment me différencier des concurrents ?</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-badge">
              {msg.role === "user" ? "👤" : "🤖"}
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="message claude">
            <div className="message-badge">🤖</div>
            <div className="message-content">Claude réfléchit...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="refinement-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez comment améliorer ce produit..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? "..." : "Envoyer 📤"}
        </button>
      </form>

      {refinedBrief && (
        <div className="refined-brief">
          <h4>📋 Recommandations Claude</h4>
          <p>{refinedBrief}</p>
        </div>
      )}

      <style jsx>{`
        .refinement-panel {
          background: var(--bg-alt);
          border: 2px solid var(--border-accent);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .refinement-header {
          margin-bottom: 20px;
        }

        .refinement-header h3 {
          margin: 0 0 8px 0;
          font-size: 1.2rem;
        }

        .refinement-header p {
          margin: 0;
          color: var(--text-light);
          font-size: 0.95rem;
        }

        .refinement-messages {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .welcome-message {
          text-align: center;
          color: var(--text-light);
        }

        .welcome-message ul {
          text-align: left;
          list-style: none;
          padding: 0;
          margin: 10px 0 0 0;
        }

        .welcome-message li {
          padding: 4px 0;
          font-size: 0.9rem;
        }

        .message {
          display: flex;
          gap: 12px;
          animation: slideIn 0.3s ease-out;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.claude {
          justify-content: flex-start;
        }

        .message-badge {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 8px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, var(--primary), #00a8cc);
          color: white;
        }

        .message.claude .message-content {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: #ffffff;
          font-weight: 500;
        }

        .refinement-form {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .refinement-form input {
          flex: 1;
          padding: 12px 16px;
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .refinement-form input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }

        .refinement-form button {
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--primary), #00a8cc);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refinement-form button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
        }

        .refinement-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .refined-brief {
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(255, 0, 110, 0.05));
          border: 2px solid var(--border-accent);
          border-radius: 8px;
          padding: 16px;
        }

        .refined-brief h4 {
          margin: 0 0 12px 0;
          color: var(--primary);
          font-size: 1rem;
        }

        .refined-brief p {
          margin: 0;
          color: var(--text);
          line-height: 1.6;
        }

        @keyframes slideIn {
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
