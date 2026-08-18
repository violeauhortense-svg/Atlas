"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getPhaseLabel, formatDate } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  message: string;
  timestamp?: string;
}

interface ProductData {
  product_id: string;
  name: string;
  status: string;
  created_date: string;
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
  }, [productId]);

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
      console.error("Failed to load product", err);
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
      console.error("Failed to send message", err);
      const errorMessage: Message = {
        role: "assistant",
        message: "Sorry, I couldn't process your message. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-page">
      <div className="product-header">
        <h1>{product.name}</h1>
        <div className="phase-info">
          <span className="phase">{getPhaseLabel(product.status)}</span>
          <span className="date">Created: {formatDate(product.created_date)}</span>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Welcome! Chat with Claude about this product.</p>
              <p>Ask for market validation, design feedback, or any decisions you need guidance on.</p>
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
              <div className="message-content">Claude is thinking...</div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Claude for guidance..."
            disabled={chatLoading}
          />
          <button type="submit" className="primary" disabled={chatLoading || !input.trim()}>
            {chatLoading ? "..." : "Send"}
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
