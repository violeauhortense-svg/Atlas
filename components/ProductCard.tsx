"use client";

import Link from "next/link";
import { useState } from "react";
import { getStatusBadge, getPhaseProgress, getAgentsForPhase } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    status: string;
    created_at: string;
  };
  onDelete?: (productId: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const [deleting, setDeleting] = useState(false);
  const progress = getPhaseProgress(product.status);
  const statusBadge = getStatusBadge(product.status);
  const agents = getAgentsForPhase(product.status);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      return;
    }

    setDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atlas-1-mu.vercel.app";
      const res = await fetch(`${apiUrl}/api/projects/${product.id}`, {
        method: "DELETE",
      });

      if (res.ok && onDelete) {
        onDelete(product.id);
      }
    } catch (err) {
      console.error("Erreur de suppression", err);
      alert("Impossible de supprimer le produit");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card" style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", position: "relative" }}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = "translateY(-4px)";
             e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = "translateY(0)";
             e.currentTarget.style.boxShadow = "var(--shadow)";
           }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
          <h3 style={{ margin: 0 }}>{product.name}</h3>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="delete-btn"
            title="Supprimer ce projet"
          >
            {deleting ? "..." : "✕"}
          </button>
        </div>

        <div style={{ marginTop: "10px", marginBottom: "15px" }}>
          <span className={`badge ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <small style={{ color: "var(--text-light)" }}>
          Progression : {progress}%
        </small>

        {agents.length > 0 && (
          <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid var(--border)" }}>
            <p style={{ marginBottom: "8px", fontSize: "0.85rem", fontWeight: "600", color: "var(--text)" }}>
              🤖 Agents actifs :
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {agents.map((agent, idx) => (
                <div key={idx} style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                  <span style={{ color: "var(--primary)", fontWeight: "500" }}>{agent.name}</span>
                  <br />
                  {agent.task}
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "var(--text-light)" }}>
          Créé : {new Date(product.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <style jsx>{`
        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: var(--bg);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0070f3, #0051cc);
          transition: width 0.3s ease;
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px 8px;
          transition: color 0.2s, transform 0.2s;
        }

        .delete-btn:hover:not(:disabled) {
          color: #ff6b6b;
          transform: scale(1.2);
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </Link>
  );
}
